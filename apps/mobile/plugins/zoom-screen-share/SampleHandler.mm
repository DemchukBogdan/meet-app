#import "SampleHandler.h"
#if __has_include(<MobileRTCScreenShare/MobileRTCScreenShareService.h>)
#import <MobileRTCScreenShare/MobileRTCScreenShareService.h>
#else
#import "MobileRTCScreenShareService.h"
#endif

@interface SampleHandler () <MobileRTCScreenShareServiceDelegate>

@property (strong, nonatomic) MobileRTCScreenShareService *screenShareService;

@end

@implementation SampleHandler

- (instancetype)init {
  self = [super init];
  if (self) {
    MobileRTCScreenShareService *service = [[MobileRTCScreenShareService alloc] init];
    self.screenShareService = service;
    // Replaced at prebuild with the App Group shared by the main app and this extension.
    self.screenShareService.appGroup = @"__ZOOM_APP_GROUP_ID__";
    self.screenShareService.delegate = self;
  }
  return self;
}

- (void)broadcastStartedWithSetupInfo:(NSDictionary<NSString *, NSObject *> *)setupInfo {
  [self.screenShareService broadcastStartedWithSetupInfo:setupInfo];
}

- (void)broadcastPaused {
  [self.screenShareService broadcastPaused];
}

- (void)broadcastResumed {
  [self.screenShareService broadcastResumed];
}

- (void)broadcastFinished {
  [self.screenShareService broadcastFinished];
}

- (void)processSampleBuffer:(CMSampleBufferRef)sampleBuffer
                   withType:(RPSampleBufferType)sampleBufferType {
  [self.screenShareService processSampleBuffer:sampleBuffer withType:sampleBufferType];
}

- (void)MobileRTCScreenShareServiceFinishBroadcastWithError:(NSError *)error {
  [self finishBroadcastWithError:error];
}

@end
