export interface Location {
  latitude: number
  longitude: number
}

export function getLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
      },
      (err) => reject(err),
      { enableHighAccuracy: true }
    )
  })
}
