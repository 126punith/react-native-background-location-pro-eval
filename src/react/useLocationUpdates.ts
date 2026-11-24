import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import LocationTracker from '../client';
import type {LocationEvent, StoredLocation} from '../specs/NativeLocationTracker';
import type {UseLocationUpdatesOptions, UseLocationUpdatesResult} from './types';

const toLocationEvent = (item: StoredLocation): LocationEvent => ({
  id: item.id,
  latitude: item.latitude,
  longitude: item.longitude,
  accuracy: item.accuracy,
  speed: item.speed,
  timestamp: item.timestamp,
  pending: 0,
});

export function useLocationUpdates(options: UseLocationUpdatesOptions = {}): UseLocationUpdatesResult {
  const {
    enabled = true,
    maxItems = 20,
    loadPersisted = false,
    persistedStatus = 'pending',
    persistedLimit = 20,
  } = options;

  const [locations, setLocations] = useState<LocationEvent[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const safeMaxItems = Math.max(1, maxItems);
  const safePersistedLimit = Math.max(1, persistedLimit);

  const clear = useCallback(() => {
    if (!mountedRef.current) return;
    setLocations([]);
    setError(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    if (loadPersisted) {
      LocationTracker.getLocations(persistedStatus, safePersistedLimit, 0)
        .then(items => {
          if (cancelled || !mountedRef.current) return;
          setLocations(items.map(toLocationEvent).reverse().slice(0, safeMaxItems));
        })
        .catch(e => {
          if (cancelled || !mountedRef.current) return;
          setError(e instanceof Error ? e : new Error(String(e)));
        });
    }

    const sub = LocationTracker.onLocationUpdate(event => {
      if (!mountedRef.current) return;
      setLocations(prev => [event, ...prev].slice(0, safeMaxItems));
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [enabled, loadPersisted, persistedStatus, safeMaxItems, safePersistedLimit]);

  const latestLocation = useMemo(() => locations[0] ?? null, [locations]);

  return {
    latestLocation,
    locations,
    error,
    clear,
  };
}
