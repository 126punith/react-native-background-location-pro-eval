import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import LocationTracker from '../client';
import type {ProviderEvent, Status} from '../specs/NativeLocationTracker';
import type {PermissionGuidance, UsePermissionsResult} from './types';

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)));

const buildProviderFromStatus = (status: Status): ProviderEvent => ({
  authorization: status.authorization,
  preciseLocation: status.preciseLocation,
  enabled: status.authorization !== 'denied' && status.authorization !== 'restricted',
});

function getGuidance(provider: ProviderEvent): PermissionGuidance {
  if (provider.authorization === 'denied' || provider.authorization === 'restricted') {
    return {
      code: 'open_settings',
      message: 'Location permission is denied or restricted. Ask the user to enable it in Settings.',
    };
  }
  if (provider.authorization === 'notDetermined') {
    return {
      code: 'request_when_in_use',
      message: 'Request When-In-Use permission before starting tracking.',
    };
  }
  if (provider.authorization === 'whenInUse') {
    return {
      code: 'request_always',
      message: 'Request Always permission for resilient background tracking and relaunch behavior.',
    };
  }
  if (!provider.preciseLocation) {
    return {
      code: 'enable_precise',
      message: 'Precise location is disabled. Enable Precise Location for better accuracy.',
    };
  }
  return {
    code: 'ok',
    message: 'Location permissions are ready for background tracking.',
  };
}

export function usePermissions(): UsePermissionsResult {
  const [provider, setProvider] = useState<ProviderEvent>(() => buildProviderFromStatus(LocationTracker.getStatus()));
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(() => {
    if (!mountedRef.current) return;
    try {
      const status = LocationTracker.getStatus();
      setProvider(buildProviderFromStatus(status));
      setError(null);
    } catch (e) {
      setError(toError(e));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();

    const sub = LocationTracker.onProviderChange(event => {
      if (!mountedRef.current) return;
      setProvider(event);
      setError(null);
    });
    return () => {
      mountedRef.current = false;
      sub.remove();
    };
  }, [refresh]);

  const requestWhenInUse = useCallback(() => {
    try {
      LocationTracker.requestLocationPermission(false);
      setError(null);
    } catch (e) {
      setError(toError(e));
    }
  }, []);

  const requestAlways = useCallback(() => {
    try {
      LocationTracker.requestLocationPermission(true);
      setError(null);
    } catch (e) {
      setError(toError(e));
    }
  }, []);

  const guidance = useMemo(() => getGuidance(provider), [provider]);
  const hasForeground =
    provider.authorization === 'whenInUse' || provider.authorization === 'always';
  const hasBackgroundAlways = provider.authorization === 'always';

  return {
    provider,
    authorization: provider.authorization,
    preciseLocation: provider.preciseLocation,
    hasForeground,
    hasBackgroundAlways,
    guidance,
    error,
    refresh,
    requestWhenInUse,
    requestAlways,
  };
}
