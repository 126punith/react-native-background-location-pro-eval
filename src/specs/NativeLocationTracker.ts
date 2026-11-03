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

/** Pushed whenever connectivity, the queue, or the sync outcome changes. */
export type SyncEvent = {
  running: boolean;
  online: boolean;
  pending: number;
  synced: number;
  lastSyncAt: number;
  /** Consecutive failures of the in-flight batch; 0 when healthy. */
  retryAttempt: number;
  /** Epoch ms of the next scheduled attempt; 0 when none is pending. */
  nextRetryAt: number;
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
};

export interface Spec extends TurboModule {
  /** Persists the server URL, marks tracking as desired, starts the location engine and arms the watchdog. */
  startTracking(serverUrl: string): void;
  /** Clears the desired flag, cancels the watchdog and stops collection after a final flush. Buffered points stay on disk. */
  stopTracking(): void;
  /** Synchronous JSI call; never blocks on I/O. */
  getStatus(): Status;
  /** Forces an immediate sync attempt (still skipped while offline). */
  syncNow(): void;
  /** Persisted; switches the sync tick between 5 s (demo) and 30 s. Batch size and idempotency are unchanged. */
  setDemoMode(enabled: boolean): void;
  /** iOS has no battery-optimization exemption; opens the app's Settings page. */
  requestIgnoreBatteryOptimizations(): void;
  /** Opens the app's Settings page (Background App Refresh lives there). */
  openExactAlarmSettings(): void;
  /**
   * Requests When-In-Use first; with `always` it escalates to Always once When-In-Use is granted,
   * or opens Settings when iOS will no longer show the prompt.
   */
  requestLocationPermission(always: boolean): void;
  /** Persisted and applied live (no restart). Unknown values are rejected with a `[invalid_profile]` status. */
  setTrackingProfile(profile: string): void;
  /** Android-only (Activity Recognition tier); a no-op on iOS, kept so the JS contract matches. */
  setMotionPermissionOptIn(enabled: boolean): void;
  /**
   * Persisted. `maxBackoffMs` caps the jittered exponential backoff; `maxAttempts` is how many
   * non-retryable 4xx rejections a batch may get before it is dead-lettered (0 = keep retrying).
   */
  setSyncPolicy(batchSize: number, maxBackoffMs: number, maxAttempts: number): void;

  readonly onLocationUpdate: CodegenTypes.EventEmitter<LocationEvent>;
  readonly onSyncStatus: CodegenTypes.EventEmitter<SyncEvent>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LocationTracker');
