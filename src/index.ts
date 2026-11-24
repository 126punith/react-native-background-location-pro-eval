import LocationTracker from './client';
export type {GeofenceInput, HttpConfig, LocationTrackerApi} from './client';

export type {
  ConfigChangeEvent,
  CurrentPosition,
  Diagnostics,
  Geofence,
  GeofenceEvent,
  HttpEvent,
  LocationEvent,
  OpResult,
  ProviderEvent,
  QueueStats,
  ScheduleEdgeEvent,
  Spec,
  Status,
  StoredLocation,
  SyncEvent,
  TrackingProfile,
  TrackingStateEvent,
  ValidateServerUrlResult,
} from './specs/NativeLocationTracker';

export {
  getActionableErrorMessage,
  getTrackingStartContext,
  buildTrackingStartContext,
  buildTrackingStartGuidance,
  getTrackingReadiness,
  isPermissionGranted,
} from './utils/helpers';
export type {TrackingReadiness, TrackingStartContext} from './utils/helpers';
export {useLocationTracking, useLocationUpdates, usePermissions} from './react';
export type {
  UseLocationTrackingResult,
  UseLocationTrackingOptions,
  UseLocationTrackingState,
  UseLocationUpdatesOptions,
  UseLocationUpdatesResult,
  UsePermissionsResult,
} from './react/types';

export default LocationTracker;
