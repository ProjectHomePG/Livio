/**
 * Promise-based wrapper around navigator.geolocation.
 * Resolves with { lat, lng } or rejects with a user-friendly Error.
 */
export function getCurrentCoords({
  enableHighAccuracy = true,
  timeout = 10000,
  maximumAge = 60000,
} = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err && err.code === 1) {
          reject(new Error('Location permission denied.'));
        } else {
          reject(new Error('Location permission denied or unavailable.'));
        }
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  });
}
