// 节气花园 - 季节性活动系统模块
// 节气活动、主题活动、限时挑战

const SOLAR_TERMS = [
  { id: 'dongzhi', name: '冬至', season: 'winter', date: '12-21~01-05', icon: '❄️', color: '#60a5fa' },
  { id: 'xiaohan', name: '小寒', season: 'winter', date: '01-05~01-20', icon: '🌨️', color: '#93c5fd' },
  { id: 'dahan', name: '大寒', season: 'winter', date: '01-20~02-03', icon: '🥶', color: '#bfdbfe' },
  { id: 'lichun', name: '立春', season: 'spring', date: '02-03~02-18', icon: '🌱', color: '#4ade80' },
  { id: 'yushui', name: '雨水', season: 'spring', date: '02-18~03-05', icon: '🌧️', color: '#86efac' },
  { id: 'jingzhe', name: '惊蛰', season: 'spring', date: '03-05~03-20', icon: '⚡', color: '#facc15' },
  { id: 'chunfen', name: '春分', season: 'spring', date: '03-20~04-05', icon: '🌸', color: '#f472b6' },
  { id: 'qingming', name: '清明', season: 'spring', date: '04-05~04-20', icon: '🌿', color: '#a3e635' },
  { id: ' guyu', name: '谷雨', season: 'spring', date: '04-20~05-05', icon: '🌾', color: '#d9f99d' },
  { id: ' lixia', name: '立夏', season: 'summer', date: '05-05~05-21', icon: '☀️', color: '#fbbf24' },
  { id: 'xiaoman', name: '小满', season: 'summer', date: '05-21~06-05', icon: '🌾', color: '#fde047' },
  { id: 'mangzhong', name: '芒种', season: 'summer', date: '06-05~06-21', icon: '🌾', color: '#fef08a' },
  { id: 'xiazhi', name: '夏至', season: 'summer', date: '06-21~07-07', icon: '🌞', color: '#fb923c' },
  { id: 'xiaoshu', name: '小暑', season: 'summer', date: '07-07~07-22', icon: '🔥', color: '#f87171' },
  { id: 'dashu', name: '大暑', season: 'summer', date: '07-22~08-07', icon: '☀️', color: '#ef4444' },
  { id: 'liqiu', name: '立秋', season: 'autumn', date: '08-07~08-22', icon: '🍂', color: '#a3e635' },
  { id: 'chushu', name: '处暑', season: 'autumn', date: '08-22~09-07', icon: '🍃', color: '#d9f99d' },
  { id: 'bailu', name: '白露', season: 'autumn', date: '09-07~09-22', icon: '💧', color: '#67e8f9' },
  { id: 'qiufen', name: '秋分', season: 'autumn', date: '09-22~10-08', icon: '🍁', color: '#f97316' },
  { id: 'hanlu', name: '寒露', season: 'autumn', date: '10-08~10-23', icon: '🌺', color: '#f59e0b' },
  { id: 'shuangjiang', name: '霜降', season: 'autumn', date: '10-23~11-07', icon: '❄️', color: '#a5b4fc' },
  { id: 'lidong', name: '立冬', season: 'winter', date: '11-07~11-22', icon: '🧥', color: '#60a5fa' },
  { id: 'xiaoxue', name: '小雪', season: 'winter', date: '11-22~12-07', icon: '🌨️', color: '#93c5fd' },
  { id: 'daxue', name: '大雪', season: 'winter', date: '12-07~12-21', icon: '❄️', color: '#bfdbfe' }
]

const SEASONAL_ACTIVITIES = {
  spring: {
    name: '春季活动',
    icon: '🌸',
    color: '#f472b6',
    bonuses: ['种植经验+20%', '浇水效率+10%'],
    specialCrop: '桃花'
  },
  summer: {
    name: '夏季活动',
    icon: '☀️',
    color: '#fbbf24',
    bonuses: ['阳光值翻倍', '收获金币+15%'],
    specialCrop: '西瓜'
  },
  autumn: {
    name: '秋季活动',
    icon: '🍂',
    color: '#f97316',
    bonuses: ['作物产量+25%', '肥料效果+20%'],
    specialCrop: '菊花'
  },
  winter: {
    name: '冬季活动',
    icon: '❄️',
    color: '#60a5fa',
    bonuses: ['离线收益+50%', '宠物亲密度+10%'],
    specialCrop: '菠菜'
  }
}

const LIMITED_EVENTS = [
  {
    id: 'spring_festival',
    name: '春节活动',
    icon: '🧧',
    startDate: '01-20',
    endDate: '02-05',
    tasks: [
      { id: 'login_7', name: '拜年', description: '连续登录7天', reward: { coins: 888, item: '红包' } },
      { id: 'plant_tree', name: '种年树', description: '种植10次', reward: { coins: 200 } },
      { id: 'send_gift', name: '送祝福', description: '给好友送祝福5次', reward: { coins: 300 } }
    ]
  },
  {
    id: 'lantern_festival',
    name: '元宵节活动',
    icon: '🏮',
    startDate: '02-10',
    endDate: '02-20',
    tasks: [
      { id: 'guess_riddle', name: '猜灯谜', description: '猜对10个灯谜', reward: { coins: 500 } },
      { id: 'eat_yuanxiao', name: '吃元宵', description: '喂养宠物7次', reward: { coins: 150 } }
    ]
  },
  {
    id: 'qingming_festival',
    name: '清明节活动',
    icon: '🌿',
    startDate: '04-03',
    endDate: '04-10',
    tasks: [
      { id: 'sweep_tomb', name: '扫墓', description: '访问好友花园3次', reward: { coins: 200 } },
      { id: 'plant_flower', name: '踏青', description: '种植5次', reward: { coins: 150 } }
    ]
  },
  {
    id: 'dragon_boat',
    name: '端午节活动',
    icon: '🐲',
    startDate: '06-10',
    endDate: '06-20',
    tasks: [
      { id: 'eat_zongzi', name: '吃粽子', description: '收获作物20次', reward: { coins: 300 } },
      { id: 'race_boat', name: '赛龙舟', description: '竞技获胜3次', reward: { coins: 400 } }
    ]
  },
  {
    id: 'mid_autumn',
    name: '中秋节活动',
    icon: '🌕',
    startDate: '09-15',
    endDate: '09-25',
    tasks: [
      { id: 'moon_cake', name: '月饼', description: '完成每日任务7天', reward: { coins: 500 } },
      { id: 'admire_moon', name: '赏月', description: '与宠物聊天5次', reward: { coins: 200 } }
    ]
  }
]

class SeasonalEventManager {
  constructor() {
    this.currentUserId = null
    this.currentSolarTerm = null
    this.currentSeason = null
    this.activeEvents = []
    this.userEventProgress = {}
    this.listeners = {}
  }

  setCurrentUser(openid) {
    this.currentUserId = openid
  }

  init() {
    this.updateCurrentSolarTerm()
    this.updateCurrentSeason()
    this.checkActiveEvents()
  }

  updateCurrentSolarTerm() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const currentDateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

    for (const term of SOLAR_TERMS) {
      const [start, end] = term.date.split('~')
      if (currentDateStr >= start && currentDateStr <= end) {
        this.currentSolarTerm = term
        break
      }
    }

    if (!this.currentSolarTerm) {
      this.currentSolarTerm = SOLAR_TERMS[0]
    }
  }

  updateCurrentSeason() {
    const seasonMap = {
      spring: ['dongzhi', 'xiaohan', 'dahan', 'lichun', 'yushui', 'jingzhe'],
      summer: ['chunfen', 'qingming', 'guyu', 'lixia', 'xiaoman', 'mangzhong'],
      autumn: ['xiazhi', 'xiaoshu', 'dashu', 'liqiu', 'chushu', 'bailu'],
      winter: ['qiufen', 'hanlu', 'shuangjiang', 'lidong', 'xiaoxue', 'daxue']
    }

    for (const [season, terms] of Object.entries(seasonMap)) {
      if (terms.includes(this.currentSolarTerm.id)) {
        this.currentSeason = season
        break
      }
    }

    if (!this.currentSeason) {
      this.currentSeason = 'spring'
    }
  }

  checkActiveEvents() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const currentDateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

    this.activeEvents = LIMITED_EVENTS.filter(event => {
      return currentDateStr >= event.startDate && currentDateStr <= event.endDate
    })

    if (this.activeEvents.length > 0) {
      this.notifyListeners('eventsUpdated', { events: this.activeEvents })
    }
  }

  getCurrentSolarTerm() {
    return this.currentSolarTerm
  }

  getCurrentSeason() {
    return this.currentSeason
  }

  getSeasonInfo() {
    return this.currentSeason ? SEASONAL_ACTIVITIES[this.currentSeason] : null
  }

  getActiveEvents() {
    return this.activeEvents
  }

  async loadUserEventProgress() {
    if (!this.currentUserId) return

    try {
      const result = await wx.cloud.callFunction({
        name: 'getUserEventProgress',
        data: { userId: this.currentUserId }
      })

      if (result.success) {
        this.userEventProgress = result.progress || {}
        return { success: true, progress: this.userEventProgress }
      }

      return { success: false }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async updateEventProgress(eventId, taskId, increment = 1) {
    if (!this.currentUserId) return

    try {
      const result = await wx.cloud.callFunction({
        name: 'updateEventProgress',
        data: {
          userId: this.currentUserId,
          eventId,
          taskId,
          increment
        }
      })

      if (result.success) {
        if (!this.userEventProgress[eventId]) {
          this.userEventProgress[eventId] = {}
        }
        this.userEventProgress[eventId][taskId] = result.currentValue

        if (result.completed) {
          this.notifyListeners('taskCompleted', { eventId, taskId, reward: result.reward })
        }

        return { success: true, completed: result.completed }
      }

      return { success: false }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  isEventActive(eventId) {
    return this.activeEvents.some(e => e.id === eventId)
  }

  getSolarTerms() {
    return SOLAR_TERMS
  }

  getLimitedEvents() {
    return LIMITED_EVENTS
  }

  getBonuses() {
    const seasonInfo = this.getSeasonInfo()
    return seasonInfo ? seasonInfo.bonuses : []
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
          console.error('[SeasonalEventManager] Listener error:', e)
        }
      })
    }
  }
}

const seasonalEventManager = new SeasonalEventManager()

function renderSolarTermBadge(ctx, x, y, solarTerm, size = 50) {
  const { icon, name, color } = solarTerm

  const gradient = ctx.createRadialGradient(x + size/2, y + size/2, 0, x + size/2, y + size/2, size/2)
  gradient.addColorStop(0, color + '40')
  gradient.addColorStop(1, color + '20')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.font = `${size * 0.5}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(icon, x + size/2, y + size/2)

  ctx.fillStyle = '#333'
  ctx.font = 'bold 10px sans-serif'
  ctx.fillText(name, x + size/2, y + size + 10)
}

function renderEventBanner(ctx, screenWidth, event, progress = 0) {
  if (!event || !event.endDate) return

  const bannerHeight = 80
  const bannerY = 0

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  roundRect(ctx, 0, bannerY, screenWidth, bannerHeight, [0, 0, 0, 0])
  ctx.fill()

  const daysLeft = calculateDaysLeft(event.endDate)

  ctx.font = 'bold 16px sans-serif'
  ctx.fillStyle = '#ffd700'
  ctx.textAlign = 'center'
  ctx.fillText(`${event.icon} ${event.name}`, screenWidth / 2, bannerY + 25)

  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#fff'
  ctx.fillText(`剩余 ${daysLeft} 天`, screenWidth / 2, bannerY + 45)

  if (progress > 0) {
    const barWidth = screenWidth - 60
    const barHeight = 8
    const barX = 30
    const barY = bannerY + 60

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    roundRect(ctx, barX, barY, barWidth, barHeight, [barHeight/2, barHeight/2, barHeight/2, barHeight/2])
    ctx.fill()

    ctx.fillStyle = '#ffd700'
    roundRect(ctx, barX, barY, barWidth * Math.min(1, progress), barHeight, [barHeight/2, barHeight/2, barHeight/2, barHeight/2])
    ctx.fill()
  }
}

function renderEventDetailDialog(ctx, screenWidth, screenHeight, event, progress = {}) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  const dialogWidth = screenWidth - 40
  const dialogHeight = 400
  const dialogX = 20
  const dialogY = (screenHeight - dialogHeight) / 2

  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)'
  roundRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, [20, 20, 20, 20])
  ctx.fill()

  ctx.fillStyle = '#ffd700'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${event.icon} ${event.name}`, screenWidth / 2, dialogY + 35)

  const daysLeft = calculateDaysLeft(event.endDate)
  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#999'
  ctx.fillText(`活动剩余 ${daysLeft} 天`, screenWidth / 2, dialogY + 55)

  let taskY = dialogY + 80
  event.tasks.forEach(task => {
    const current = progress[task.id] || 0
    const total = 1
    const completed = current >= total

    ctx.fillStyle = completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0, 0, 0, 0.03)'
    roundRect(ctx, dialogX + 15, taskY, dialogWidth - 30, 70, [12, 12, 12, 12])
    ctx.fill()

    if (completed) {
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 1
      roundRect(ctx, dialogX + 15, taskY, dialogWidth - 30, 70, [12, 12, 12, 12])
      ctx.stroke()
    }

    ctx.fillStyle = completed ? '#22c55e' : '#333'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(task.name, dialogX + 30, taskY + 25)

    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#666'
    ctx.fillText(task.description, dialogX + 30, taskY + 45)

    ctx.textAlign = 'right'
    ctx.fillStyle = completed ? '#22c55e' : '#f59e0b'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(completed ? '✓ 已完成' : `${current}/${total}`, dialogX + dialogWidth - 30, taskY + 30)

    if (task.reward.coins > 0) {
      ctx.fillStyle = '#fef3c7'
      roundRect(ctx, dialogX + dialogWidth - 100, taskY + 40, 70, 24, [12, 12, 12, 12])
      ctx.fill()
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(`+${task.reward.coins}`, dialogX + dialogWidth - 65, taskY + 57)
    }

    taskY += 80
  })

  ctx.fillStyle = '#999'
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('点击其他地方关闭', screenWidth / 2, dialogY + dialogHeight - 15)
}

function renderSeasonBonus(ctx, screenWidth, season, bonuses) {
  if (!bonuses || bonuses.length === 0) return
  const seasonInfo = SEASONAL_ACTIVITIES[season]
  if (!seasonInfo) return

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  roundRect(ctx, 15, 100, screenWidth - 30, 50, [12, 12, 12, 12])
  ctx.fill()

  ctx.fillStyle = seasonInfo.color
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`${seasonInfo.icon} ${seasonInfo.name}`, 25, 122)

  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#666'
  ctx.textAlign = 'left'
  bonuses.slice(0, 2).forEach((bonus, i) => {
    ctx.fillText(bonus, 25 + i * 130, 142)
  })
}

function calculateDaysLeft(endDate) {
  if (!endDate) return 0
  const now = new Date()
  const [month, day] = endDate.split('-').map(Number)
  const end = new Date(now.getFullYear(), month - 1, day)
  if (end < now) end.setFullYear(end.getFullYear() + 1)
  const diff = end - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function roundRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius)
    ctx.beginPath()
    return
  }
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
  seasonalEventManager,
  SOLAR_TERMS,
  SEASONAL_ACTIVITIES,
  LIMITED_EVENTS,
  renderSolarTermBadge,
  renderEventBanner,
  renderEventDetailDialog,
  renderSeasonBonus
}