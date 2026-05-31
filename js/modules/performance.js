// 节气花园 - 性能优化模块
// 音效格式/大小规范、图片懒加载

const AUDIO_SPECS = {
  sfx: {
    format: 'mp3',
    maxSize: 50 * 1024,
    recommended: { min: 10 * 1024, max: 30 * 1024 },
    files: ['click', 'water', 'coin', 'magic', 'crow', 'harvest']
  },
  ambient: {
    format: 'mp3',
    maxSize: 200 * 1024,
    recommended: { min: 50 * 1024, max: 150 * 1024 }
  },
  bgm: {
    format: 'mp3',
    maxSize: 500 * 1024,
    recommended: { min: 100 * 1024, max: 300 * 1024 }
  }
}

const IMAGE_SPECS = {
  icon: { maxWidth: 64, maxHeight: 64, maxSize: 10 * 1024 },
  thumbnail: { maxWidth: 128, maxHeight: 128, maxSize: 20 * 1024 },
  avatar: { maxWidth: 256, maxHeight: 256, maxSize: 50 * 1024 },
  background: { maxWidth: 750, maxHeight: 1334, maxSize: 150 * 1024 }
}

class LazyImageLoader {
  constructor(options = {}) {
    this.placeholder = options.placeholder || null
    this.rootMargin = options.rootMargin || '100px'
    this.threshold = options.threshold || 0.1
    this.observer = null
    this.loadedImages = new Set()
    this.failedImages = new Set()
    this.listeners = {}
    this.initObserver()
  }

  initObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      return
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.dataset.src
          if (src) {
            this.loadImage(img, src)
          }
        }
      })
    }, {
      rootMargin: this.rootMargin,
      threshold: this.threshold
    })
  }

  observe(element) {
    if (this.observer) {
      this.observer.observe(element)
    } else {
      const src = element.dataset.src
      if (src) {
        this.loadImage(element, src)
      }
    }
  }

  unobserve(element) {
    if (this.observer) {
      this.observer.unobserve(element)
    }
  }

  loadImage(element, src) {
    const img = wx.createImage()

    img.onload = () => {
      this.loadedImages.add(src)
      element.src = src
      element.dataset.loaded = 'true'
      this.notifyListeners('load', { element, src })
    }

    img.onerror = () => {
      this.failedImages.add(src)
      element.dataset.loaded = 'error'
      this.notifyListeners('error', { element, src })

      if (this.placeholder) {
        element.src = this.placeholder
      }
    }

    img.src = src
  }

  preload(src, callback) {
    if (this.loadedImages.has(src)) {
      callback(true)
      return
    }

    if (this.failedImages.has(src)) {
      callback(false)
      return
    }

    const img = wx.createImage()

    img.onload = () => {
      this.loadedImages.add(src)
      callback(true)
    }

    img.onerror = () => {
      this.failedImages.add(src)
      callback(false)
    }

    img.src = src
  }

  preloadBatch(sources, onProgress, onComplete) {
    let loaded = 0
    let failed = 0
    const total = sources.length

    sources.forEach(src => {
      this.preload(src, (success) => {
        if (success) {
          loaded++
        } else {
          failed++
        }

        if (onProgress) {
          onProgress({ loaded, failed, total, current: src })
        }

        if (loaded + failed === total && onComplete) {
          onComplete({ loaded, failed, total })
        }
      })
    })
  }

  isLoaded(src) {
    return this.loadedImages.has(src)
  }

  isFailed(src) {
    return this.failedImages.has(src)
  }

  addListener(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
  }

  removeListener(event, listener) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(l => l !== listener)
  }

  notifyListeners(event, data) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach(listener => {
      try {
        listener(data)
      } catch (e) {
        console.error('[LazyImageLoader] Listener error:', e)
      }
    })
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.loadedImages.clear()
    this.failedImages.clear()
    this.listeners = {}
  }
}

class AudioOptimizer {
  constructor() {
    this.audioContext = null
    this.loadedAudios = {}
    this.volume = 1.0
  }

  init() {
    try {
      this.audioContext = wx.createInnerAudioContext()
    } catch (e) {
      console.warn('[AudioOptimizer] Failed to create audio context:', e)
    }
  }

  async loadAudio(id, src, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.loadedAudios[id]) {
        resolve(this.loadedAudios[id])
        return
      }

      const audio = wx.createInnerAudio()
      audio.src = src

      audio.onCanplay(() => {
        const duration = audio.duration
        const estimatedSize = (audio.src || '').length * 0.75

        const optimized = {
          id,
          audio,
          duration,
          estimatedSize,
          valid: this.validateAudio(estimatedSize, options.type || 'sfx')
        }

        this.loadedAudios[id] = optimized
        resolve(optimized)
      })

      audio.onError((err) => {
        console.error(`[AudioOptimizer] Failed to load audio ${id}:`, err)
        reject(new Error(`Audio load failed: ${id}`))
      })

      audio.load()
    })
  }

  validateAudio(size, type) {
    const spec = AUDIO_SPECS[type] || AUDIO_SPECS.sfx
    return size <= spec.maxSize
  }

  play(id, options = {}) {
    const loaded = this.loadedAudios[id]
    if (!loaded) {
      console.warn(`[AudioOptimizer] Audio not loaded: ${id}`)
      return false
    }

    const audio = loaded.audio
    audio.volume = options.volume !== undefined ? options.volume : this.volume
    audio.playbackRate = options.speed || 1.0

    audio.play()
    return true
  }

  stop(id) {
    const loaded = this.loadedAudios[id]
    if (loaded) {
      loaded.audio.stop()
    }
  }

  stopAll() {
    Object.values(this.loadedAudios).forEach(loaded => {
      loaded.audio.stop()
    })
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    Object.values(this.loadedAudios).forEach(loaded => {
      loaded.audio.volume = this.volume
    })
  }

  getAudioInfo(id) {
    return this.loadedAudios[id] || null
  }

  getLoadedCount() {
    return Object.keys(this.loadedAudios).length
  }

  unload(id) {
    const loaded = this.loadedAudios[id]
    if (loaded) {
      loaded.audio.destroy()
      delete this.loadedAudios[id]
    }
  }

  unloadAll() {
    Object.keys(this.loadedAudios).forEach(id => {
      this.unload(id)
    })
  }
}

const lazyImageLoader = new LazyImageLoader()
const audioOptimizer = new AudioOptimizer()

function getAudioSpecs() {
  return AUDIO_SPECS
}

function getImageSpecs() {
  return IMAGE_SPECS
}

function createLazyImage(element, src, options = {}) {
  element.dataset.src = src
  element.dataset.loaded = 'pending'

  if (options.placeholder) {
    element.src = options.placeholder
  }

  lazyImageLoader.observe(element)

  return element
}

function preloadImages(sources, onProgress, onComplete) {
  lazyImageLoader.preloadBatch(sources, onProgress, onComplete)
}

function validateAudioSize(size, type) {
  const spec = AUDIO_SPECS[type] || AUDIO_SPECS.sfx
  return {
    valid: size <= spec.maxSize,
    size,
    maxAllowed: spec.maxSize,
    recommended: spec.recommended
  }
}

function validateImageSize(width, height, size, type) {
  const spec = IMAGE_SPECS[type] || IMAGE_SPECS.thumbnail
  return {
    valid: size <= spec.maxSize && width <= spec.maxWidth && height <= spec.maxHeight,
    width,
    height,
    size,
    maxWidth: spec.maxWidth,
    maxHeight: spec.maxHeight,
    maxSize: spec.maxSize
  }
}

module.exports = {
  lazyImageLoader,
  audioOptimizer,
  getAudioSpecs,
  getImageSpecs,
  createLazyImage,
  preloadImages,
  validateAudioSize,
  validateImageSize,
  AUDIO_SPECS,
  IMAGE_SPECS
}