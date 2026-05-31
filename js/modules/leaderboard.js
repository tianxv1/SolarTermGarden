// 节气花园 - 排行榜系统模块
// 排名计算、好友排名、全服排名

const LEADERBOARD_TYPES = {
  coins: { id: 'coins', name: '金币排行', icon: '💰', field: 'totalCoins', unit: '' },
  level: { id: 'level', name: '等级排行', icon: '⭐', field: 'level', unit: '级' },
  battles: { id: 'battles', name: '竞技排行', icon: '⚔️', field: 'battleWinCount', unit: '胜' },
  plants: { id: 'plants', name: '种植排行', icon: '🌱', field: 'plantCount', unit: '次' },
  friends: { id: 'friends', name: '人脉排行', icon: '👥', field: 'friendCount', unit: '人' }
}

const RANK_TIERS = [
  { min: 1, max: 1, name: '冠军', icon: '👑', color: '#ffd700' },
  { min: 2, max: 2, name: '亚军', icon: '🥈', color: '#c0c0c0' },
  { min: 3, max: 3, name: '季军', icon: '🥉', color: '#cd7f32' },
  { min: 4, max: 10, name: '前10', icon: '🏅', color: '#f59e0b' },
  { min: 11, max: 50, name: '前50', icon: '🎖️', color: '#3b82f6' },
  { min: 51, max: 100, name: '前100', icon: '📿', color: '#8b5cf6' }
]

const RANK_CACHE_TIME = 300000

class LeaderboardManager {
  constructor() {
    this.currentUserId = null
    this.currentType = 'coins'
    this.rankings = []
    this.friendRankings = []
    this.myRank = null
    this.myFriendRank = null
    this.lastFetchTime = 0
    this.listeners = {}
  }

  setCurrentUser(openid) {
    this.currentUserId = openid
  }

  async fetchRankings(type = 'coins', forceRefresh = false) {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    const now = Date.now()
    if (!forceRefresh && now - this.lastFetchTime < RANK_CACHE_TIME && this.rankings.length > 0) {
      return { success: true, cached: true, rankings: this.rankings, myRank: this.myRank }
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'getLeaderboard',
        data: {
          type,
          userId: this.currentUserId,
          limit: 100
        }
      })

      if (result.success) {
        this.currentType = type
        this.rankings = result.rankings || []
        this.myRank = result.myRank
        this.lastFetchTime = now
        this.notifyListeners('rankingsUpdated', { type, rankings: this.rankings })
        return { success: true, rankings: this.rankings, myRank: this.myRank }
      }

      return { success: false, message: result.message || '获取失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async fetchFriendRankings(type = 'coins') {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'getFriendLeaderboard',
        data: {
          type,
          userId: this.currentUserId,
          limit: 50
        }
      })

      if (result.success) {
        this.friendRankings = result.rankings || []
        this.myFriendRank = result.myRank
        this.notifyListeners('friendRankingsUpdated', { type, rankings: this.friendRankings })
        return { success: true, rankings: this.friendRankings, myRank: this.myFriendRank }
      }

      return { success: false, message: result.message || '获取失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  getRankTier(rank) {
    return RANK_TIERS.find(tier => rank >= tier.min && rank <= tier.max) || null
  }

  getRankings() {
    return this.rankings
  }

  getFriendRankings() {
    return this.friendRankings
  }

  getMyRank() {
    return this.myRank
  }

  getMyFriendRank() {
    return this.myFriendRank
  }

  getCurrentType() {
    return this.currentType
  }

  getRankingsByType(type) {
    if (type === this.currentType) {
      return this.rankings
    }
    return []
  }

  async updateUserScore(type, value) {
    if (!this.currentUserId) return

    try {
      await wx.cloud.callFunction({
        name: 'updateUserScore',
        data: {
          userId: this.currentUserId,
          type,
          value
        }
      })
    } catch (error) {
      console.error('[Leaderboard] Update score failed:', error)
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
          console.error('[LeaderboardManager] Listener error:', e)
        }
      })
    }
  }
}

const leaderboardManager = new LeaderboardManager()

function renderLeaderboardHeader(ctx, screenWidth, type, myRank) {
  const typeInfo = LEADERBOARD_TYPES[type] || LEADERBOARD_TYPES.coins

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  roundRect(ctx, 15, 80, screenWidth - 30, 60, 15)
  ctx.fill()

  ctx.fillStyle = typeInfo.color || '#666'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(typeInfo.icon, screenWidth / 2 - 60, 118)

  ctx.fillStyle = '#333'
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText(typeInfo.name, screenWidth / 2, 115)

  if (myRank && myRank.rank > 0) {
    const tier = leaderboardManager.getRankTier(myRank.rank)
    ctx.font = '14px sans-serif'
    ctx.fillStyle = tier ? tier.color : '#666'
    ctx.fillText(`我的排名: #${myRank.rank}`, screenWidth / 2, 135)
  }
}

function renderRankingsList(ctx, screenWidth, screenHeight, options = {}) {
  const {
    rankings = [],
    scrollY = 0,
    onTap = null,
    showType = 'all'
  } = options

  const itemHeight = 65
  const startY = 155
  const visibleCount = Math.ceil((screenHeight - startY - 100) / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollY / itemHeight))
  const endIndex = Math.min(rankings.length, startIndex + visibleCount)

  rankings.slice(startIndex, endIndex).forEach((user, i) => {
    const y = startY + (i * itemHeight) - scrollY
    const rank = rankings.indexOf(user) + 1
    const tier = leaderboardManager.getRankTier(rank)
    const isTop3 = rank <= 3
    const isMe = user.openid === leaderboardManager.currentUserId

    if (isMe) {
      ctx.fillStyle = 'rgba(255, 245, 157, 0.5)'
      roundRect(ctx, 15, y, screenWidth - 30, itemHeight - 8, 12)
      ctx.fill()
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      roundRect(ctx, 15, y, screenWidth - 30, itemHeight - 8, 12)
      ctx.fill()
    }

    if (isTop3 && tier) {
      ctx.fillStyle = tier.color
      roundRect(ctx, 20, y + 8, 36, 36, 18)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(tier.icon, 38, y + 30)
    } else {
      ctx.fillStyle = '#e5e7eb'
      roundRect(ctx, 20, y + 8, 36, 36, 18)
      ctx.fill()
      ctx.fillStyle = '#666'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`#${rank}`, 38, y + 30)
    }

    ctx.fillStyle = isTop3 ? (tier ? tier.color : '#333') : '#333'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(user.nickName || '匿名用户', 70, y + 25)

    const typeInfo = LEADERBOARD_TYPES[leaderboardManager.getCurrentType()]
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#999'
    ctx.fillText(`${typeInfo.icon} ${user.score || 0}${typeInfo.unit}`, 70, y + 43)

    if (user.avatarUrl) {
      ctx.fillStyle = '#fce7eb'
      ctx.beginPath()
      ctx.arc(screenWidth - 45, y + 25, 18, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  return {
    itemHeight,
    totalHeight: rankings.length * itemHeight,
    startIndex,
    endIndex
  }
}

function renderRankingsTab(ctx, screenWidth, tabs, activeTab, onTabChange) {
  const tabWidth = screenWidth / tabs.length

  tabs.forEach((tab, i) => {
    const x = i * tabWidth
    const isActive = i === activeTab

    if (isActive) {
      ctx.fillStyle = 'rgba(201, 48, 90, 0.1)'
      ctx.fillRect(x, 50, tabWidth, 30)
    }

    ctx.fillStyle = isActive ? '#c9305a' : '#666'
    ctx.font = isActive ? 'bold 13px sans-serif' : '13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${tab.icon} ${tab.name}`, x + tabWidth / 2, 70)
  })
}

function renderMyRankCard(ctx, screenWidth, myRank, type) {
  const cardY = screenHeight - 90

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  roundRect(ctx, 15, cardY, screenWidth - 30, 70, 15)
  ctx.fill()

  ctx.fillStyle = '#c9305a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('我的战绩', 25, cardY + 25)

  if (myRank && myRank.rank > 0) {
    const tier = leaderboardManager.getRankTier(myRank.rank)

    ctx.fillStyle = tier ? tier.color : '#ffd700'
    roundRect(ctx, 25, cardY + 35, 50, 25, 12)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(tier ? tier.icon : `#${myRank.rank}`, 50, cardY + 53)

    ctx.fillStyle = '#333'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`第 ${myRank.rank} 名`, 90, cardY + 55)

    const typeInfo = LEADERBOARD_TYPES[type]
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#666'
    ctx.fillText(`${typeInfo.icon} ${myRank.score || 0}${typeInfo.unit}`, 200, cardY + 55)
  } else {
    ctx.fillStyle = '#999'
    ctx.font = '14px sans-serif'
    ctx.fillText('暂无排名', 25, cardY + 55)
  }
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
  leaderboardManager,
  LEADERBOARD_TYPES,
  RANK_TIERS,
  renderLeaderboardHeader,
  renderRankingsList,
  renderRankingsTab,
  renderMyRankCard
}