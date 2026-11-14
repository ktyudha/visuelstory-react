/**
 * Hanya izinkan tujuan di dalam aplikasi ("/akun", "/booking?x=1").
 * Menolak "//evil.com", "/\evil.com", "https://..." dan karakter kontrol (open redirect).
 */
export function safeRedirect(path: string | null | undefined): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
  // eslint-disable-next-line no-control-regex -- sengaja: tolak karakter kontrol pada tujuan redirect
  if (/[\u0000-\u001f\u007f]/.test(path)) return null;
  return path;
}
