
export async function api<T=any>(path: string, body?: any): Promise<T> {
  const initData = (window as any)?.Telegram?.WebApp?.initData;
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (initData) headers['x-telegram-init-data'] = initData;
  const res = await fetch(`/api${path}`, { method: body ? 'POST':'GET', headers, body: body? JSON.stringify(body): undefined });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export function needExpFor(level: number) { return 100 + (level - 1) * 20; }
export function fmt(n: any) { try { return Number(n).toLocaleString('ru-RU'); } catch { return String(n); } }
