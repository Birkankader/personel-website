// The last file or folder opened through a handle, kept in IndexedDB so a reload can open it again.
// Handles hold no file contents; the browser asks again before the page may read through one.

export type Recent =
  | { kind: 'file'; handle: FileSystemFileHandle }
  | { kind: 'folder'; handle: FileSystemDirectoryHandle; path: string };

const DB = 'md-viewer';
const STORE = 'recent';
const KEY = 'last';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  try {
    const db = await open();
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).finally(() => db.close());
  } catch {
    return undefined; // private mode or storage blocked: the viewer works without it
  }
}

export const loadRecent = () => run<Recent | undefined>('readonly', (s) => s.get(KEY));
export const saveRecent = (recent: Recent) => run('readwrite', (s) => s.put(recent, KEY));
export const clearRecent = () => run('readwrite', (s) => s.delete(KEY));

/** True when the page may read through the handle, asking first if `ask` (needs a user gesture). */
export async function canRead(handle: FileSystemHandle, ask: boolean): Promise<boolean> {
  if (!handle.queryPermission) return true;
  if ((await handle.queryPermission({ mode: 'read' })) === 'granted') return true;
  return ask && handle.requestPermission ? (await handle.requestPermission({ mode: 'read' })) === 'granted' : false;
}
