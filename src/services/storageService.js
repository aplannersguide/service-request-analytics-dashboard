// IndexedDB Storage Service for high-capacity local file persistence (bypasses 5MB localStorage limit)
// Enforces a 12-hour Time-To-Live (TTL) auto-expiration to protect shared municipal workstations.

const DB_NAME = 'ServiceRequestDashboardDB';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';
export const STORAGE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function wrapWithTTL(data) {
  return {
    savedAt: Date.now(),
    payload: data
  };
}

function unwrapAndValidateTTL(record) {
  if (!record) return { expired: false, data: null };

  // Handle legacy unwrapped arrays by treating them as expired so they upgrade cleanly
  if (Array.isArray(record)) {
    return { expired: true, data: null };
  }

  if (typeof record === 'object' && typeof record.savedAt === 'number' && Array.isArray(record.payload)) {
    const age = Date.now() - record.savedAt;
    if (age > STORAGE_TTL_MS) {
      return { expired: true, data: null };
    }
    return { expired: false, data: record.payload };
  }

  return { expired: false, data: null };
}

export async function saveLocalData(key, data) {
  const wrapped = wrapWithTTL(data);

  // 1. Try IndexedDB (Unlimited capacity)
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(wrapped, key);
      
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, trying localStorage fallback...', err);
  }

  // 2. Fallback to localStorage with quota error suppression
  try {
    localStorage.setItem(key, JSON.stringify(wrapped));
  } catch (e) {
    console.warn('localStorage quota exceeded. Data loaded into memory for active session.', e);
  }
}

export async function getLocalData(key) {
  // 1. Try IndexedDB
  try {
    const db = await openDB();
    const rawResult = await new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);
      
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });

    if (rawResult) {
      const { expired, data } = unwrapAndValidateTTL(rawResult);
      if (expired) {
        await clearLocalData();
        return null;
      }
      return data;
    }
  } catch (err) {
    console.warn('IndexedDB read failed, trying localStorage...', err);
  }

  // 2. Fallback to localStorage
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    const { expired, data } = unwrapAndValidateTTL(parsed);
    if (expired) {
      await clearLocalData();
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

export async function clearLocalData() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
  } catch (e) {
    // Ignore
  }
  try {
    localStorage.removeItem('sr_dashboard_raw_reqs');
    localStorage.removeItem('sr_dashboard_raw_surveys');
  } catch (e) {
    // Ignore
  }
}
