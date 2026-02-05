/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

interface SyncEvent extends ExtendableEvent {
  tag: string;
}

precacheAndRoute(self.__WB_MANIFEST || []);

// Use empty string for relative paths (when behind nginx proxy), fallback to origin for service worker
const envApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = envApiUrl === "" || envApiUrl === "/" ? "" : (envApiUrl || self.location.origin);

self.addEventListener("sync", (event: Event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === "voucher-sync") {
    syncEvent.waitUntil(syncQueuedVouchers());
  }
});

async function syncQueuedVouchers() {
  const db = await openDB();
  const tx = db.transaction("vouchers", "readonly");
  const store = tx.objectStore("vouchers");
  const queued = await getAll(store);
  const unsynced = queued.filter((item) => item && item.synced === false);
  if (!unsynced.length) {
    return;
  }

  const res = await fetch(`${API_BASE}/api/vouchers/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(unsynced)
  });

  if (!res.ok) {
    throw new Error("Sync failed");
  }

  const synced = await res.json();
  const updateTx = db.transaction("vouchers", "readwrite");
  const updateStore = updateTx.objectStore("vouchers");
  for (const entry of synced) {
    updateStore.put({ ...entry, synced: true });
  }
  await waitForTransaction(updateTx);
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("mealVoucherDB");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAll(store: IDBObjectStore): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
