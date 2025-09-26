
export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = path.startsWith('/api') ? path : `/api${path}`;
  const cfg: RequestInit = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...opts,
  };
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    cfg.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, cfg);
  const text = await res.text();
  let data: any;
  try { data = text ? JSON.parse(text) : null; } catch { data = text as any; }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) ? `${data.message}` : res.statusText;
    throw new Error(msg || 'Request failed');
  }
  return data as T;
}
