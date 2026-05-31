// 节气花园 - i18n 多语言模块
// 文案集中管理，方便后续多语言支持

const DEFAULT_LOCALE = 'zh-CN'
const STORAGE_KEY = 'game_locale'

const LOCALES = {
  'zh-CN': {
    code: 'zh-CN',
    name: '简体中文',
    dir: 'ltr'
  },
  'zh-TW': {
    code: 'zh-TW',
    name: '繁體中文',
    dir: 'ltr'
  },
  'en': {
    code: 'en',
    name: 'English',
    dir: 'ltr'
  },
  'ja': {
    code: 'ja',
    name: '日本語',
    dir: 'ltr'
  }
}

const MESSAGES = {
  'zh-CN': {
    common: {
      confirm: '确定',
      cancel: '取消',
      close: '关闭',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      loading: '加载中...',
      success: '操作成功',
      error: '操作失败',
      retry: '重试'
    },
    garden: {
      title: '我的花园',
      plotEmpty: '空地',
      plantSeed: '播种',
      water: '浇水',
      fertilize: '施肥',
      harvest: '收获',
      growing: '生长中',
      harvestable: '可收获',
      withered: '已枯萎'
    },
    shop: {
      title: '种子商店',
      buy: '购买',
      price: '价格',
      gold: '金币'
    },
    pet: {
      title: '宠物屋',
      feed: '喂养',
      play: '互动',
      chat: '聊天',
      hunger: '饱腹度',
      energy: '精力值',
      intimacy: '亲密度',
      level: '等级'
    },
    solarTerms: {
      spring: '春',
      summer: '夏',
      autumn: '秋',
      winter: '冬'
    },
    tasks: {
      title: '每日任务',
      water: '浇水任务',
      harvest: '收获任务',
      chat: '聊天任务',
      pet: '互动任务'
    }
  },
  'en': {
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      retry: 'Retry'
    },
    garden: {
      title: 'My Garden',
      plotEmpty: 'Empty',
      plantSeed: 'Plant',
      water: 'Water',
      fertilize: 'Fertilize',
      harvest: 'Harvest',
      growing: 'Growing',
      harvestable: 'Ready',
      withered: 'Withered'
    },
    shop: {
      title: 'Seed Shop',
      buy: 'Buy',
      price: 'Price',
      gold: 'Gold'
    },
    pet: {
      title: 'Pet House',
      feed: 'Feed',
      play: 'Play',
      chat: 'Chat',
      hunger: 'Hunger',
      energy: 'Energy',
      intimacy: 'Intimacy',
      level: 'Level'
    },
    solarTerms: {
      spring: 'Spring',
      summer: 'Summer',
      autumn: 'Autumn',
      winter: 'Winter'
    },
    tasks: {
      title: 'Daily Tasks',
      water: 'Water Task',
      harvest: 'Harvest Task',
      chat: 'Chat Task',
      pet: 'Play Task'
    }
  },
  'zh-TW': {
    common: {
      confirm: '確定',
      cancel: '取消',
      close: '關閉',
      save: '儲存',
      delete: '刪除',
      edit: '編輯',
      loading: '載入中...',
      success: '操作成功',
      error: '操作失敗',
      retry: '重試'
    },
    garden: {
      title: '我的花園',
      plotEmpty: '空地',
      plantSeed: '播種',
      water: '澆水',
      fertilize: '施肥',
      harvest: '收穫',
      growing: '生長中',
      harvestable: '可收穫',
      withered: '已枯萎'
    },
    shop: {
      title: '種子商店',
      buy: '購買',
      price: '價格',
      gold: '金幣'
    },
    pet: {
      title: '寵物屋',
      feed: '餵養',
      play: '互動',
      chat: '聊天',
      hunger: '飽腹度',
      energy: '精力值',
      intimacy: '親密度',
      level: '等級'
    },
    solarTerms: {
      spring: '春',
      summer: '夏',
      autumn: '秋',
      winter: '冬'
    },
    tasks: {
      title: '每日任務',
      water: '澆水任務',
      harvest: '收穫任務',
      chat: '聊天任務',
      pet: '互動任務'
    }
  },
  'ja': {
    common: {
      confirm: '確認',
      cancel: 'キャンセル',
      close: '閉じる',
      save: '保存',
      delete: '削除',
      edit: '編集',
      loading: '読み込み中...',
      success: '成功',
      error: 'エラー',
      retry: '再試行'
    },
    garden: {
      title: '私の庭',
      plotEmpty: '空地',
      plantSeed: '植える',
      water: '水やり',
      fertilize: '肥料',
      harvest: '収穫',
      growing: '成長中',
      harvestable: '収穫可能',
      withered: '枯れた'
    },
    shop: {
      title: '種の店',
      buy: '購入',
      price: '価格',
      gold: 'コイン'
    },
    pet: {
      title: 'ペット小屋',
      feed: '餌をあげる',
      play: '遊ぶ',
      chat: '聊天',
      hunger: '満腹度',
      energy: '精力',
      intimacy: '親密度',
      level: 'レベル'
    },
    solarTerms: {
      spring: '春',
      summer: '夏',
      autumn: '秋',
      winter: '冬'
    },
    tasks: {
      title: 'デイリータスク',
      water: '水やりタスク',
      harvest: '収穫タスク',
      chat: '聊天タスク',
      pet: '遊びタスク'
    }
  }
}

class I18n {
  constructor() {
    this.locale = DEFAULT_LOCALE
    this.messages = MESSAGES
    this.fallback = MESSAGES[DEFAULT_LOCALE]
    this.listeners = []
    this.numberFormats = {}
    this.dateFormats = {}
  }

  setLocale(locale) {
    if (!LOCALES[locale]) {
      console.warn(`[I18n] Locale not supported: ${locale}`)
      return false
    }

    const oldLocale = this.locale
    this.locale = locale
    this.fallback = this.messages[locale]

    try {
      wx.setStorageSync(STORAGE_KEY, locale)
    } catch (e) {
      console.error('[I18n] Failed to save locale:', e)
    }

    this.notifyListeners({ type: 'localeChanged', oldLocale, newLocale: locale })
    return true
  }

  getLocale() {
    return this.locale
  }

  getAvailableLocales() {
    return Object.values(LOCALES)
  }

  init() {
    try {
      const savedLocale = wx.getStorageSync(STORAGE_KEY)
      if (savedLocale && LOCALES[savedLocale]) {
        this.locale = savedLocale
        this.fallback = this.messages[savedLocale]
      } else {
        const systemInfo = wx.getSystemInfoSync()
        const systemLocale = systemInfo.language || systemInfo.locale || DEFAULT_LOCALE

        if (LOCALES[systemLocale]) {
          this.locale = systemLocale
          this.fallback = this.messages[systemLocale]
        }
      }
    } catch (e) {
      console.warn('[I18n] Failed to init from storage:', e)
    }
  }

  t(key, params = {}) {
    const keys = key.split('.')
    let value = this.fallback

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        value = null
        break
      }
    }

    if (value === null || value === undefined) {
      const defaultValue = this.getDefaultMessage(key)
      return this.interpolate(defaultValue, params)
    }

    if (typeof value !== 'string') {
      console.warn(`[I18n] Translation for "${key}" is not a string`)
      return key
    }

    return this.interpolate(value, params)
  }

  getDefaultMessage(key) {
    const keys = key.split('.')
    let value = MESSAGES[DEFAULT_LOCALE]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  interpolate(message, params) {
    if (!params || Object.keys(params).length === 0) {
      return message
    }

    return message.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match
    })
  }

  plural(key, count, options = {}) {
    const { zero, one, two, few, many, other } = options

    let choice
    if (count === 0 && zero !== undefined) {
      choice = zero
    } else if (count === 1 && one !== undefined) {
      choice = one
    } else if (count === 2 && two !== undefined) {
      choice = two
    } else if (count > 1 && count < 5 && few !== undefined) {
      choice = few
    } else if (other !== undefined) {
      choice = other
    } else {
      choice = this.t(key, { count })
    }

    return this.interpolate(choice, { count })
  }

  formatNumber(number, options = {}) {
    const locale = this.locale

    if (this.numberFormats[locale]) {
      return this.numberFormats[locale](number, options)
    }

    return number.toLocaleString(locale, options)
  }

  formatDate(date, options = {}) {
    const locale = this.locale

    if (this.dateFormats[locale]) {
      return this.dateFormats[locale](date, options)
    }

    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString(locale, options)
  }

  addMessages(locale, messages) {
    if (!this.messages[locale]) {
      this.messages[locale] = {}
    }

    this.deepMerge(this.messages[locale], messages)
  }

  deepMerge(target, source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          if (!target[key]) {
            target[key] = {}
          }
          this.deepMerge(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
    }
  }

  onLocaleChange(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (e) {
        console.error('[I18n] Listener error:', e)
      }
    })
  }
}

const i18n = new I18n()

function t(key, params) {
  return i18n.t(key, params)
}

function setLocale(locale) {
  return i18n.setLocale(locale)
}

function getLocale() {
  return i18n.getLocale()
}

function getAvailableLocales() {
  return i18n.getAvailableLocales()
}

function formatNumber(number, options) {
  return i18n.formatNumber(number, options)
}

function formatDate(date, options) {
  return i18n.formatDate(date, options)
}

module.exports = {
  i18n,
  t,
  setLocale,
  getLocale,
  getAvailableLocales,
  formatNumber,
  formatDate,
  LOCALES,
  MESSAGES
}