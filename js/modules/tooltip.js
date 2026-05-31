// 节气花园 - 工具提示系统模块
// 上下文提示、高亮引导

const TOOLTIP_TYPES = {
  info: { bgColor: 'rgba(59, 130, 246, 0.95)', borderColor: '#3b82f6' },
  tip: { bgColor: 'rgba(245, 158, 11, 0.95)', borderColor: '#f59e0b' },
  warning: { bgColor: 'rgba(239, 68, 68, 0.95)', borderColor: '#ef4444' },
  success: { bgColor: 'rgba(34, 197, 94, 0.95)', borderColor: '#22c55e' }
}

const TOOLTIP_ARROWS = {
  top: '▲',
  bottom: '▼',
  left: '◀',
  right: '▶'
}

const PREDEFINED_TOOLTIPS = {
  plant_seed: {
    title: '播种',
    content: '点击空地播种，点击已播种的土地查看详情',
    type: 'info',
    target: 'garden'
  },
  water_plant: {
    title: '浇水',
    content: '为作物浇水可加速成长，记得每天都来浇水哦',
    type: 'tip',
    target: 'water_btn'
  },
  fertilize: {
    title: '施肥',
    content: '施肥可大幅提升作物产量，但需要消耗肥料',
    type: 'tip',
    target: 'fertilize_btn'
  },
  harvest_crop: {
    title: '收获',
    content: '作物成熟后点击收获，获得金币和经验',
    type: 'success',
    target: 'harvest_btn'
  },
  crow_attack: {
    title: '⚠️ 乌鸦来袭',
    content: '乌鸦正在攻击你的花园！点击赶走它们',
    type: 'warning',
    target: 'crow'
  },
  pet_hungry: {
    title: '宠物饿了',
    content: '你的宠物饥饿值过低，快去喂食吧',
    type: 'tip',
    target: 'pet_status'
  },
  friend_visit: {
    title: '好友访问',
    content: '好友正在访问你的花园，记得打个招呼',
    type: 'info',
    target: 'visitor'
  },
  daily_task: {
    title: '每日任务',
    content: '完成每日任务可获得丰厚奖励',
    type: 'tip',
    target: 'task_btn'
  },
  battery_low: {
    title: '体力不足',
    content: '体力值较低，休息一下或使用道具恢复',
    type: 'warning',
    target: 'energy_bar'
  }
}

class TooltipManager {
  constructor() {
    this.activeTooltips = []
    this.highlightElements = []
    this.isShowing = false
    this.currentTooltip = null
    this.onDismiss = null
    this.listeners = {}
  }

  show(tooltip, options = {}) {
    const {
      x,
      y,
      arrow = 'top',
      autoDismiss = true,
      duration = 3000,
      highlight = null,
      onDismiss = null
    } = options

    const tooltipData = typeof tooltip === 'string'
      ? PREDEFINED_TOOLTIPS[tooltip] || { title: '', content: tooltip, type: 'info' }
      : tooltip

    this.currentTooltip = {
      ...tooltipData,
      x,
      y,
      arrow,
      highlight,
      startTime: Date.now()
    }

    this.isShowing = true
    this.onDismiss = onDismiss

    if (highlight) {
      this.highlightElements.push(highlight)
    }

    if (autoDismiss && duration > 0) {
      setTimeout(() => {
        this.dismiss()
      }, duration)
    }

    this.notifyListeners('tooltipShown', this.currentTooltip)
    return this.currentTooltip
  }

  showAtElement(elementKey, tooltipKey, options = {}) {
    const element = this.getElementPosition(elementKey)
    if (!element) {
      console.warn('[Tooltip] Element not found:', elementKey)
      return null
    }

    return this.show(tooltipKey, {
      ...options,
      x: element.x + element.width / 2,
      y: element.y + (options.arrow === 'bottom' ? 0 : element.height)
    })
  }

  dismiss() {
    if (!this.isShowing) return

    this.isShowing = false
    this.currentTooltip = null
    this.highlightElements = []

    if (this.onDismiss) {
      this.onDismiss()
      this.onDismiss = null
    }

    this.notifyListeners('tooltipDismissed')
  }

  getElementPosition(key) {
    const elementPositions = {
      garden: { x: 20, y: 150, width: 320, height: 400 },
      water_btn: { x: 20, y: 560, width: 70, height: 70 },
      fertilize_btn: { x: 100, y: 560, width: 70, height: 70 },
      harvest_btn: { x: 180, y: 560, width: 70, height: 70 },
      crow: { x: 100, y: 200, width: 80, height: 60 },
      pet_status: { x: 250, y: 50, width: 80, height: 40 },
      visitor: { x: 150, y: 100, width: 60, height: 60 },
      task_btn: { x: 280, y: 50, width: 50, height: 50 },
      energy_bar: { x: 20, y: 50, width: 100, height: 20 },
      coin_display: { x: 150, y: 50, width: 80, height: 30 },
      shop_btn: { x: 20, y: 50, width: 60, height: 40 }
    }

    return elementPositions[key] || null
  }

  isTooltipActive() {
    return this.isShowing
  }

  getCurrentTooltip() {
    return this.currentTooltip
  }

  registerCustomTooltip(key, tooltip) {
    PREDEFINED_TOOLTIPS[key] = tooltip
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
          console.error('[TooltipManager] Listener error:', e)
        }
      })
    }
  }
}

const tooltipManager = new TooltipManager()

function renderTooltip(ctx, screenWidth, tooltip) {
  if (!tooltip) return

  const { title, content, x, y, arrow, type = 'info', highlight } = tooltip
  const typeStyle = TOOLTIP_TYPES[type] || TOOLTIP_TYPES.info

  const padding = 12
  const maxWidth = 240
  const lineHeight = 18

  ctx.font = 'bold 14px sans-serif'
  const titleWidth = ctx.measureText(title).width

  ctx.font = '12px sans-serif'
  const lines = wrapText(ctx, content, maxWidth - padding * 2)
  const contentHeight = lines.length * lineHeight

  const tooltipWidth = Math.min(maxWidth, Math.max(titleWidth, ctx.measureText(content).width) + padding * 2)
  const tooltipHeight = 20 + contentHeight + padding * 2

  let tooltipX = x - tooltipWidth / 2
  let tooltipY = y

  if (tooltipX < 10) tooltipX = 10
  if (tooltipX + tooltipWidth > screenWidth - 10) {
    tooltipX = screenWidth - tooltipWidth - 10
  }

  if (highlight) {
    ctx.fillStyle = highlight.color || 'rgba(255, 215, 0, 0.3)'
    roundRect(ctx, highlight.x - 5, highlight.y - 5, highlight.width + 10, highlight.height + 10, [10, 10, 10, 10])
    ctx.fill()

    ctx.strokeStyle = highlight.color || '#ffd700'
    ctx.lineWidth = 2
    roundRect(ctx, highlight.x - 5, highlight.y - 5, highlight.width + 10, highlight.height + 10, [10, 10, 10, 10])
    ctx.stroke()
  }

  ctx.fillStyle = typeStyle.bgColor
  roundRect(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, [8, 8, 8, 8])
  ctx.fill()

  ctx.strokeStyle = typeStyle.borderColor
  ctx.lineWidth = 2
  roundRect(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, [8, 8, 8, 8])
  ctx.stroke()

  const arrowSymbol = TOOLTIP_ARROWS[arrow] || TOOLTIP_ARROWS.top
  const arrowSize = 10

  if (arrow === 'top') {
    tooltipY += tooltipHeight
    ctx.fillStyle = typeStyle.bgColor
    ctx.beginPath()
    ctx.moveTo(x - arrowSize, tooltipY)
    ctx.lineTo(x + arrowSize, tooltipY)
    ctx.lineTo(x, tooltipY + arrowSize)
    ctx.closePath()
    ctx.fill()
  } else if (arrow === 'bottom') {
    tooltipY -= arrowSize
    ctx.fillStyle = typeStyle.bgColor
    ctx.beginPath()
    ctx.moveTo(x - arrowSize, tooltipY)
    ctx.lineTo(x + arrowSize, tooltipY)
    ctx.lineTo(x, tooltipY - arrowSize)
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(title, x, tooltipY + padding + 14)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'

  lines.forEach((line, i) => {
    ctx.fillText(line, tooltipX + padding, tooltipY + padding + 35 + i * lineHeight)
  })

  return {
    x: tooltipX,
    y: arrow === 'top' ? tooltipY - arrowSize : tooltipY - tooltipHeight,
    width: tooltipWidth,
    height: tooltipHeight + arrowSize
  }
}

function renderHighlightPulse(ctx, x, y, width, height, progress) {
  const pulseScale = 1 + Math.sin(progress * Math.PI * 2) * 0.1
  const alpha = 0.3 + Math.sin(progress * Math.PI * 2) * 0.2

  const centerX = x + width / 2
  const centerY = y + height / 2
  const scaledWidth = width * pulseScale
  const scaledHeight = height * pulseScale

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = '#ffd700'
  ctx.lineWidth = 3
  roundRect(ctx, centerX - scaledWidth / 2, centerY - scaledHeight / 2, scaledWidth, scaledHeight, [12, 12, 12, 12])
  ctx.stroke()
  ctx.restore()
}

function renderHandPointer(ctx, x, y, progress) {
  const bounce = Math.sin(progress * Math.PI * 2) * 10

  ctx.save()
  ctx.translate(x, y - bounce)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  roundRect(ctx, -15, -25, 30, 35, [8, 8, 8, 8])
  ctx.fill()

  ctx.strokeStyle = '#c9305a'
  ctx.lineWidth = 2
  roundRect(ctx, -15, -25, 30, 35, [8, 8, 8, 8])
  ctx.stroke()

  ctx.fillStyle = '#c9305a'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('☝️', 0, 0)

  ctx.restore()
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split('')
  const lines = []
  let currentLine = ''

  for (const char of words) {
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
  tooltipManager,
  TOOLTIP_TYPES,
  PREDEFINED_TOOLTIPS,
  renderTooltip,
  renderHighlightPulse,
  renderHandPointer,
  renderHandPointer
}