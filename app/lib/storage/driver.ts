export function isBlobStorageDriver(driver: string | undefined) {
  return driver === "blob" || driver === "vercel-blob";
}
