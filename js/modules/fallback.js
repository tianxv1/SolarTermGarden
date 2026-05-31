// 节气花园 - 异常降级策略模块
// 云函数超时、AI不可用时的fallback方案

const CONFIG = require('../config')

const DEFAULT_RESPONSES = {
  cat: [
    { keyword: '天气', response: '今天天气很好呢，主人要带我出去散步吗？' },
    { keyword: '饿了', response: '喵~ 肚子有点饿了呢，主人有小鱼干吗？' },
    { keyword: '花园', response: '花园里的花开得好美呀~' },
    { keyword: '你好', response: '喵~ 你好呀主人！' },
    { keyword: '再见', response: '喵呜~ 主人再见，早点回来哦~' },
    { default: '喵~ 主人说得对！' }
  ],
  dog: [
    { keyword: '天气', response: '汪汪！今天天气真棒，适合出去玩！' },
    { keyword: '饿了', response: '汪！肚子咕咕叫了，有狗粮吗？' },
    { keyword: '花园', response: '花园里的草地好软，想打滚！' },
    { keyword: '你好', response: '汪汪！你好！你是我的主人吗？' },
    { keyword: '再见', response: '汪！主人早点回来，我会乖乖等着的！' },
    { default: '汪汪！主人说得对！' }
  ],
  owl: [
    { keyword: '天气', response: '咕~ 根据我的观察，今天天气宜人。' },
    { keyword: '饿了', response: '咕... 有点饿了，但我要保持优雅。' },
    { keyword: '花园', response: '花园的布局很有条理，主人很用心呢。' },
    { keyword: '你好', response: '咕~ 你好，主人有什么需要我帮助的吗？' },
    { keyword: '再见', response: '咕~ 再见，愿智慧与你同行。' },
    { default: '咕~ 我明白了。' }
  ]
}

class FallbackManager {
  constructor() {
    this.failureCount = {}
    this.circuitBreaker = {}
    this.retryQueue = []
    this.maxRetries = 3
    this.circuitOpenAfter = 5
    this.circuitResetTimeout = 60000
  }

  isCircuitOpen(functionName) {
    if (!this.circuitBreaker[functionName]) return false
    const cb = this.circuitBreaker[functionName]
    if (cb.state === 'open') {
      if (Date.now() - cbopenedAt > this.circuitResetTimeout) {
        cb.state = 'half-open'
        return false
      }
      return true
    }
    return false
  }

  recordFailure(functionName) {
    if (!this.failureCount[functionName]) {
      this.failureCount[functionName] = 0
    }
    this.failureCount[functionName]++

    if (!this.circuitBreaker[functionName]) {
      this.circuitBreaker[functionName] = { state: 'closed', failures: 0, openedAt: 0 }
    }

    const cb = this.circuitBreaker[functionName]
    cb.failures++

    if (cb.failures >= this.circuitOpenAfter) {
      cb.state = 'open'
      cb.openedAt = Date.now()
    }
  }

  recordSuccess(functionName) {
    this.failureCount[functionName] = 0
    if (this.circuitBreaker[functionName]) {
      this.circuitBreaker[functionName] = { state: 'closed', failures: 0, openedAt: 0 }
    }
  }

  getFallbackResponse(petType, userMessage) {
    const responses = DEFAULT_RESPONSES[petType] || DEFAULT_RESPONSES.cat

    for (const item of responses) {
      if (item.keyword && userMessage.includes(item.keyword)) {
        return item.response
      }
    }

    return responses[responses.length - 1].default
  }

  getFallbackForCloudFunction(functionName, defaultValue = null) {
    const fallbacks = {
      chatWithPet: () => ({ success: false, content: 'AI暂时不可用，请稍后再试', error: 'circuit_open' }),
      createPost: () => ({ success: false, message: '发布功能暂时不可用，请稍后再试' }),
      addComment: () => ({ success: false, message: '评论功能暂时不可用，请稍后再试' }),
      crowAttack: () => ({ success: false, error: 'function_disabled' }),
      initDatabase: () => ({ success: false, message: '初始化功能暂时不可用' })
    }

    const fallback = fallbacks[functionName]
    return fallback ? fallback() : defaultValue
  }
}

const fallbackManager = new FallbackManager()

async function callWithFallback(options) {
  const {
    name,
    data,
    timeout = CONFIG.ai?.responseTimeout || 10000,
    retries = fallbackManager.maxRetries,
    fallback
  } = options

  if (fallbackManager.isCircuitOpen(name)) {
    console.log(`[Fallback] Circuit open for ${name}, using fallback`)
    return fallback ? fallback() : fallbackManager.getFallbackForCloudFunction(name)
  }

  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        wx.cloud.callFunction({ name, data }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout)
        )
      ])

      fallbackManager.recordSuccess(name)
      return result
    } catch (error) {
      lastError = error
      console.warn(`[Fallback] Attempt ${attempt + 1} failed for ${name}:`, error.message)

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  fallbackManager.recordFailure(name)

  if (fallback) {
    return fallback()
  }

  return fallbackManager.getFallbackForCloudFunction(name)
}

function validateCloudFunctionResponse(response, expectedFields = []) {
  if (!response || typeof response !== 'object') return false

  if (expectedFields.length > 0) {
    return expectedFields.every(field => field in response)
  }

  return response.success !== undefined
}

module.exports = {
  fallbackManager,
  callWithFallback,
  validateCloudFunctionResponse,
  DEFAULT_RESPONSES
}