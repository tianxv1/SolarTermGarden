// 节气花园 - 用户反馈系统模块
// 反馈收集、问题报告、建议提交

const FEEDBACK_TYPES = {
  bug: { id: 'bug', name: '问题反馈', icon: '🐛', color: '#ef4444' },
  suggestion: { id: 'suggestion', name: '功能建议', icon: '💡', color: '#3b82f6' },
  complaint: { id: 'complaint', name: '投诉', icon: '😠', color: '#f59e0b' },
  compliment: { id: 'compliment', name: '好评', icon: '😍', color: '#22c55e' },
  other: { id: 'other', name: '其他', icon: '📝', color: '#8b5cf6' }
}

const FEEDBACK_STATUS = {
  pending: { id: 'pending', name: '待处理', color: '#f59e0b' },
  reviewing: { id: 'reviewing', name: '处理中', color: '#3b82f6' },
  resolved: { id: 'resolved', name: '已解决', color: '#22c55e' },
  rejected: { id: 'rejected', name: '已拒绝', color: '#9ca3af' }
}

const FEEDBACK_PRIORITY = {
  low: { id: 'low', name: '低', color: '#22c55e' },
  medium: { id: 'medium', name: '中', color: '#f59e0b' },
  high: { id: 'high', name: '高', color: '#ef4444' }
}

const QUICK_FEEDBACK_QUESTIONS = [
  '游戏运行卡顿',
  '部分功能无法使用',
  '希望增加新的作物/宠物',
  '界面设计可以更美观',
  '希望能添加好友功能',
  '排行榜功能很棒',
  '新手引导很有帮助',
  '离线收益很实用'
]

class FeedbackManager {
  constructor() {
    this.currentUserId = null
    this.feedbackHistory = []
    this.unreadReplies = 0
    this.listeners = {}
  }

  setCurrentUser(openid) {
    this.currentUserId = openid
  }

  async submitFeedback(options = {}) {
    const {
      type = 'other',
      content,
      contact = '',
      images = [],
      gameVersion = '',
      deviceInfo = '',
      relatedFeature = ''
    } = options

    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    if (!content || content.trim().length < 5) {
      return { success: false, message: '反馈内容至少5个字符' }
    }

    if (content.length > 500) {
      return { success: false, message: '反馈内容不能超过500字符' }
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'submitFeedback',
        data: {
          userId: this.currentUserId,
          type,
          content: content.trim(),
          contact: contact.trim(),
          images,
          gameVersion: gameVersion || this.getGameVersion(),
          deviceInfo: deviceInfo || this.getDeviceInfo(),
          relatedFeature,
          createTime: Date.now()
        }
      })

      if (result.success) {
        const feedback = {
          id: result.feedbackId,
          type,
          content: content.trim(),
          status: 'pending',
          createTime: Date.now()
        }
        this.feedbackHistory.unshift(feedback)
        this.notifyListeners('feedbackSubmitted', feedback)
        return { success: true, feedbackId: result.feedbackId }
      }

      return { success: false, message: result.message || '提交失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async loadFeedbackHistory() {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'getFeedbackHistory',
        data: { userId: this.currentUserId }
      })

      if (result.success) {
        this.feedbackHistory = result.feedbacks || []
        this.unreadReplies = result.unreadCount || 0
        this.notifyListeners('historyLoaded', { feedbacks: this.feedbackHistory })
        return { success: true, feedbacks: this.feedbackHistory }
      }

      return { success: false, message: result.message || '加载失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async markAsRead(feedbackId) {
    if (!this.currentUserId) return

    try {
      await wx.cloud.callFunction({
        name: 'markFeedbackRead',
        data: {
          userId: this.currentUserId,
          feedbackId
        }
      })

      const feedback = this.feedbackHistory.find(f => f.id === feedbackId)
      if (feedback && !feedback.read) {
        feedback.read = true
        this.unreadReplies = Math.max(0, this.unreadReplies - 1)
        this.notifyListeners('feedbackRead', { feedbackId })
      }
    } catch (error) {
      console.error('[Feedback] Mark read failed:', error)
    }
  }

  async rateFeedback(feedbackId, rating, comment = '') {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    if (rating < 1 || rating > 5) {
      return { success: false, message: '评分范围1-5' }
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'rateFeedback',
        data: {
          userId: this.currentUserId,
          feedbackId,
          rating,
          comment: comment.trim()
        }
      })

      if (result.success) {
        this.notifyListeners('feedbackRated', { feedbackId, rating })
        return { success: true }
      }

      return { success: false, message: result.message || '评价失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  getFeedbackHistory() {
    return this.feedbackHistory
  }

  getUnreadCount() {
    return this.unreadReplies
  }

  getGameVersion() {
    try {
      return wx.getSystemInfoSync().version || '1.0.0'
    } catch {
      return '1.0.0'
    }
  }

  getDeviceInfo() {
    try {
      const info = wx.getSystemInfoSync()
      return `${info.model} | ${info.system} | ${info.SDKVersion}`
    } catch {
      return 'Unknown'
    }
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(l => l !== listener)
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => {
        try {
          listener(data)
        } catch (e) {
          console.error('[FeedbackManager] Listener error:', e)
        }
      })
    }
  }
}

const feedbackManager = new FeedbackManager()

function renderFeedbackForm(ctx, screenWidth, screenHeight, options = {}) {
  const {
    selectedType = 'other',
    content = '',
    contact = '',
    scrollY = 0,
    onTypeSelect = null,
    onContentChange = null,
    onContactChange = null,
    onSubmit = null
  } = options

  let currentY = 80 - scrollY

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('反馈类型', 20, currentY + 20)

  currentY += 40
  const typeKeys = Object.keys(FEEDBACK_TYPES)
  const typeBtnWidth = (screenWidth - 50) / typeKeys.length - 5

  typeKeys.forEach((key, i) => {
    const type = FEEDBACK_TYPES[key]
    const x = 20 + i * (typeBtnWidth + 5)
    const isSelected = key === selectedType

    ctx.fillStyle = isSelected ? type.color : 'rgba(0, 0, 0, 0.05)'
    roundRect(ctx, x, currentY, typeBtnWidth, 40, [8, 8, 8, 8])
    ctx.fill()

    if (isSelected) {
      ctx.strokeStyle = type.color
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.fillStyle = isSelected ? '#fff' : '#666'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(type.icon, x + typeBtnWidth / 2, currentY + 18)
    ctx.font = isSelected ? 'bold 10px sans-serif' : '10px sans-serif'
    ctx.fillText(type.name, x + typeBtnWidth / 2, currentY + 33)
  })

  currentY += 60
  ctx.fillStyle = '#fff'
  roundRect(ctx, 20, currentY, screenWidth - 40, 150, [12, 12, 12, 12])
  ctx.fill()

  ctx.fillStyle = '#999'
  ctx.font = '12px sans-serif'
  if (content.length === 0) {
    ctx.fillText('请详细描述您的问题或建议...', 30, currentY + 25)
  }

  ctx.fillStyle = '#333'
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'left'
  const displayContent = content.length > 200 ? content.substring(0, 200) + '...' : content
  const lines = wrapText(ctx, displayContent, screenWidth - 60)
  lines.slice(0, 6).forEach((line, i) => {
    ctx.fillText(line, 30, currentY + 25 + i * 20)
  })

  currentY += 170
  ctx.fillStyle = '#fff'
  roundRect(ctx, 20, currentY, screenWidth - 40, 40, [8, 8, 8, 8])
  ctx.fill()

  ctx.fillStyle = '#999'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('联系方式（选填）', 30, currentY + 25)

  currentY += 60

  ctx.fillStyle = 'rgba(201, 48, 90, 0.9)'
  roundRect(ctx, 20, currentY, screenWidth - 40, 50, [25, 25, 25, 25])
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('提交反馈', screenWidth / 2, currentY + 32)

  return {
    submitBtn: { x: 20, y: currentY, width: screenWidth - 40, height: 50 }
  }
}

function renderFeedbackHistoryItem(ctx, screenWidth, feedback, index) {
  const itemY = index * 90
  const type = FEEDBACK_TYPES[feedback.type] || FEEDBACK_TYPES.other
  const status = FEEDBACK_STATUS[feedback.status] || FEEDBACK_STATUS.pending

  ctx.fillStyle = feedback.read ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 245, 157, 0.3)'
  roundRect(ctx, 15, itemY, screenWidth - 30, 80, [12, 12, 12, 12])
  ctx.fill()

  if (!feedback.read) {
    ctx.fillStyle = '#ffd700'
    ctx.beginPath()
    ctx.arc(screenWidth - 35, itemY + 15, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = type.color
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`${type.icon} ${type.name}`, 25, itemY + 20)

  ctx.fillStyle = status.color
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(status.name, screenWidth - 25, itemY + 20)

  ctx.fillStyle = '#333'
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'left'
  const content = feedback.content.length > 30 ? feedback.content.substring(0, 30) + '...' : feedback.content
  ctx.fillText(content, 25, itemY + 45)

  const date = new Date(feedback.createTime)
  ctx.fillStyle = '#999'
  ctx.font = '10px sans-serif'
  ctx.fillText(`${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`, 25, itemY + 65)

  return { y: itemY, height: 80 }
}

function renderQuickFeedback(ctx, screenWidth, questions, selectedQuestions = [], onToggle = null) {
  let currentY = 0

  ctx.fillStyle = '#f5f5f5'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('快速反馈', 20, currentY + 20)

  currentY += 35

  questions.forEach((question, i) => {
    const isSelected = selectedQuestions.includes(question)
    const row = Math.floor(i / 2)
    const col = i % 2
    const x = 20 + col * (screenWidth / 2 - 25)
    const y = currentY + row * 50
    const width = screenWidth / 2 - 40
    const height = 40

    ctx.fillStyle = isSelected ? 'rgba(201, 48, 90, 0.1)' : 'rgba(0, 0, 0, 0.05)'
    roundRect(ctx, x, y, width, height, [8, 8, 8, 8])
    ctx.fill()

    if (isSelected) {
      ctx.strokeStyle = '#c9305a'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    ctx.fillStyle = '#333'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(question, x + 10, y + 25)

    return { x, y, width, height, question }
  })
}

function wrapText(ctx, text, maxWidth) {
  const chars = text.split('')
  const lines = []
  let currentLine = ''

  for (const char of chars) {
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

module.exports = {
  feedbackManager,
  FEEDBACK_TYPES,
  FEEDBACK_STATUS,
  FEEDBACK_PRIORITY,
  QUICK_FEEDBACK_QUESTIONS,
  renderFeedbackForm,
  renderFeedbackHistoryItem,
  renderQuickFeedback
}