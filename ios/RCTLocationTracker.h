#import <NativeLocationTrackerSpec/NativeLocationTrackerSpec.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * JSI TurboModule `LocationTracker`. JS only steers and observes; the pipeline runs in
 * Swift (TrackingController / LocationEngine) whether or not this module exists.
 */
@interface RCTLocationTracker : NativeLocationTrackerSpecBase <NativeLocationTrackerSpec>
@end

NS_ASSUME_NONNULL_END
