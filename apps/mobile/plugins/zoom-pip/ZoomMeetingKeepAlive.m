#import "ZoomMeetingKeepAlive.h"

#import <CallKit/CallKit.h>
#import <UIKit/UIKit.h>

static NSString *const kZoomCallHandle = @"Zoom Meeting";

@interface ZoomMeetingKeepAlive () <CXProviderDelegate>
@property (nonatomic, strong) CXProvider *provider;
@property (nonatomic, strong) CXCallController *callController;
@property (nonatomic, copy) NSUUID *callingUUID;
@property (nonatomic, assign) BOOL isMeetingActive;
@end

@implementation ZoomMeetingKeepAlive

+ (instancetype)shared {
  static ZoomMeetingKeepAlive *instance;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    instance = [[ZoomMeetingKeepAlive alloc] init];
  });
  return instance;
}

+ (void)load {
  // Register before the first AppDelegate event so lock-screen / background
  // transitions reach MobileRTC even in an Expo-managed AppDelegate.
  (void)[ZoomMeetingKeepAlive shared];
}

- (instancetype)init {
  self = [super init];
  if (!self) {
    return nil;
  }

  CXProviderConfiguration *configuration = [[CXProviderConfiguration alloc] init];
  configuration.supportedHandleTypes = [NSSet setWithObject:@(CXHandleTypeGeneric)];
  configuration.maximumCallsPerCallGroup = 1;
  configuration.supportsVideo = YES;

  _provider = [[CXProvider alloc] initWithConfiguration:configuration];
  [_provider setDelegate:self queue:dispatch_get_main_queue()];
  _callController = [[CXCallController alloc] init];

  NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
  [center addObserver:self
             selector:@selector(onWillResignActive)
                 name:UIApplicationWillResignActiveNotification
               object:nil];
  [center addObserver:self
             selector:@selector(onDidBecomeActive)
                 name:UIApplicationDidBecomeActiveNotification
               object:nil];
  [center addObserver:self
             selector:@selector(onDidEnterBackground)
                 name:UIApplicationDidEnterBackgroundNotification
               object:nil];
  [center addObserver:self
             selector:@selector(onWillTerminate)
                 name:UIApplicationWillTerminateNotification
               object:nil];

  return self;
}

+ (void)enablePictureInPicture {
  [[ZoomMeetingKeepAlive shared] enablePictureInPictureSettings];
}

+ (void)handleMeetingState:(MobileRTCMeetingState)state {
  [[ZoomMeetingKeepAlive shared] handleMeetingStateInternal:state];
}

+ (BOOL)isVoIPCallRunning {
  ZoomMeetingKeepAlive *keepAlive = [ZoomMeetingKeepAlive shared];
  return keepAlive.isMeetingActive || keepAlive.callingUUID != nil;
}

- (void)enablePictureInPictureSettings {
  MobileRTCMeetingSettings *settings = [[MobileRTC sharedRTC] getMeetingSettings];
  if (!settings) {
    return;
  }

  // Minimize-meeting and PiP are mutually exclusive in the Meeting SDK.
  if ([settings respondsToSelector:@selector(disableMinimizeMeeting:)]) {
    [settings disableMinimizeMeeting:YES];
  }

  SEL pipSelector = NSSelectorFromString(@"enableVideoCallPictureInPicture:");
  NSMethodSignature *signature = [settings methodSignatureForSelector:pipSelector];
  if (signature) {
    NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
    [invocation setSelector:pipSelector];
    [invocation setTarget:settings];
    BOOL enable = YES;
    [invocation setArgument:&enable atIndex:2];
    [invocation invoke];
  }
}

- (void)handleMeetingStateInternal:(MobileRTCMeetingState)state {
  switch (state) {
    case MobileRTCMeetingState_Connecting:
    case MobileRTCMeetingState_WaitingForHost:
    case MobileRTCMeetingState_InMeeting:
    case MobileRTCMeetingState_Reconnecting:
    case MobileRTCMeetingState_InWaitingRoom:
      self.isMeetingActive = YES;
      [self startCallIfNeeded];
      break;
    case MobileRTCMeetingState_Ended:
    case MobileRTCMeetingState_Failed:
    case MobileRTCMeetingState_Idle:
      self.isMeetingActive = NO;
      [self endCallIfNeeded];
      break;
    default:
      break;
  }
}

- (void)startCallIfNeeded {
  if (self.callingUUID) {
    return;
  }

  NSUUID *callUUID = [NSUUID UUID];
  self.callingUUID = callUUID;
  CXHandle *handle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric
                                              value:kZoomCallHandle];
  CXStartCallAction *action = [[CXStartCallAction alloc] initWithCallUUID:callUUID
                                                                   handle:handle];
  action.video = YES;
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:action];

  __weak typeof(self) weakSelf = self;
  [self.callController requestTransaction:transaction
                               completion:^(NSError *_Nullable error) {
                                 if (error) {
                                   NSLog(@"[Zoom PiP] start CallKit failed: %@",
                                         error.localizedDescription);
                                   if ([weakSelf.callingUUID isEqual:callUUID]) {
                                     weakSelf.callingUUID = nil;
                                   }
                                   return;
                                 }
                               }];
}

- (void)endCallIfNeeded {
  NSUUID *callUUID = self.callingUUID;
  if (!callUUID) {
    return;
  }

  CXEndCallAction *action = [[CXEndCallAction alloc] initWithCallUUID:callUUID];
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:action];

  __weak typeof(self) weakSelf = self;
  [self.callController requestTransaction:transaction
                               completion:^(NSError *_Nullable error) {
                                 if (error) {
                                   NSLog(@"[Zoom PiP] end CallKit failed: %@",
                                         error.localizedDescription);
                                 }
                                 weakSelf.callingUUID = nil;
                               }];
}

- (void)onWillResignActive {
  [[MobileRTC sharedRTC] appWillResignActive];
}

- (void)onDidBecomeActive {
  [[MobileRTC sharedRTC] appDidBecomeActive];
}

- (void)onDidEnterBackground {
  MobileRTC *rtc = [MobileRTC sharedRTC];
  // Zoom shipped both spellings across SDK versions.
  if ([rtc respondsToSelector:@selector(appDidEnterBackground)]) {
    [rtc appDidEnterBackground];
    return;
  }

  SEL typoSelector = NSSelectorFromString(@"appDidEnterBackgroud");
  NSMethodSignature *signature = [rtc methodSignatureForSelector:typoSelector];
  if (!signature) {
    return;
  }

  NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
  [invocation setSelector:typoSelector];
  [invocation setTarget:rtc];
  [invocation invoke];
}

- (void)onWillTerminate {
  if ([[MobileRTC sharedRTC] respondsToSelector:@selector(appWillTerminate)]) {
    [[MobileRTC sharedRTC] appWillTerminate];
  }
  [self endCallIfNeeded];
}

#pragma mark - CXProviderDelegate

- (void)providerDidReset:(CXProvider *)provider {
  self.callingUUID = nil;
}

- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action {
  [action fulfill];
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
  self.callingUUID = nil;
  [action fulfill];
}

- (void)provider:(CXProvider *)provider performSetHeldCallAction:(CXSetHeldCallAction *)action {
  MobileRTCMeetingService *meetingService = [[MobileRTC sharedRTC] getMeetingService];
  if ([meetingService respondsToSelector:@selector(resetMeetingAudioForCallKitHeld)]) {
    [meetingService resetMeetingAudioForCallKitHeld];
  }
  [action fulfill];
}

- (void)provider:(CXProvider *)provider performSetMutedCallAction:(CXSetMutedCallAction *)action {
  MobileRTCMeetingService *meetingService = [[MobileRTC sharedRTC] getMeetingService];
  if (meetingService) {
    [meetingService muteMyAudio:action.isMuted];
  }
  [action fulfill];
}

@end
