import type {
  LocationEvent,
  OpResult,
  ProviderEvent,
  Status,
  SyncEvent,
  TrackingStateEvent,
} from '../specs/NativeLocationTracker';

export type UseLocationUpdatesOptions = {
  enabled?: boolean;
  maxItems?: number;
  loadPersisted?: boolean;
  persistedStatus?: 'pending' | 'synced' | 'rejected' | 'all';
  persistedLimit?: number;
};

export type UseLocationUpdatesResult = {
  latestLocation: LocationEvent | null;
  locations: LocationEvent[];
  error: Error | null;
  clear: () => void;
};

export type UseLocationTrackingState = {
  status: Status;
  trackingState: TrackingStateEvent | null;
  lastSync: SyncEvent | null;
  isTracking: boolean;
  isReady: boolean;
  isStarting: boolean;
  isStopping: boolean;
  isSyncing: boolean;
  error: Error | null;
};

export type UseLocationTrackingOptions = {
  serverUrl?: string;
  /**
   * Periodically re-read native `getStatus()` to avoid UI drift when events are sparse.
   * Set to `0` to disable. Default `1000`.
   */
  reconcileIntervalMs?: number;
  /** Refresh native status when the app returns to foreground. Default `true`. */
  reconcileOnForeground?: boolean;
};

export type UseLocationTrackingResult = UseLocationTrackingState & {
  refreshStatus: () => void;
  startTracking: (serverUrl?: string) => Promise<OpResult>;
  stopTracking: () => Promise<OpResult>;
  syncNow: () => Promise<OpResult>;
};

export type PermissionGuidanceCode =
  | 'ok'
  | 'request_when_in_use'
  | 'request_always'
  | 'open_settings'
  | 'enable_precise';

export type PermissionGuidance = {
  code: PermissionGuidanceCode;
  message: string;
};

export type UsePermissionsResult = {
  provider: ProviderEvent;
  authorization: Status['authorization'];
  preciseLocation: boolean;
  hasForeground: boolean;
  hasBackgroundAlways: boolean;
  guidance: PermissionGuidance;
  error: Error | null;
  refresh: () => void;
  requestWhenInUse: () => void;
  requestAlways: () => void;
};
