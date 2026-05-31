// 节气花园 - 数据分析面板模块
// 玩家数据统计、种植习惯、成就展示

const ANALYTICS_CATEGORIES = {
  overview: { id: 'overview', name: '总览', icon: '📊' },
  gardening: { id: 'gardening', name: '园艺', icon: '🌱' },
  social: { id: 'social', name: '社交', icon: '💬' },
  combat: { id: 'combat', name: '竞技', icon: '⚔️' },
  pet: { id: 'pet', name: '宠物', icon: '🐾' }
}

const ANALYTICS_PERIODS = [
  { id: 'today', name: '今日' },
  { id: 'week', name: '本周' },
  { id: 'month', name: '本月' },
  { id: 'all', name: '全部' }
]

class AnalyticsManager {
  constructor() {
    this.currentUserId = null
    this.currentPeriod = 'week'
    this.currentCategory = 'overview'
    this.stats = {}
    this.listeners = {}
  }

  setCurrentUser(openid) {
    this.currentUserId = openid
  }

  async loadStats(period = 'week') {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    this.currentPeriod = period

    try {
      const result = await wx.cloud.callFunction({
        name: 'getUserAnalytics',
        data: {
          userId: this.currentUserId,
          period
        }
      })

      if (result.success) {
        this.stats = result.stats || {}
        this.notifyListeners('statsUpdated', { period, stats: this.stats })
        return { success: true, stats: this.stats }
      }

      return { success: false, message: result.message || '加载失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  getStats() {
    return this.stats
  }

  getStat(category, key) {
    return this.stats[category]?.[key] || 0
  }

  setCategory(category) {
    this.currentCategory = category
  }

  getCategory() {
    return this.currentCategory
  }

  setPeriod(period) {
    this.currentPeriod = period
  }

  getPeriod() {
    return this.currentPeriod
  }

  formatNumber(num) {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1) + '亿'
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toString()
  }

  calculateTrend(current, previous) {
    if (!previous || previous === 0) {
      return { value: 0, isPositive: true }
    }

    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
      raw: change
    }
  }

  getOverviewStats() {
    return {
      totalCoins: this.stats.overview?.totalCoins || 0,
      totalPlayTime: this.stats.overview?.totalPlayTime || 0,
      level: this.stats.overview?.level || 1,
      totalLogin: this.stats.overview?.totalLogin || 0,
      achievementsUnlocked: this.stats.overview?.achievementsUnlocked || 0,
      totalAchievements: 32
    }
  }

  getGardeningStats() {
    return {
      plantCount: this.stats.gardening?.plantCount || 0,
      harvestCount: this.stats.gardening?.harvestCount || 0,
      waterCount: this.stats.gardening?.waterCount || 0,
      fertilizeCount: this.stats.gardening?.fertilizeCount || 0,
      favoriteCrop: this.stats.gardening?.favoriteCrop || '无',
      totalEarned: this.stats.gardening?.totalEarned || 0
    }
  }

  getSocialStats() {
    return {
      friendCount: this.stats.social?.friendCount || 0,
      postCount: this.stats.social?.postCount || 0,
      commentCount: this.stats.social?.commentCount || 0,
      likeReceived: this.stats.social?.likeReceived || 0,
      likeGiven: this.stats.social?.likeGiven || 0,
      gardenVisits: this.stats.social?.gardenVisits || 0
    }
  }

  getCombatStats() {
    return {
      battleCount: this.stats.combat?.battleCount || 0,
      battleWin: this.stats.combat?.battleWin || 0,
      winRate: this.stats.combat?.battleCount > 0
        ? ((this.stats.combat.battleWin / this.stats.combat.battleCount) * 100).toFixed(1)
        : '0',
      highestRank: this.stats.combat?.highestRank || '无',
      totalEarned: this.stats.combat?.totalEarned || 0
    }
  }

  getPetStats() {
    return {
      petCount: this.stats.pet?.petCount || 0,
      feedCount: this.stats.pet?.feedCount || 0,
      chatCount: this.stats.pet?.chatCount || 0,
      intimacy: this.stats.pet?.intimacy || 0,
      petLevel: this.stats.pet?.petLevel || 1
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
          console.error('[AnalyticsManager] Listener error:', e)
        }
      })
    }
  }
}

const analyticsManager = new AnalyticsManager()

function renderAnalyticsOverview(ctx, screenWidth, screenHeight, stats, scrollY = 0) {
  let currentY = 80 - scrollY

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  roundRect(ctx, 15, currentY, screenWidth - 30, 120, [15, 15, 15, 15])
  ctx.fill()

  ctx.fillStyle = '#c9305a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('📊 数据总览', 25, currentY + 25)

  const overviewItems = [
    { label: '💰 金币总量', value: analyticsManager.formatNumber(stats.totalCoins || 0) },
    { label: '⭐ 当前等级', value: `Lv.${stats.level || 1}` },
    { label: '📅 累计登录', value: `${stats.totalLogin || 0}天` },
    { label: '🏆 成就解锁', value: `${stats.achievementsUnlocked || 0}/${stats.totalAchievements}` }
  ]

  overviewItems.forEach((item, i) => {
    const x = 25 + (i % 2) * (screenWidth - 70) / 2
    const y = currentY + 45 + Math.floor(i / 2) * 40

    ctx.fillStyle = '#666'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(item.label, x, y)

    ctx.fillStyle = '#333'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText(item.value, x, y + 18)
  })

  currentY += 140

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  roundRect(ctx, 15, currentY, screenWidth - 30, 100, [15, 15, 15, 15])
  ctx.fill()

  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('⏱️ 游戏时长', 25, currentY + 25)

  const playTime = stats.totalPlayTime || 0
  const hours = Math.floor(playTime / 3600)
  const minutes = Math.floor((playTime % 3600) / 60)

  ctx.fillStyle = '#333'
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText(`${hours}小时${minutes}分钟`, 25, currentY + 65)

  ctx.fillStyle = '#999'
  ctx.font = '12px sans-serif'
  ctx.fillText('本周累计游戏时长', 25, currentY + 85)

  return currentY + 120
}

function renderGardeningChart(ctx, screenWidth, stats, startY) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  roundRect(ctx, 15, startY, screenWidth - 30, 180, [15, 15, 15, 15])
  ctx.fill()

  ctx.fillStyle = '#22c55e'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('🌱 园艺数据', 25, startY + 25)

  const gardenItems = [
    { label: '种植次数', value: stats.plantCount || 0, icon: '🌱' },
    { label: '收获次数', value: stats.harvestCount || 0, icon: '🥬' },
    { label: '浇水次数', value: stats.waterCount || 0, icon: '💧' },
    { label: '施肥次数', value: stats.fertilizeCount || 0, icon: '🧪' }
  ]

  gardenItems.forEach((item, i) => {
    const x = 25 + (i % 2) * (screenWidth - 70) / 2
    const y = startY + 50 + Math.floor(i / 2) * 50

    ctx.fillStyle = '#f5f5f5'
    roundRect(ctx, x, y, (screenWidth - 70) / 2, 40, [8, 8, 8, 8])
    ctx.fill()

    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(item.icon, x + 25, y + 27)

    ctx.fillStyle = '#333'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(item.value.toString(), x + 50, y + 20)

    ctx.fillStyle = '#999'
    ctx.font = '11px sans-serif'
    ctx.fillText(item.label, x + 50, y + 35)
  })

  ctx.fillStyle = '#fef3c7'
  roundRect(ctx, 25, startY + 145, screenWidth - 50, 28, [8, 8, 8, 8])
  ctx.fill()
  ctx.fillStyle = '#f59e0b'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🌾 累计收益: ${analyticsManager.formatNumber(stats.totalEarned || 0)} 金币`, 35, startY + 165)

  return startY + 195
}

function renderSocialChart(ctx, screenWidth, stats, startY) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  roundRect(ctx, 15, startY, screenWidth - 30, 180, [15, 15, 15, 15])
  ctx.fill()

  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('💬 社交数据', 25, startY + 25)

  const socialItems = [
    { label: '好友数量', value: stats.friendCount || 0 },
    { label: '发帖数量', value: stats.postCount || 0 },
    { label: '获赞数量', value: stats.likeReceived || 0 },
    { label: '花园访问', value: stats.gardenVisits || 0 }
  ]

  socialItems.forEach((item, i) => {
    const x = 25 + (i % 2) * (screenWidth - 70) / 2
    const y = startY + 50 + Math.floor(i / 2) * 55

    ctx.fillStyle = '#f5f5f5'
    roundRect(ctx, x, y, (screenWidth - 70) / 2, 45, [8, 8, 8, 8])
    ctx.fill()

    ctx.fillStyle = '#333'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(item.value.toString(), x + (screenWidth - 70) / 4, y + 25)

    ctx.fillStyle = '#666'
    ctx.font = '11px sans-serif'
    ctx.fillText(item.label, x + (screenWidth - 70) / 4, y + 40)
  })

  return startY + 195
}

function renderCombatChart(ctx, screenWidth, stats, startY) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  roundRect(ctx, 15, startY, screenWidth - 30, 150, [15, 15, 15, 15])
  ctx.fill()

  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('⚔️ 竞技数据', 25, startY + 25)

  const winRate = stats.winRate || '0'
  const centerX = screenWidth / 2
  const centerY = startY + 85
  const radius = 50

  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (parseFloat(winRate) / 100) * Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#333'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${winRate}%`, centerX, centerY + 6)

  ctx.fillStyle = '#666'
  ctx.font = '11px sans-serif'
  ctx.fillText('胜率', centerX, centerY + 22)

  ctx.fillStyle = '#333'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`胜: ${stats.battleWin || 0}  负: ${(stats.battleCount || 0) - (stats.battleWin || 0)}`, 25, startY + 120)

  if (stats.highestRank && stats.highestRank !== '无') {
    ctx.fillStyle = '#f59e0b'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`🏆 最高排名: #${stats.highestRank}`, screenWidth - 25, startY + 120)
  }

  return startY + 165
}

function renderPeriodTabs(ctx, screenWidth, periods, activePeriod, onSelect) {
  const tabWidth = screenWidth / periods.length

  periods.forEach((period, i) => {
    const x = i * tabWidth
    const isActive = period.id === activePeriod

    if (isActive) {
      ctx.fillStyle = 'rgba(201, 48, 90, 0.1)'
      ctx.fillRect(x, 50, tabWidth, 25)
    }

    ctx.fillStyle = isActive ? '#c9305a' : '#666'
    ctx.font = isActive ? 'bold 12px sans-serif' : '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(period.name, x + tabWidth / 2, 68)
  })
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
  ctx.fill()
}

module.exports = {
  analyticsManager,
  ANALYTICS_CATEGORIES,
  ANALYTICS_PERIODS,
  renderAnalyticsOverview,
  renderGardeningChart,
  renderSocialChart,
  renderCombatChart,
  renderPeriodTabs
}