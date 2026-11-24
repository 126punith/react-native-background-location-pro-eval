import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import LocationTracker from '../client';
import type {
  OpResult,
  Status,
  SyncEvent,
  TrackingStateEvent,
} from '../specs/NativeLocationTracker';
import type {UseLocationTrackingOptions, UseLocationTrackingResult} from './types';

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)));

const EMPTY_STATUS: Status = {
  running: false,
  desired: false,
  online: false,
  pending: 0,
  synced: 0,
  lastLocationAt: 0,
  lastSyncAt: 0,
  message: '',
  serverUrl: '',
  deviceId: '',
  exactAlarmsAllowed: false,
  batteryUnrestricted: false,
  demoMode: false,
  authorization: 'notDetermined',
  preciseLocation: false,
  trackingProfile: 'adaptive_low_power',
  motionGateActive: false,
  motionState: 'unknown',
  motionSource: 'none',
  motionPermission: 'notRequested',
  motionPermissionOptIn: false,
  rejected: 0,
  retryAttempt: 0,
  nextRetryAt: 0,
  lastSyncError: '',
  buildTier: '',
  odometer: 0,
  geofenceCount: 0,
  scheduleEnabled: false,
  persistedConfigVersion: 0,
  activeConfigVersion: 0,
  configValidationCode: '',
  configValidationMessage: '',
  verboseLogging: false,
};

export function useLocationTracking(options: UseLocationTrackingOptions = {}): UseLocationTrackingResult {
  const {
    serverUrl,
    reconcileIntervalMs = 1000,
    reconcileOnForeground = true,
  } = options;

  const [status, setStatus] = useState<Status>(() => {
    try {
      return LocationTracker.getStatus();
    } catch {
      return EMPTY_STATUS;
    }
  });
  const [trackingState, setTrackingState] = useState<TrackingStateEvent | null>(null);
  const [lastSync, setLastSync] = useState<SyncEvent | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mountedRef = useRef(true);
  const statusRef = useRef(status);
  const startInFlightRef = useRef<Promise<OpResult> | null>(null);
  const stopInFlightRef = useRef<Promise<OpResult> | null>(null);
  const syncInFlightRef = useRef<Promise<OpResult> | null>(null);
  statusRef.current = status;

  const refreshStatus = useCallback(() => {
    if (!mountedRef.current) return;
    try {
      setStatus(LocationTracker.getStatus());
    } catch (e) {
      setError(toError(e));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refreshStatus();

    const trackingSub = LocationTracker.onTrackingStateChange(event => {
      if (!mountedRef.current) return;
      setTrackingState(event);
      refreshStatus();
    });

    const syncSub = LocationTracker.onSyncStatus(event => {
      if (!mountedRef.current) return;
      setLastSync(event);
      // Sync lifecycle fields come from the sync event; still refresh for full native snapshot.
      setStatus(prev => ({
        ...prev,
        running: event.running,
        online: event.online,
        pending: event.pending,
        synced: event.synced,
        lastSyncAt: event.lastSyncAt,
        retryAttempt: event.retryAttempt,
        nextRetryAt: event.nextRetryAt,
        lastSyncError: event.lastSyncError,
        message: event.message,
        configValidationCode: event.configValidationCode,
        motionGateActive: event.motionGateActive,
        motionState: event.motionState,
      }));
      refreshStatus();
    });

    // Location events update last-fix / pending immediately so UI doesn't wait for the next sync tick.
    const locationSub = LocationTracker.onLocationUpdate(event => {
      if (!mountedRef.current) return;
      setStatus(prev => ({
        ...prev,
        running: true,
        lastLocationAt: event.timestamp,
        pending: event.pending,
      }));
    });

    return () => {
      mountedRef.current = false;
      trackingSub.remove();
      syncSub.remove();
      locationSub.remove();
    };
  }, [refreshStatus]);

  // Low-cost native status resync so counters / odometer / auth don't drift when events are sparse.
  useEffect(() => {
    if (reconcileIntervalMs <= 0) return;
    const timer = setInterval(() => {
      refreshStatus();
    }, reconcileIntervalMs);
    return () => clearInterval(timer);
  }, [reconcileIntervalMs, refreshStatus]);

  useEffect(() => {
    if (!reconcileOnForeground) return;
    const onChange = (next: AppStateStatus) => {
      if (next === 'active') refreshStatus();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [reconcileOnForeground, refreshStatus]);

  const run = useCallback(async <T,>(setter: (v: boolean) => void, fn: () => Promise<T>): Promise<T> => {
    setter(true);
    setError(null);
    try {
      const result = await fn();
      if (mountedRef.current) refreshStatus();
      return result;
    } catch (e) {
      const err = toError(e);
      if (mountedRef.current) setError(err);
      throw err;
    } finally {
      if (mountedRef.current) setter(false);
    }
  }, [refreshStatus]);

  const startTracking = useCallback(
    async (nextServerUrl?: string): Promise<OpResult> => {
      if (startInFlightRef.current) return startInFlightRef.current;
      const nextUrl = nextServerUrl?.trim() || serverUrl?.trim() || statusRef.current.serverUrl?.trim();
      if (!nextUrl) {
        const err = new Error('Missing server URL. Provide one to start tracking.');
        setError(err);
        throw err;
      }
      const op = run(setIsStarting, () => LocationTracker.startTracking(nextUrl));
      startInFlightRef.current = op;
      try {
        return await op;
      } finally {
        startInFlightRef.current = null;
      }
    },
    [serverUrl, run],
  );

  const stopTracking = useCallback(async () => {
    if (stopInFlightRef.current) return stopInFlightRef.current;
    const op = run(setIsStopping, () => LocationTracker.stopTracking());
    stopInFlightRef.current = op;
    try {
      return await op;
    } finally {
      stopInFlightRef.current = null;
    }
  }, [run]);

  const syncNow = useCallback(async () => {
    if (syncInFlightRef.current) return syncInFlightRef.current;
    const op = run(setIsSyncing, () => LocationTracker.syncNow());
    syncInFlightRef.current = op;
    try {
      return await op;
    } finally {
      syncInFlightRef.current = null;
    }
  }, [run]);

  const isTracking = useMemo(() => status.running || status.desired, [status.desired, status.running]);
  const isReady = useMemo(() => status.authorization === 'always', [status.authorization]);

  return {
    status,
    trackingState,
    lastSync,
    isTracking,
    isReady,
    isStarting,
    isStopping,
    isSyncing,
    error,
    refreshStatus,
    startTracking,
    stopTracking,
    syncNow,
  };
}
