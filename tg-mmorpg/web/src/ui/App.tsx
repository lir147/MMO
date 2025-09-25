
import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const api = async (path: string, body?: any) => {
  const initData = (window as any).Telegram?.WebApp?.initData || '';
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-init-data': initData
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`API error: ${res.status} ${t}`);
  }
  return res.json();
};

export default function App() {
  const [me, setMe] = useState<any>(null);
  const [log, setLog] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api('/me')
      .then(setMe)
      .catch(e => setError(e.message));
  }, []);

  const fight = async () => {
    try {
      setBusy(true);
      setError(null);
      const r = await api('/fight/start', { enemy: 'slime' });
      setLog(r.log);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div style={{ padding: 16 }}>Ошибка: {error}</div>;
  if (!me) return <div style={{ padding: 16 }}>Загрузка…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Shards</h1>
      <div>Класс: {me.character.class} · Уровень: {me.character.level}</div>
      <button onClick={fight} disabled={busy} style={{ marginTop: 12 }}>
        {busy ? 'Бой...' : 'Сразиться со слизнем'}
      </button>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{JSON.stringify(log, null, 2)}</pre>
    </div>
  );
}
