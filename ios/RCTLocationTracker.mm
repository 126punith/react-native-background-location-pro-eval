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
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared startTracking:serverUrl
                                     resolve:resolve
                                      reject:^(NSString *code, NSString *message) {
                                        reject(code, message, nil);
                                      }];
}

- (void)stopTracking:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared stopTracking:resolve
                                     reject:^(NSString *code, NSString *message) {
                                       reject(code, message, nil);
                                     }];
}

- (NSDictionary *)getStatus
{
  return [BGTrackingController.shared status];
}

- (void)syncNow:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared syncNow:resolve
                                reject:^(NSString *code, NSString *message) {
                                  reject(code, message, nil);
                                }];
}

- (void)setDemoMode:(BOOL)enabled
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared setDemoMode:enabled
                                   resolve:resolve
                                    reject:^(NSString *code, NSString *message) {
                                      reject(code, message, nil);
                                    }];
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
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared setTrackingProfile:profile
                                          resolve:resolve
                                           reject:^(NSString *code, NSString *message) {
                                             reject(code, message, nil);
                                           }];
}

- (void)setMotionPermissionOptIn:(BOOL)enabled
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared setMotionPermissionOptIn:enabled
                                                 resolve:resolve
                                                  reject:^(NSString *code, NSString *message) {
                                                    reject(code, message, nil);
                                                  }];
}

- (void)setSyncPolicy:(double)batchSize
         maxBackoffMs:(double)maxBackoffMs
          maxAttempts:(double)maxAttempts
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared setSyncPolicy:batchSize
                                maxBackoffMs:maxBackoffMs
                                 maxAttempts:maxAttempts
                                     resolve:resolve
                                      reject:^(NSString *code, NSString *message) {
                                        reject(code, message, nil);
                                      }];
}

- (void)getCurrentPosition:(double)timeoutMs
              maximumAgeMs:(double)maximumAgeMs
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared getCurrentPosition:timeoutMs
                                     maximumAgeMs:maximumAgeMs
                                          resolve:^(NSDictionary *position) {
                                            resolve(position);
                                          }
                                           reject:^(NSString *code, NSString *message) {
                                             reject(code, message, nil);
                                           }];
}

- (void)getQueueStats:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve([BGTrackingController.shared queueStats]);
}

- (void)getLocations:(NSString *)status
               limit:(double)limit
              offset:(double)offset
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  resolve([BGTrackingController.shared locations:status limit:limit offset:offset]);
}

- (void)destroyLocations:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve(@([BGTrackingController.shared destroyLocations]));
}

- (void)setPersistencePolicy:(double)maxDaysToPersist
         maxRecordsToPersist:(double)maxRecordsToPersist
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared setPersistencePolicy:maxDaysToPersist
                                maxRecordsToPersist:maxRecordsToPersist
                                            resolve:resolve
                                             reject:^(NSString *code, NSString *message) {
                                               reject(code, message, nil);
                                             }];
}

- (void)setHttpConfig:(NSDictionary *)config
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared setHttpConfig:config
                                     resolve:resolve
                                      reject:^(NSString *code, NSString *message) {
                                        reject(code, message, nil);
                                      }];
}

- (void)validateServerUrl:(NSString *)url
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared validateServerUrl:url resolve:resolve];
}

- (NSNumber *)getOdometer
{
  return @([BGTrackingController.shared odometer]);
}

- (void)resetOdometer:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared resetOdometer:resolve
                                      reject:^(NSString *code, NSString *message) {
                                        reject(code, message, nil);
                                      }];
}

- (void)addGeofences:(NSArray *)geofences
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared addGeofences:geofences
                                    resolve:^(NSNumber *total) {
                                      resolve(total);
                                    }
                                     reject:^(NSString *code, NSString *message) {
                                       reject(code, message, nil);
                                     }];
}

- (void)removeGeofences:(NSArray *)identifiers
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared removeGeofences:identifiers
                                       resolve:^(NSNumber *removed) {
                                         resolve(removed);
                                       }];
}

- (void)getGeofences:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared getGeofences:^(NSArray *geofences) {
    resolve(geofences);
  }];
}

- (void)setSchedule:(NSArray *)schedule
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared setSchedule:schedule
                                   resolve:resolve
                                    reject:^(NSString *code, NSString *message) {
                                      reject(code, message, nil);
                                    }];
}

- (void)startSchedule:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared startSchedule:resolve
                                      reject:^(NSString *code, NSString *message) {
                                        reject(code, message, nil);
                                      }];
}

- (void)stopSchedule:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared stopSchedule:resolve
                                     reject:^(NSString *code, NSString *message) {
                                       reject(code, message, nil);
                                     }];
}

- (void)getDiagnostics:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared getDiagnostics:resolve];
}

- (void)setVerboseLogging:(BOOL)enabled
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  [BGTrackingController.shared setVerboseLogging:enabled
                                         resolve:resolve
                                          reject:^(NSString *code, NSString *message) {
                                            reject(code, message, nil);
                                          }];
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

- (void)onHttp:(NSDictionary *)event
{
  [self emitOnHttp:event];
}

- (void)onProviderChange:(NSDictionary *)event
{
  [self emitOnProviderChange:event];
}

- (void)onGeofence:(NSDictionary *)event
{
  [self emitOnGeofence:event];
}

- (void)onTrackingStateChange:(NSDictionary *)event
{
  [self emitOnTrackingStateChange:event];
}

- (void)onConfigChange:(NSDictionary *)event
{
  [self emitOnConfigChange:event];
}

- (void)onScheduleEdge:(NSDictionary *)event
{
  [self emitOnScheduleEdge:event];
}

@end
