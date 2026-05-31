// 节气花园 - 本地缓存与云端同步模块
// 花园/宠物数据先写本地，定时或关键节点同步

const { callWithFallback } = require('./fallback')

const STORAGE_KEYS = {
  GARDEN_DATA: 'garden_data',
  PET_DATA: 'pet_data',
  USER_DATA: 'user_data',
  SYNC_TIMESTAMP: 'sync_timestamp',
  PENDING_SYNC: 'pending_sync'
}

const SYNC_INTERVAL = 300000
const CRITICAL_ACTIONS = ['harvest', 'buySeed', 'feedPet', 'evolvePet']

class DataCache {
  constructor() {
    this.pendingSync = []
    this.syncTimer = null
    this.isSyncing = false
    this.lastSyncTime = null
  }

  setStorage(key, data) {
    try {
      wx.setStorageSync(key, data)
      return true
    } catch (e) {
      console.error('[DataCache] Storage write failed:', e)
      return false
    }
  }

  getStorage(key, defaultValue = null) {
    try {
      const data = wx.getStorageSync(key)
      return data !== '' ? data : defaultValue
    } catch (e) {
      console.error('[DataCache] Storage read failed:', e)
      return defaultValue
    }
  }

  removeStorage(key) {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (e) {
      return false
    }
  }
}

class SyncManager {
  constructor() {
    this.cache = new DataCache()
    this.syncInterval = SYNC_INTERVAL
    this.isOnline = true
    this.listeners = []
  }

  addSyncListener(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data)
      } catch (e) {
        console.error('[SyncManager] Listener error:', e)
      }
    })
  }

  saveLocal(key, data, { immediate = false, critical = false } = {}) {
    const wrappedData = {
      data,
      timestamp: Date.now(),
      synced: false,
      version: 1
    }

    this.cache.setStorage(key, wrappedData)

    if (critical || immediate) {
      this.queueSync(key, wrappedData)
    }

    if (critical) {
      this.triggerSync()
    }
  }

  loadLocal(key, defaultValue = null) {
    const wrapped = this.cache.getStorage(key)
    if (wrapped && wrapped.data) {
      return wrapped.data
    }
    return defaultValue
  }

  queueSync(key, data) {
    const pending = this.cache.getStorage(STORAGE_KEYS.PENDING_SYNC) || []
    const existing = pending.findIndex(p => p.key === key)

    if (existing >= 0) {
      pending[existing] = { key, data, timestamp: Date.now() }
    } else {
      pending.push({ key, data, timestamp: Date.now() })
    }

    this.cache.setStorage(STORAGE_KEYS.PENDING_SYNC, pending)
  }

  async triggerSync() {
    if (this.isSyncing || !this.isOnline) return

    const pending = this.cache.getStorage(STORAGE_KEYS.PENDING_SYNC) || []
    if (pending.length === 0) return

    this.isSyncing = true
    this.notifyListeners('sync:start', { pendingCount: pending.length })

    const results = { success: [], failed: [] }

    for (const item of pending) {
      try {
        await this.syncItem(item.key, item.data)
        results.success.push(item.key)
      } catch (e) {
        console.error(`[SyncManager] Sync failed for ${item.key}:`, e)
        results.failed.push(item.key)
      }
    }

    if (results.failed.length === 0) {
      this.cache.setStorage(STORAGE_KEYS.PENDING_SYNC, [])
      this.lastSyncTime = Date.now()
      this.cache.setStorage(STORAGE_KEYS.SYNC_TIMESTAMP, this.lastSyncTime)
    }

    this.isSyncing = false
    this.notifyListeners('sync:complete', results)

    return results
  }

  async syncItem(key, data) {
    const syncHandlers = {
      [STORAGE_KEYS.GARDEN_DATA]: () => this.syncGardenData(data),
      [STORAGE_KEYS.PET_DATA]: () => this.syncPetData(data),
      [STORAGE_KEYS.USER_DATA]: () => this.syncUserData(data)
    }

    const handler = syncHandlers[key]
    if (handler) {
      return await handler()
    }
  }

  async syncGardenData(data) {
    const result = await callWithFallback({
      name: 'syncGarden',
      data: { gardenData: data.data, timestamp: data.timestamp }
    })
    return result
  }

  async syncPetData(data) {
    const result = await callWithFallback({
      name: 'syncPet',
      data: { petData: data.data, timestamp: data.timestamp }
    })
    return result
  }

  async syncUserData(data) {
    const result = await callWithFallback({
      name: 'syncUser',
      data: { userData: data.data, timestamp: data.timestamp }
    })
    return result
  }

  startAutoSync(interval = this.syncInterval) {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }

    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.triggerSync()
      }
    }, interval)

    this.notifyListeners('sync:started', { interval })
  }

  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
    this.notifyListeners('sync:stopped', {})
  }

  setOnlineStatus(online) {
    const wasOffline = !this.isOnline
    this.isOnline = online

    if (online && wasOffline) {
      this.notifyListeners('network:online', {})
      this.triggerSync()
    } else if (!online) {
      this.notifyListeners('network:offline', {})
    }
  }

  getPendingCount() {
    const pending = this.cache.getStorage(STORAGE_KEYS.PENDING_SYNC) || []
    return pending.length
  }

  getLastSyncTime() {
    if (!this.lastSyncTime) {
      this.lastSyncTime = this.cache.getStorage(STORAGE_KEYS.SYNC_TIMESTAMP)
    }
    return this.lastSyncTime
  }

  clearLocalData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.cache.removeStorage(key)
    })
    this.notifyListeners('cache:cleared', {})
  }
}

const syncManager = new SyncManager()

syncManager.on = syncManager.addSyncListener
syncManager.off = (listener) => {
  syncManager.listeners = syncManager.listeners.filter(l => l !== listener)
}

function saveGardenData(gardenData, options = {}) {
  return syncManager.saveLocal(STORAGE_KEYS.GARDEN_DATA, gardenData, options)
}

function loadGardenData() {
  return syncManager.loadLocal(STORAGE_KEYS.GARDEN_DATA)
}

function savePetData(petData, options = {}) {
  return syncManager.saveLocal(STORAGE_KEYS.PET_DATA, petData, options)
}

function loadPetData() {
  return syncManager.loadLocal(STORAGE_KEYS.PET_DATA)
}

function saveUserData(userData, options = {}) {
  return syncManager.saveLocal(STORAGE_KEYS.USER_DATA, userData, options)
}

function loadUserData() {
  return syncManager.loadLocal(STORAGE_KEYS.USER_DATA)
}

module.exports = {
  syncManager,
  saveGardenData,
  loadGardenData,
  savePetData,
  loadPetData,
  saveUserData,
  loadUserData,
  STORAGE_KEYS
}