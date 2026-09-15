// IndexedDB Storage Service for high-capacity local file persistence (bypasses 5MB localStorage limit)

const DB_NAME = 'ServiceRequestDashboardDB';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';

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

export async function saveLocalData(key, data) {
  // 1. Try IndexedDB (Unlimited capacity)
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(data, key);
      
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, trying localStorage fallback...', err);
  }

  // 2. Fallback to localStorage with quota error suppression
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage quota exceeded. Data loaded into memory for active session.', e);
  }
}

export async function getLocalData(key) {
  // 1. Try IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);
      
      req.onsuccess = () => {
        if (req.result) resolve(req.result);
        else resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB read failed, trying localStorage...', err);
  }

  // 2. Fallback to localStorage
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
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
