import { DEFAULT_SETTINGS } from '../../config/defaults';
import { GameSettings, SaveSlotData } from '../../types/game';
import { sanitizeSettings, validateSaveData } from '../core/rules';

const DB_NAME = 'the_school_chronicles_db';
const DB_VERSION = 1;
const SAVE_STORE = 'saves';
const PRIMARY_SLOT_KEY = 'slot_primary';
const LOCAL_SAVE_BACKUP_KEY = 'tsc_save_slot_primary_v1';
const SETTINGS_STORAGE_KEY = 'tsc_game_settings_v1';

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (db: IDBDatabase | null) => {
      if (settled) {
        if (db) {
          try {
            db.close();
          } catch {
            // Ignore
          }
        }
        return;
      }
      settled = true;
      resolve(db);
    };
    const timer = window.setTimeout(() => finish(null), 120);
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        try {
          const db = request.result;
          if (!db.objectStoreNames.contains(SAVE_STORE)) {
            db.createObjectStore(SAVE_STORE, { keyPath: 'id' });
          }
        } catch {
          // Ignore upgrade errors in restricted iframes
        }
      };
      request.onsuccess = () => {
        window.clearTimeout(timer);
        finish(request.result);
      };
      request.onerror = () => {
        window.clearTimeout(timer);
        finish(null);
      };
      request.onblocked = () => {
        window.clearTimeout(timer);
        finish(null);
      };
    } catch {
      window.clearTimeout(timer);
      finish(null);
    }
  });
}

export class SaveLoadManager {
  static async loadPrimarySave(): Promise<SaveSlotData | null> {
    // 1. Check fast synchronous localStorage backup first for instant responsiveness
    try {
      const raw = window.localStorage.getItem(LOCAL_SAVE_BACKUP_KEY);
      if (raw) {
        const parsed = validateSaveData(JSON.parse(raw));
        if (parsed) return parsed;
      }
    } catch {
      // Ignore storage access errors in restricted iframes
    }

    // 2. Check IndexedDB with strict timeout guard
    const db = await openDatabase();
    if (db) {
      try {
        const record = await new Promise<unknown>((resolve) => {
          const timer = window.setTimeout(() => resolve(null), 120);
          try {
            const tx = db.transaction(SAVE_STORE, 'readonly');
            const store = tx.objectStore(SAVE_STORE);
            const req = store.get(PRIMARY_SLOT_KEY);
            req.onsuccess = () => {
              window.clearTimeout(timer);
              resolve(req.result);
            };
            req.onerror = () => {
              window.clearTimeout(timer);
              resolve(null);
            };
            tx.onabort = () => {
              window.clearTimeout(timer);
              resolve(null);
            };
          } catch {
            window.clearTimeout(timer);
            resolve(null);
          }
        });
        db.close();
        const validated = validateSaveData(record);
        if (validated) return validated;
      } catch {
        try {
          db.close();
        } catch {
          // Ignore
        }
      }
    }

    return null;
  }

  static async savePrimarySlot(data: Omit<SaveSlotData, 'id'>): Promise<SaveSlotData> {
    const fullRecord: SaveSlotData = {
      ...data,
      id: PRIMARY_SLOT_KEY,
    };

    try {
      window.localStorage.setItem(LOCAL_SAVE_BACKUP_KEY, JSON.stringify(fullRecord));
    } catch {
      // Ignore storage quota or iframe sandbox errors
    }

    const db = await openDatabase();
    if (db) {
      try {
        await new Promise<void>((resolve) => {
          const timer = window.setTimeout(() => resolve(), 120);
          try {
            const tx = db.transaction(SAVE_STORE, 'readwrite');
            const store = tx.objectStore(SAVE_STORE);
            store.put(fullRecord);
            tx.oncomplete = () => {
              window.clearTimeout(timer);
              resolve();
            };
            tx.onerror = () => {
              window.clearTimeout(timer);
              resolve();
            };
            tx.onabort = () => {
              window.clearTimeout(timer);
              resolve();
            };
          } catch {
            window.clearTimeout(timer);
            resolve();
          }
        });
        db.close();
      } catch {
        try {
          db.close();
        } catch {
          // Ignore
        }
      }
    }

    return fullRecord;
  }

  static async clearPrimarySave(): Promise<void> {
    try {
      window.localStorage.removeItem(LOCAL_SAVE_BACKUP_KEY);
    } catch {
      // Ignore
    }
    const db = await openDatabase();
    if (db) {
      try {
        await new Promise<void>((resolve) => {
          const timer = window.setTimeout(() => resolve(), 120);
          try {
            const tx = db.transaction(SAVE_STORE, 'readwrite');
            tx.objectStore(SAVE_STORE).delete(PRIMARY_SLOT_KEY);
            tx.oncomplete = () => {
              window.clearTimeout(timer);
              resolve();
            };
            tx.onerror = () => {
              window.clearTimeout(timer);
              resolve();
            };
          } catch {
            window.clearTimeout(timer);
            resolve();
          }
        });
        db.close();
      } catch {
        try {
          db.close();
        } catch {
          // Ignore
        }
      }
    }
  }

  static loadSettings(): GameSettings {
    if (typeof window === 'undefined') {
      return structuredClone(DEFAULT_SETTINGS);
    }
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_SETTINGS);
      return sanitizeSettings(JSON.parse(raw));
    } catch {
      return structuredClone(DEFAULT_SETTINGS);
    }
  }

  static saveSettings(settings: GameSettings): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore quota errors
    }
  }
}
