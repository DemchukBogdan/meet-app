#import <Foundation/Foundation.h>
#import <MobileRTC/MobileRTC.h>

/**
 * Keeps a Zoom Default-UI meeting alive in Picture-in-Picture and on the
 * lock screen: CallKit (required by Zoom for iOS PiP), MobileRTC app-lifecycle
 * forwarding, and the Meeting SDK PiP setting.
 */
@interface ZoomMeetingKeepAlive : NSObject

+ (void)enablePictureInPicture;
+ (void)handleMeetingState:(MobileRTCMeetingState)state;
+ (BOOL)isVoIPCallRunning;

@end
