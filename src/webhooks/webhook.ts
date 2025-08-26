export async function sendWebhook(url: string, payload: any): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Webhook failed: ${res.status}`);
  }
  return res.json();
}
