import { API_BASE, VoucherEntry } from "./api";
import { listQueuedVouchers, markVoucherSynced } from "./db";

export async function flushVoucherQueue() {
  const queued = await listQueuedVouchers();
  if (!queued.length) return;

  const res = await fetch(`${API_BASE}/api/vouchers/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(queued)
  });

  if (!res.ok) {
    throw new Error("Failed to sync vouchers");
  }

  const synced = (await res.json()) as VoucherEntry[];
  await Promise.all(synced.map((entry) => markVoucherSynced(entry.id)));
}

export async function registerBackgroundSync() {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const registration = await navigator.serviceWorker.ready;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (registration as any).sync?.register("voucher-sync");
  }
}
