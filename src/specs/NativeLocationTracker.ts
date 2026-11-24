import type {CodegenTypes, TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

/** One accepted fix, pushed from the native location engine as soon as it is persisted. */
export type LocationEvent = {
  id: string;
  latitude: number;
  longitude: number;
  /** Horizontal accuracy radius in meters. */
  accuracy: number;
  /** Meters per second. */
  speed: number;
  /** Capture time, epoch milliseconds. */
  timestamp: number;
  /** Points on disk not yet acknowledged by the server, including this one. */
  pending: number;
};

/**
 * - `continuous_fitness`: never pauses on its own; bound only to a 5 m distance filter until `stopTracking()`.
 * - `balanced`: always subscribed with a 20 m displacement gate.
 * - `adaptive_low_power` (default): `balanced` plus a native motion gate that parks GPS while the
 *   device is stationary. Any motion-sensor failure falls back to `balanced`; it never pauses silently.
 */
export type TrackingProfile = 'continuous_fitness' | 'balanced' | 'adaptive_low_power';

/** Result of a promise-based lifecycle / config call. Failures reject the Promise with the same `code`. */
export type OpResult = {
  ok: boolean;
  /** `"ok"` on success, otherwise a stable machine code such as `invalid_server_url.scheme`. */
  code: string;
  message: string;
};

/** Preflight validation; always resolves (never rejects) so callers can inspect without try/catch. */
export type ValidateServerUrlResult = {
  ok: boolean;
  code: string;
  message: string;
  /** Present only when `ok` is true. */
  normalizedUrl: string;
};

/** Pushed whenever connectivity, the queue, or the sync outcome changes. */
export type SyncEvent = {
  running: boolean;
  online: boolean;
  pending: number;
  synced: number;
  rejected: number;
  lastSyncAt: number;
  /** Consecutive failures of the in-flight batch; 0 when healthy. */
  retryAttempt: number;
  /** Epoch ms of the next scheduled attempt; 0 when none is pending. */
  nextRetryAt: number;
  /** Last sync failure, e.g. `http_503` or `TimedOut`; empty after a success. */
  lastSyncError: string;
  /** Last config validation/apply code, e.g. `ok` or `invalid_server_url.query`. */
  configValidationCode: string;
  /** True while the motion gate has parked GPS because the device is stationary. */
  motionGateActive: boolean;
  /** stationary | walking | running | driving | cycling | moving | unknown | unsupported */
  motionState: string;
  /** Human-readable status. Errors start with a stable `[code]` prefix. */
  message: string;
};

/** Snapshot returned synchronously over JSI from in-memory native state. */
export type Status = {
  running: boolean;
  /** Tracking was requested and not stopped; the watchdog revives the pipeline while true. */
  desired: boolean;
  online: boolean;
  pending: number;
  synced: number;
  lastLocationAt: number;
  lastSyncAt: number;
  message: string;
  serverUrl: string;
  deviceId: string;
  /** Background App Refresh is available, so the BGTask watchdog can run. */
  exactAlarmsAllowed: boolean;
  /** Low Power Mode is off. */
  batteryUnrestricted: boolean;
  /** Sync every 5 s instead of 30 s so the live map updates quickly during demos. */
  demoMode: boolean;
  /** CLAuthorizationStatus: notDetermined | whenInUse | always | denied | restricted. */
  authorization: string;
  /** Full (precise) accuracy authorization granted. */
  preciseLocation: boolean;
  trackingProfile: string;
  motionGateActive: boolean;
  /** stationary | walking | running | driving | cycling | moving | unknown | unsupported */
  motionState: string;
  /** Sensor driving the gate: coremotion | none. */
  motionSource: string;
  /** Motion & Fitness permission: granted | denied | notRequested | unavailable. */
  motionPermission: string;
  /** Always false on iOS; Motion & Fitness is requested lazily by the `adaptive_low_power` profile. */
  motionPermissionOptIn: boolean;
  /** Points moved to the dead-letter state after `maxAttempts` non-retryable rejections. */
  rejected: number;
  retryAttempt: number;
  nextRetryAt: number;
  /** Last sync failure, e.g. `http_503` or `TimedOut`; empty after a success. */
  lastSyncError: string;
  /**
   * Evaluation build only: `debug` while evaluating, `release` when evaluation is not available in
   * this build.
   */
  buildTier: string;
  /** Meters between accepted fixes since the last `resetOdometer()`. */
  odometer: number;
  /** Registered geofences (all of them, not only the ones currently armed with the OS). */
  geofenceCount: number;
  /** The tracking schedule is started and drives start/stop. */
  scheduleEnabled: boolean;
  /** Incremented after each successful persistent config commit. */
  persistedConfigVersion: number;
  /**
   * Incremented only when that persisted config is published to the sync path.
   * Stays 0 until the first successful publish and is never copied from persistedConfigVersion.
   */
  activeConfigVersion: number;
  /** Last config validation/apply code, e.g. `ok` or `invalid_server_url.query`. */
  configValidationCode: string;
  /** Human-readable description for the last config validation/apply outcome. */
  configValidationMessage: string;
  /** When true, native logs include fine coordinates; defaults false outside demo mode. */
  verboseLogging: boolean;
};

/** One-shot fix from `getCurrentPosition()`. Not stored and not uploaded. */
export type CurrentPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  /** Course in degrees, -1 when unknown. */
  heading: number;
  altitude: number;
  timestamp: number;
};

export type QueueStats = {
  pending: number;
  synced: number;
  rejected: number;
  /** Capture time of the oldest pending point, 0 when the queue is empty. */
  oldestPendingAt: number;
  /** Capture time of the newest stored point, 0 when the store is empty. */
  newestAt: number;
};

/** A row of the on-device queue, as returned by `getLocations()`. */
export type StoredLocation = {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  heading: number;
  altitude: number;
  timestamp: number;
  /** pending | synced | rejected */
  status: string;
  /** Empty until the row is claimed for upload. */
  batchId: string;
};

/** One upload attempt of one batch. */
export type HttpEvent = {
  batchId: string;
  success: boolean;
  /** HTTP status, or -1 for a transport failure. */
  status: number;
  /** Points in the batch; 0 for a background upload, where the count is not known. */
  size: number;
  attempt: number;
  /** 0 for a background upload. */
  durationMs: number;
  /** Empty on success, otherwise e.g. `http_503` or `TimedOut`. */
  error: string;
  /** Completed by the OS background upload session (iOS) rather than the live sync loop. */
  background: boolean;
};

/** Pushed when location authorization or the system location switch changes. */
export type ProviderEvent = {
  /** notDetermined | whenInUse | always | denied | restricted */
  authorization: string;
  preciseLocation: boolean;
  /** System-wide location services switch. */
  enabled: boolean;
};

export type Geofence = {
  identifier: string;
  latitude: number;
  longitude: number;
  /** Meters; clamped to at least 100 m because OS geofencing is unreliable below that. */
  radius: number;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
};

export type GeofenceEvent = {
  identifier: string;
  /** ENTER | EXIT */
  action: string;
  /** Last known device position at the time of the transition; 0 when none is available. */
  latitude: number;
  longitude: number;
  timestamp: number;
};

export type TrackingStateEvent = {
  running: boolean;
  desired: boolean;
  /** Why the state changed, e.g. `js:startTracking`, `watchdog`, `schedule:start`. */
  reason: string;
  trackingProfile: string;
};

export type ConfigChangeEvent = {
  persistedConfigVersion: number;
  activeConfigVersion: number;
  code: string;
  message: string;
};

export type ScheduleEdgeEvent = {
  /** start | stop */
  action: string;
  /** Epoch ms when the current window ends, or 0 when stopping / unknown. */
  windowEndsAt: number;
};

/** Support / troubleshooting snapshot from `getDiagnostics()`. */
export type Diagnostics = {
  platform: string;
  packageVersion: string;
  buildTier: string;
  deviceModel: string;
  osVersion: string;
  authorization: string;
  preciseLocation: boolean;
  motionPermission: string;
  exactAlarmsAllowed: boolean;
  batteryUnrestricted: boolean;
  trackingProfile: string;
  motionGateActive: boolean;
  motionState: string;
  motionSource: string;
  pending: number;
  synced: number;
  rejected: number;
  retryAttempt: number;
  nextRetryAt: number;
  lastSyncError: string;
  serverUrl: string;
  httpPath: string;
  /** Header *names* only; values are never included. */
  httpHeaderNames: Array<string>;
  disableAutoSyncOnCellular: boolean;
  persistedConfigVersion: number;
  activeConfigVersion: number;
  configValidationCode: string;
  verboseLogging: boolean;
  /** Newest-first structured log lines from the in-memory ring buffer. */
  recentLogs: Array<string>;
};

export interface Spec extends TurboModule {
  /**
   * Persists a valid base URL (http/https, no query/fragment), marks tracking as desired, starts the
   * location engine and arms the watchdog. Rejects with `invalid_server_url.*` or `eval_blocked`.
   */
  startTracking(serverUrl: string): Promise<OpResult>;
  /** Clears the desired flag, cancels the watchdog and stops collection after a final flush. */
  stopTracking(): Promise<OpResult>;
  /** Synchronous JSI call; never blocks on I/O. */
  getStatus(): Status;
  /** Forces an immediate sync attempt (still skipped while offline). Rejects with `not_running`. */
  syncNow(): Promise<OpResult>;
  /** Persisted; switches the sync tick between 5 s (demo) and 30 s. */
  setDemoMode(enabled: boolean): Promise<OpResult>;
  /** iOS has no battery-optimization exemption; opens the app's Settings page. */
  requestIgnoreBatteryOptimizations(): void;
  /** Opens the app's Settings page (Background App Refresh lives there). */
  openExactAlarmSettings(): void;
  /**
   * Requests When-In-Use first; with `always` it escalates to Always once When-In-Use is granted,
   * or opens Settings when iOS will no longer show the prompt.
   */
  requestLocationPermission(always: boolean): void;
  /** Persisted and applied live. Rejects with `invalid_profile`. */
  setTrackingProfile(profile: string): Promise<OpResult>;
  /** Android-only (Activity Recognition tier); a no-op on iOS, kept so the JS contract matches. */
  setMotionPermissionOptIn(enabled: boolean): Promise<OpResult>;
  /**
   * Persisted. `maxBackoffMs` caps the jittered exponential backoff; `maxAttempts` is how many
   * non-retryable 4xx rejections a batch may get before it is dead-lettered (0 = keep retrying).
   */
  setSyncPolicy(batchSize: number, maxBackoffMs: number, maxAttempts: number): Promise<OpResult>;

  /**
   * One fresh fix, independent of tracking. Resolves with a cached fix younger than
   * `maximumAgeMs` when there is one; rejects with `timeout` after `timeoutMs`.
   */
  getCurrentPosition(timeoutMs: number, maximumAgeMs: number): Promise<CurrentPosition>;
  getQueueStats(): Promise<QueueStats>;
  /** `status` is pending | synced | rejected | all. Ordered oldest first. */
  getLocations(status: string, limit: number, offset: number): Promise<Array<StoredLocation>>;
  /** Deletes every stored point, including pending ones. Resolves with the number deleted. */
  destroyLocations(): Promise<number>;
  /**
   * Persisted. Pending points older than `maxDaysToPersist` are dropped, and the oldest pending
   * points are dropped once more than `maxRecordsToPersist` are queued. 0 disables either limit.
   */
  setPersistencePolicy(maxDaysToPersist: number, maxRecordsToPersist: number): Promise<OpResult>;
  /**
   * Persisted. `config` is `{path, headers, params, disableAutoSyncOnCellular}`; see `HttpConfig`
   * in the package entry point for the typed shape.
   */
  setHttpConfig(config: CodegenTypes.UnsafeObject): Promise<OpResult>;
  /**
   * Validates a server URL without starting tracking or mutating persisted config.
   * Always resolves; inspect `ok` / `code` / `normalizedUrl`.
   */
  validateServerUrl(url: string): Promise<ValidateServerUrlResult>;

  /** Synchronous; reads the persisted value. */
  getOdometer(): number;
  resetOdometer(): Promise<OpResult>;

  /**
   * Registers (or replaces, by identifier) geofences. They are persisted and stay registered
   * across restarts until removed. Resolves with the total number registered.
   */
  addGeofences(geofences: Array<CodegenTypes.UnsafeObject>): Promise<number>;
  /** An empty array removes every geofence. Resolves with the number removed. */
  removeGeofences(identifiers: Array<string>): Promise<number>;
  getGeofences(): Promise<Array<Geofence>>;

  /**
   * Persisted. Each entry is `"<days> <HH:mm>-<HH:mm>"` in local time, where days is a day number
   * (1 = Sunday ... 7 = Saturday), a range like `2-6`, or a list like `1,7`.
   */
  setSchedule(schedule: Array<string>): Promise<OpResult>;
  /** Starts or stops tracking at each window edge until `stopSchedule()`. */
  startSchedule(): Promise<OpResult>;
  stopSchedule(): Promise<OpResult>;

  /** Production support snapshot; headers and fine coordinates are redacted. */
  getDiagnostics(): Promise<Diagnostics>;
  /** Persisted. When true, native logs include fine coordinates. */
  setVerboseLogging(enabled: boolean): Promise<OpResult>;

  readonly onLocationUpdate: CodegenTypes.EventEmitter<LocationEvent>;
  readonly onSyncStatus: CodegenTypes.EventEmitter<SyncEvent>;
  readonly onHttp: CodegenTypes.EventEmitter<HttpEvent>;
  readonly onProviderChange: CodegenTypes.EventEmitter<ProviderEvent>;
  readonly onGeofence: CodegenTypes.EventEmitter<GeofenceEvent>;
  readonly onTrackingStateChange: CodegenTypes.EventEmitter<TrackingStateEvent>;
  readonly onConfigChange: CodegenTypes.EventEmitter<ConfigChangeEvent>;
  readonly onScheduleEdge: CodegenTypes.EventEmitter<ScheduleEdgeEvent>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LocationTracker');
