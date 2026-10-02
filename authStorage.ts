export function getAuthStorage() {
  if (typeof window === "undefined") return undefined;
  return localStorage;
}
