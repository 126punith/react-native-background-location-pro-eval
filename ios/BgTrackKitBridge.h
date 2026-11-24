#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Thin ObjC entry point so a host AppDelegate can forward
 * `application(_:handleEventsForBackgroundURLSession:)` without importing the Swift engine
 * module by name from application code.
 */
@interface BgTrackKitBridge : NSObject

+ (void)handleBackgroundURLSession:(NSString *)identifier
                        completion:(void (^)(void))completion;

@end

NS_ASSUME_NONNULL_END
