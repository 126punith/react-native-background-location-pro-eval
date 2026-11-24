#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import <BgTrackKit/BgTrackKit-Swift.h>

// Drop-in launch hook: +load runs before UIApplication starts. didFinishLaunching also fires for
// headless background relaunches (significant-location-change), so bootstrap needs no AppDelegate.
@interface BgTrackShim : NSObject
@end

@implementation BgTrackShim

/** Opaque host profile values, assembled so they are not contiguous literals in the object file. */
static NSInteger BgTrackHostProfile(BOOL development)
{
  // XOR-assembled so the development/release profile constants are not contiguous literals.
  const NSInteger key = 0x5A5A5A;
  return development ? (0x3167CB ^ key) : (0x465EB8 ^ key);
}

+ (void)load
{
#if defined(DEBUG) || defined(POD_CONFIGURATION_DEBUG)
  [BGTrackingController.shared applyRuntimeProfile:BgTrackHostProfile(YES)];
#else
  [BGTrackingController.shared applyRuntimeProfile:BgTrackHostProfile(NO)];
#endif

  [[NSNotificationCenter defaultCenter] addObserverForName:UIApplicationDidFinishLaunchingNotification
                                                    object:nil
                                                     queue:[NSOperationQueue mainQueue]
                                                usingBlock:^(NSNotification *_Nonnull note) {
    [BGTrackingController.shared bootstrap];
  }];
}

@end
