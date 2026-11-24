import Native from './specs/NativeLocationTracker';
import type {Geofence, Spec} from './specs/NativeLocationTracker';

export type HttpConfig = {
  /** Appended to the server URL. Default `/api/location/track`. */
  path?: string;
  /** Sent with every upload. `Content-Type`, `Idempotency-Key` and `X-Device-Id` cannot be overridden. */
  headers?: Record<string, string>;
  /** Extra top-level JSON fields in every upload body. `deviceId`, `batchId`, `sentAt` and `points` win. */
  params?: Record<string, unknown>;
  /** Automatic sync waits for Wi-Fi; `syncNow()` and the final flush on stop still upload. */
  disableAutoSyncOnCellular?: boolean;
};

export type GeofenceInput = Omit<Geofence, 'notifyOnEntry' | 'notifyOnExit'> & {
  /** Default true. */
  notifyOnEntry?: boolean;
  /** Default true. */
  notifyOnExit?: boolean;
};

export type LocationTrackerApi = Omit<Spec, 'getConstants' | 'setHttpConfig' | 'addGeofences'> & {
  /** Replaces the whole HTTP config; omitted fields go back to their defaults. */
  setHttpConfig(config: HttpConfig): ReturnType<Spec['setHttpConfig']>;
  addGeofences(geofences: GeofenceInput[]): Promise<number>;
  addGeofence(geofence: GeofenceInput): Promise<number>;
  removeGeofence(identifier: string): Promise<number>;
};

const LocationTracker: LocationTrackerApi = {
  startTracking: serverUrl => Native.startTracking(serverUrl),
  stopTracking: () => Native.stopTracking(),
  getStatus: () => Native.getStatus(),
  syncNow: () => Native.syncNow(),
  setDemoMode: enabled => Native.setDemoMode(enabled),
  requestIgnoreBatteryOptimizations: () => Native.requestIgnoreBatteryOptimizations(),
  openExactAlarmSettings: () => Native.openExactAlarmSettings(),
  requestLocationPermission: always => Native.requestLocationPermission(always),
  setTrackingProfile: profile => Native.setTrackingProfile(profile),
  setMotionPermissionOptIn: enabled => Native.setMotionPermissionOptIn(enabled),
  setSyncPolicy: (batchSize, maxBackoffMs, maxAttempts) =>
    Native.setSyncPolicy(batchSize, maxBackoffMs, maxAttempts),

  getCurrentPosition: (timeoutMs, maximumAgeMs) => Native.getCurrentPosition(timeoutMs, maximumAgeMs),
  getQueueStats: () => Native.getQueueStats(),
  getLocations: (status, limit, offset) => Native.getLocations(status, limit, offset),
  destroyLocations: () => Native.destroyLocations(),
  setPersistencePolicy: (maxDaysToPersist, maxRecordsToPersist) =>
    Native.setPersistencePolicy(maxDaysToPersist, maxRecordsToPersist),
  setHttpConfig: config => Native.setHttpConfig(config),
  validateServerUrl: url => Native.validateServerUrl(url),
  getOdometer: () => Native.getOdometer(),
  resetOdometer: () => Native.resetOdometer(),

  addGeofences: geofences => Native.addGeofences(geofences),
  addGeofence: geofence => Native.addGeofences([geofence]),
  removeGeofences: identifiers => Native.removeGeofences(identifiers),
  removeGeofence: identifier => Native.removeGeofences([identifier]),
  getGeofences: () => Native.getGeofences(),

  setSchedule: schedule => Native.setSchedule(schedule),
  startSchedule: () => Native.startSchedule(),
  stopSchedule: () => Native.stopSchedule(),

  getDiagnostics: () => Native.getDiagnostics(),
  setVerboseLogging: enabled => Native.setVerboseLogging(enabled),

  onLocationUpdate: listener => Native.onLocationUpdate(listener),
  onSyncStatus: listener => Native.onSyncStatus(listener),
  onHttp: listener => Native.onHttp(listener),
  onProviderChange: listener => Native.onProviderChange(listener),
  onGeofence: listener => Native.onGeofence(listener),
  onTrackingStateChange: listener => Native.onTrackingStateChange(listener),
  onConfigChange: listener => Native.onConfigChange(listener),
  onScheduleEdge: listener => Native.onScheduleEdge(listener),
};

export default LocationTracker;
