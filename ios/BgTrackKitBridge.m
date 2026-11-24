#import "BgTrackKitBridge.h"

#import <BgTrackKit/BgTrackKit-Swift.h>

@implementation BgTrackKitBridge

+ (void)handleBackgroundURLSession:(NSString *)identifier
                        completion:(void (^)(void))completion
{
  [BGTrackingController.shared handleBackgroundURLSession:identifier completion:completion];
}

@end
