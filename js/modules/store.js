// 节气花园 - 状态管理模块
// 基于 EventEmitter 的 store，替代 globals.js 直接读写

class Store extends wx.EventTarget {
  constructor() {
    super()
    this._state = {}
    this._listeners = {}
    this._changeLog = []
    this._maxLogSize = 100
  }

  _notify(key, newValue, oldValue) {
    const eventDetail = { key, newValue, oldValue, timestamp: Date.now() }
    this._changeLog.push(eventDetail)
    if (this._changeLog.length > this._maxLogSize) {
      this._changeLog.shift()
    }
    this.triggerEvent('change', eventDetail)
    if (this._listeners[key]) {
      this._listeners[key].forEach(listener => listener(newValue, oldValue))
    }
  }

  get(key, defaultValue = null) {
    if (key === undefined) {
      return { ...this._state }
    }
    const keys = key.split('.')
    let value = this._state
    for (const k of keys) {
      if (value === undefined || value === null) return defaultValue
      value = value[k]
    }
    return value !== undefined ? value : defaultValue
  }

  set(key, value, { silent = false } = {}) {
    const keys = key.split('.')
    const oldValue = this.get(key)
    let target = this._state

    for (let i = 0; i < keys.length - 1; i++) {
      if (typeof target[keys[i]] !== 'object') {
        target[keys[i]] = {}
      }
      target = target[keys[i]]
    }

    const lastKey = keys[keys.length - 1]
    if (target[lastKey] === value) return

    target[lastKey] = value

    if (!silent) {
      this._notify(key, value, oldValue)
    }
  }

  update(key, updater, { silent = false } = {}) {
    const current = this.get(key)
    const newValue = typeof updater === 'function' ? updater(current) : updater
    this.set(key, newValue, { silent })
    return newValue
  }

  on(key, listener) {
    if (!this._listeners[key]) {
      this._listeners[key] = []
    }
    this._listeners[key].push(listener)
    return () => this.off(key, listener)
  }

  off(key, listener) {
    if (!this._listeners[key]) return
    this._listeners[key] = this._listeners[key].filter(l => l !== listener)
  }

  once(key, listener) {
    const wrapper = (newValue, oldValue) => {
      this.off(key, wrapper)
      listener(newValue, oldValue)
    }
    return this.on(key, wrapper)
  }

  getChangeLog(since = 0) {
    return this._changeLog.filter(entry => entry.timestamp > since)
  }

  clearChangeLog() {
    this._changeLog = []
  }
}

const gameStore = new Store()

const DEFAULT_GAME_STATE = {
  currentScene: 'garden',
  randomEvent: { active: false },
  crowWarning: { active: false },
  menuExpanded: false,
  menuBtnPos: null,
  menuItems: null,
  updateStatus: {},
  gold: 0,
  petals: 0,
  pet: { type: 'cat' },
  selectedPlot: null,
  backBtnPos: { x: 30, y: 30, r: 20 },
  dailyTasks: {
    date: null,
    tasks: [],
    completed: 0
  },
  playerStats: {
    waterCount: 0,
    harvestCount: 0,
    chatCount: 0,
    petCount: 0
  },
  handbookRewards: {},
  pots: {
    unlocked: ['basic'],
    current: 'basic',
    seasonal: {
      spring: 'basic',
      summer: null,
      autumn: null,
      winter: null
    }
  },
  audioSettings: {
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.7,
    musicVolume: 0.5
  },
  currentSeason: 'spring',
  userInfo: null,
  buttons: [],
  selectedSeed: null,
  tutorial: {
    completed: false,
    step: 0,
    shownScenes: []
  }
}

gameStore._state = { ...DEFAULT_GAME_STATE }

gameStore.init = function(userState = {}) {
  this._state = { ...DEFAULT_GAME_STATE, ...userState }
  this.clearChangeLog()
  this.triggerEvent('init', this._state)
}

gameStore.reset = function() {
  this._state = { ...DEFAULT_GAME_STATE }
  this.clearChangeLog()
  this.triggerEvent('reset', this._state)
}

gameStore.exportState = function() {
  return JSON.parse(JSON.stringify(this._state))
}

gameStore.importState = function(state) {
  if (state && typeof state === 'object') {
    this._state = { ...DEFAULT_GAME_STATE, ...state }
    this.triggerEvent('import', this._state)
  }
}

gameStore.subscribe = function(listener) {
  this.on('change', listener)
  return () => this.off('change', listener)
}

gameStore.getHistory = function(key) {
  return this.getChangeLog()
    .filter(entry => entry.key === key)
    .map(entry => ({ value: entry.newValue, timestamp: entry.timestamp }))
}

module.exports = { gameStore, Store, DEFAULT_GAME_STATE }