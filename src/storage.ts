import type { AppState } from './types';
import { emptyState } from './seed';

/**
 * 基于 IndexedDB 的持久化层。
 *
 * - DB 名：aa_counter
 * - ObjectStore：kv（通用 key-value 存储）
 * - 状态键：state_v1
 *
 * 优势：相比 LocalStorage，IndexedDB 是真正的浏览器数据库：
 *   - 容量大（通常可达磁盘空间的 50%）
 *   - 异步 API，不阻塞主线程
 *   - 事务化，避免并发写入竞争
 */

const DB_NAME = 'aa_counter';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const STATE_KEY = 'state_v1';
const LEGACY_LS_KEY = 'aa_counter_v1';

let dbPromise: Promise<IDBDatabase> | null = null;

/** 打开（并按需升级）数据库，缓存 Promise 以避免重复打开。 */
function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('当前环境不支持 IndexedDB'));
  }
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // 处理连接异常（磁盘满、版本冲突等）
      db.onversionchange = () => {
        try {
          db.close();
          dbPromise = null;
        } catch {
          /* noop */
        }
      };
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error ?? new Error('打开 IndexedDB 失败'));
    };
    req.onblocked = () => {
      dbPromise = null;
      reject(new Error('IndexedDB 升级被阻塞，请关闭其它标签页'));
    };
  });
  return dbPromise;
}

/**
 * 从 IndexedDB 读取 AppState。读取失败时回退到空状态，
 * 并尝试从旧版 LocalStorage 迁移一次。
 */
export async function loadState(): Promise<AppState> {
  try {
    const db = await openDB();
    const state = await readFromDB(db, STATE_KEY);
    if (state) return state;
    // IndexedDB 为空 → 尝试从 LocalStorage 迁移
    const migrated = await migrateFromLocalStorage();
    return migrated ?? emptyState();
  } catch (err) {
    console.error('[storage] 读取失败，使用空状态：', err);
    // 最后的回退：尝试直接从 LocalStorage 读
    return readFromLocalStorage() ?? emptyState();
  }
}

/**
 * 将 AppState 写入 IndexedDB。返回是否成功。
 */
export async function saveState(state: AppState): Promise<boolean> {
  try {
    const db = await openDB();
    await writeToDB(db, STATE_KEY, state);
    return true;
  } catch (err) {
    console.error('[storage] 写入失败：', err);
    // 写入失败时回退到 LocalStorage，避免数据丢失
    try {
      window.localStorage.setItem(LEGACY_LS_KEY, JSON.stringify(state));
    } catch {
      /* 隐私模式可能也写不进去 */
    }
    return false;
  }
}

/* ============== 内部辅助 ============== */

function readFromDB(db: IDBDatabase, key: IDBValidKey): Promise<AppState | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as AppState | undefined);
    req.onerror = () => reject(req.error);
  });
}

function writeToDB(db: IDBDatabase, key: IDBValidKey, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.onabort = () => reject(tx.error);
  });
}

function readFromLocalStorage(): AppState | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(LEGACY_LS_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.projects)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

/**
 * 一次性迁移：把旧版 LocalStorage 数据搬到 IndexedDB，然后清掉旧 key。
 */
async function migrateFromLocalStorage(): Promise<AppState | null> {
  const old = readFromLocalStorage();
  if (!old) return null;
  try {
    const db = await openDB();
    await writeToDB(db, STATE_KEY, old);
    window.localStorage.removeItem(LEGACY_LS_KEY);
    console.info('[storage] 已从 LocalStorage 迁移到 IndexedDB');
    return old;
  } catch (err) {
    console.warn('[storage] 迁移失败，保留原 LocalStorage 数据：', err);
    return old;
  }
}

/** 清空所有数据（仅暴露供未来"重置"功能使用，当前未挂载 UI）。 */
export async function clearAll(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('[storage] 清空失败：', err);
  }
}

export const STORAGE_KEY_NAME = STATE_KEY;
export const LEGACY_STORAGE_KEY_NAME = LEGACY_LS_KEY;
