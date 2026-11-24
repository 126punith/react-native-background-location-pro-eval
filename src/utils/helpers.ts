import type {Status, ValidateServerUrlResult} from '../specs/NativeLocationTracker';
import LocationTracker from '../client';

export type TrackingReadiness = {
  ready: boolean;
  reason: 'ok' | 'location_permission_missing' | 'background_permission_missing' | 'services_disabled';
};

export type TrackingStartContext = {
  status: Status;
  urlValidation: ValidateServerUrlResult;
  readiness: TrackingReadiness;
};

export function isPermissionGranted(status: Status): boolean {
  return status.authorization === 'whenInUse' || status.authorization === 'always';
}

export function getTrackingReadiness(status: Status): TrackingReadiness {
  if (!status.online && status.pending > 0) {
    return {ready: true, reason: 'ok'};
  }
  if (!isPermissionGranted(status)) {
    return {ready: false, reason: 'location_permission_missing'};
  }
  if (status.authorization !== 'always') {
    return {ready: false, reason: 'background_permission_missing'};
  }
  if (!status.preciseLocation) {
    return {ready: false, reason: 'services_disabled'};
  }
  return {ready: true, reason: 'ok'};
}

export function buildTrackingStartGuidance(readiness: TrackingReadiness): string {
  switch (readiness.reason) {
    case 'ok':
      return 'Tracking is ready to start.';
    case 'location_permission_missing':
      return 'Location permission is not granted. Request location permission before starting tracking.';
    case 'background_permission_missing':
      return 'Background location permission is missing. Grant Always permission for resilient background tracking.';
    case 'services_disabled':
      return 'Precise location is disabled. Enable Precise Location in system settings for better results.';
    default:
      return 'Tracking readiness is unknown.';
  }
}

export function buildTrackingStartContext(
  status: Status,
  urlValidation: ValidateServerUrlResult,
): TrackingStartContext {
  return {
    status,
    urlValidation,
    readiness: getTrackingReadiness(status),
  };
}

export async function getTrackingStartContext(serverUrl: string): Promise<TrackingStartContext> {
  const [status, urlValidation] = await Promise.all([
    Promise.resolve(LocationTracker.getStatus()),
    LocationTracker.validateServerUrl(serverUrl),
  ]);
  return buildTrackingStartContext(status, urlValidation);
}

export function getActionableErrorMessage(error: unknown): string {
  const e = error as {code?: string; message?: string};
  if (e?.code && e?.message) return `[${e.code}] ${e.message}`;
  if (e?.code) return `[${e.code}]`;
  if (e?.message) return e.message;
  return String(error);
}
