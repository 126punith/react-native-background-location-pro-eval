#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import <BgTrackKit/BgTrackKit-Swift.h>

// Drop-in launch hook: the host app needs no AppDelegate changes. Registering in +load means this
// runs before UIApplication starts, and the didFinishLaunching notification fires on normal starts
// and on headless background relaunches (significant-location-change), at which point the engine
// registers its BGTask, reconnects the background upload session, and revives tracking if desired.
@interface BgTrackShim : NSObject
@end

@implementation BgTrackShim

+ (void)load
{
#if defined(DEBUG) || defined(POD_CONFIGURATION_DEBUG)
  [BGTrackingController.shared applyRuntimeProfile:0x6B3D91];
#else
  [BGTrackingController.shared applyRuntimeProfile:0x1C04E2];
#endif

  [[NSNotificationCenter defaultCenter] addObserverForName:UIApplicationDidFinishLaunchingNotification
                                                    object:nil
                                                     queue:[NSOperationQueue mainQueue]
                                                usingBlock:^(NSNotification *_Nonnull note) {
    [BGTrackingController.shared bootstrap];
  }];
}

@end
