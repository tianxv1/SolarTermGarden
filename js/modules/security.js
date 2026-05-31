// 节气花园 - 社交防刷模块
// 频率限制、敏感词过滤

const RATE_LIMITS = {
  createPost: { window: 60000, maxRequests: 5 },
  addComment: { window: 30000, maxRequests: 10 },
  likePost: { window: 60000, maxRequests: 20 },
  chatWithPet: { window: 10000, maxRequests: 6 },
  transferGold: { window: 60000, maxRequests: 3 },
  battle: { window: 30000, maxRequests: 5 }
}

const SENSITIVE_WORDS = [
  '反动', '分裂', '暴力', '恐怖', '色情', '赌博', '毒品',
  '诈骗', '钓鱼', '木马', '病毒', '黑客',
  '微信', 'QQ', '支付宝', '银行卡',
  '色情', '裸', '赌', '博彩',
  '发票', '代开', '套现', '返利'
]

const SENSITIVE_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  /1[3-9]\d{9}/,
  /\d{16,18}/,
  /https?:\/\/[^\s]+/,
  /[零一二三四五六七八九十百千万億兆]/g
]

class RateLimiter {
  constructor() {
    this.requests = {}
    this.blocked = {}
  }

  _getKey(action, openid) {
    return `${action}:${openid || 'anonymous'}`
  }

  checkLimit(action, openid = null) {
    const key = this._getKey(action, openid)
    const limit = RATE_LIMITS[action]

    if (!limit) return { allowed: true, remaining: Infinity, resetAt: null }

    if (this.blocked[key] && Date.now() < this.blocked[key]) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: this.blocked[key],
        blocked: true
      }
    }

    if (!this.requests[key]) {
      this.requests[key] = []
    }

    const now = Date.now()
    const windowStart = now - limit.window
    this.requests[key] = this.requests[key].filter(t => t > windowStart)

    if (this.requests[key].length >= limit.maxRequests) {
      this.blocked[key] = now + limit.window
      this.requests[key] = []

      return {
        allowed: false,
        remaining: 0,
        resetAt: this.blocked[key],
        blocked: true
      }
    }

    return {
      allowed: true,
      remaining: limit.maxRequests - this.requests[key].length - 1,
      resetAt: this.requests[key].length > 0
        ? Math.min(...this.requests[key]) + limit.window
        : null
    }
  }

  recordRequest(action, openid = null) {
    const key = this._getKey(action, openid)
    const limit = RATE_LIMITS[action]

    if (!limit) return

    if (!this.requests[key]) {
      this.requests[key] = []
    }

    this.requests[key].push(Date.now())
  }

  resetLimit(action, openid = null) {
    const key = this._getKey(action, openid)
    delete this.requests[key]
    delete this.blocked[key]
  }

  getStatus(action, openid = null) {
    const key = this._getKey(action, openid)
    const limit = RATE_LIMITS[action]

    if (!limit) {
      return { limited: false, count: 0, max: Infinity }
    }

    const now = Date.now()
    const windowStart = now - limit.window
    const validRequests = this.requests[key]
      ? this.requests[key].filter(t => t > windowStart)
      : []

    return {
      limited: this.blocked[key] && Date.now() < this.blocked[key],
      count: validRequests.length,
      max: limit.maxRequests,
      remaining: Math.max(0, limit.maxRequests - validRequests.length),
      resetAt: this.blocked[key] || null
    }
  }
}

class SensitiveWordFilter {
  constructor() {
    this.wordSet = new Set(SENSITIVE_WORDS.map(w => w.toLowerCase()))
  }

  check(text) {
    if (!text || typeof text !== 'string') {
      return { hasSensitive: false, words: [], replaced: text }
    }

    const words = []
    const lowerText = text.toLowerCase()

    for (const word of this.wordSet) {
      if (lowerText.includes(word)) {
        words.push(word)
      }
    }

    for (const pattern of SENSITIVE_PATTERNS) {
      const matches = text.match(pattern)
      if (matches) {
        for (const match of matches) {
          if (!words.includes(match)) {
            words.push(match)
          }
        }
      }
    }

    return {
      hasSensitive: words.length > 0,
      words,
      replaced: this.replace(text)
    }
  }

  replace(text) {
    if (!text || typeof text !== 'string') return text

    let result = text

    for (const word of this.wordSet) {
      const regex = new RegExp(word, 'gi')
      result = result.replace(regex, '*'.repeat(word.length))
    }

    for (const pattern of SENSITIVE_PATTERNS) {
      result = result.replace(pattern, '***')
    }

    return result
  }

  addWords(words) {
    for (const word of words) {
      this.wordSet.add(word.toLowerCase())
    }
  }

  removeWords(words) {
    for (const word of words) {
      this.wordSet.delete(word.toLowerCase())
    }
  }
}

const rateLimiter = new RateLimiter()
const sensitiveFilter = new SensitiveWordFilter()

function checkRateLimit(action, openid) {
  return rateLimiter.checkLimit(action, openid)
}

function recordAction(action, openid) {
  rateLimiter.recordRequest(action, openid)
}

function filterSensitiveWords(text) {
  return sensitiveFilter.check(text)
}

function replaceSensitiveWords(text) {
  return sensitiveFilter.replace(text)
}

function validateContent(content, options = {}) {
  const {
    checkRateLimit: checkLimit = true,
    action = 'createPost',
    openid = null,
    minLength = 1,
    maxLength = 1000
  } = options

  const errors = []

  if (!content || typeof content !== 'string') {
    errors.push('内容不能为空')
    return { valid: false, errors }
  }

  if (content.trim().length < minLength) {
    errors.push(`内容长度不能少于 ${minLength} 个字符`)
  }

  if (content.length > maxLength) {
    errors.push(`内容长度不能超过 ${maxLength} 个字符`)
  }

  if (checkLimit) {
    const rateCheck = checkRateLimit(action, openid)
    if (!rateCheck.allowed) {
      errors.push('操作过于频繁，请稍后再试')
      return { valid: false, errors, rateLimited: true, resetAt: rateCheck.resetAt }
    }
  }

  const sensitiveCheck = filterSensitiveWords(content)
  if (sensitiveCheck.hasSensitive) {
    errors.push('内容包含敏感词，请修改后重试')
  }

  return {
    valid: errors.length === 0,
    errors,
    sensitiveWords: sensitiveCheck.words,
    replaced: sensitiveCheck.replaced
  }
}

function getSecurityReport(openid) {
  const actions = Object.keys(RATE_LIMITS)
  const report = {}

  for (const action of actions) {
    report[action] = rateLimiter.getStatus(action, openid)
  }

  return report
}

function resetSecurityData(openid = null) {
  if (openid) {
    for (const action of Object.keys(RATE_LIMITS)) {
      rateLimiter.resetLimit(action, openid)
    }
  } else {
    Object.keys(rateLimiter.requests).forEach(key => {
      delete rateLimiter.requests[key]
    })
    Object.keys(rateLimiter.blocked).forEach(key => {
      delete rateLimiter.blocked[key]
    })
  }
}

module.exports = {
  rateLimiter,
  sensitiveFilter,
  checkRateLimit,
  recordAction,
  filterSensitiveWords,
  replaceSensitiveWords,
  validateContent,
  getSecurityReport,
  resetSecurityData,
  RATE_LIMITS
}