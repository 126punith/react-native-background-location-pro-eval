#import "RCTLocationTracker.h"

#import <CoreLocation/CoreLocation.h>
#import <UIKit/UIKit.h>

// Generated ObjC interface for the precompiled engine, shipped inside BgTrackKit.xcframework.
#import <BgTrackKit/BgTrackKit-Swift.h>

@interface RCTLocationTracker () <BGTrackingEventSink>
@end

@implementation RCTLocationTracker

RCT_EXPORT_MODULE(LocationTracker)

- (void)setEventEmitterCallback:(EventEmitterCallbackWrapper *)eventEmitterCallbackWrapper
{
  [super setEventEmitterCallback:eventEmitterCallbackWrapper];
  [BGTrackingController.shared attach:self];
}

- (void)invalidate
{
  [BGTrackingController.shared detach:self];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeLocationTrackerSpecJSI>(params);
}

- (void)startTracking:(NSString *)serverUrl
{
  [BGTrackingController.shared startTracking:serverUrl];
}

- (void)stopTracking
{
  [BGTrackingController.shared stopTracking];
}

- (NSDictionary *)getStatus
{
  return [BGTrackingController.shared status];
}

- (void)syncNow
{
  [BGTrackingController.shared syncNow];
}

- (void)setDemoMode:(BOOL)enabled
{
  [BGTrackingController.shared setDemoMode:enabled];
}

- (void)requestIgnoreBatteryOptimizations
{
  [BGTrackingController.shared openSettings];
}

- (void)openExactAlarmSettings
{
  [BGTrackingController.shared openSettings];
}

- (void)requestLocationPermission:(BOOL)always
{
  [BGTrackingController.shared requestLocationPermission:always];
}

- (void)setTrackingProfile:(NSString *)profile
{
  [BGTrackingController.shared setTrackingProfile:profile];
}

- (void)setMotionPermissionOptIn:(BOOL)enabled
{
  [BGTrackingController.shared setMotionPermissionOptIn:enabled];
}

- (void)setSyncPolicy:(double)batchSize maxBackoffMs:(double)maxBackoffMs maxAttempts:(double)maxAttempts
{
  [BGTrackingController.shared setSyncPolicy:batchSize maxBackoffMs:maxBackoffMs maxAttempts:maxAttempts];
}

#pragma mark - BGTrackingEventSink

- (void)onLocationUpdate:(NSDictionary *)event
{
  [self emitOnLocationUpdate:event];
}

- (void)onSyncStatus:(NSDictionary *)event
{
  [self emitOnSyncStatus:event];
}

@end
