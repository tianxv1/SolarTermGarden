// 节气花园 - 成就系统模块
// 成就定义、解锁、展示

const ACHIEVEMENT_CATEGORIES = {
  gardening: { id: 'gardening', name: '园艺达人', icon: '🌱', color: '#22c55e' },
  pet: { id: 'pet', name: '宠物之友', icon: '🐾', color: '#f59e0b' },
  social: { id: 'social', name: '社交达人', icon: '💬', color: '#3b82f6' },
  combat: { id: 'combat', name: '竞技高手', icon: '⚔️', color: '#ef4444' },
  collection: { id: 'collection', name: '收藏家', icon: '🏆', color: '#a855f7' },
  special: { id: 'special', name: '特殊成就', icon: '🌟', color: '#ec4899' }
}

const ACHIEVEMENT_DEFINITIONS = [
  // 园艺成就
  { id: 'plant_1', category: 'gardening', name: '初次播种', description: '种植第一颗种子', icon: '🌱', reward: { coins: 50 }, condition: { type: 'plant', count: 1 } },
  { id: 'plant_10', category: 'gardening', name: '小农场主', description: '累计种植10次', icon: '🌻', reward: { coins: 200 }, condition: { type: 'plant', count: 10 } },
  { id: 'plant_50', category: 'gardening', name: '种植大户', description: '累计种植50次', icon: '🌳', reward: { coins: 500 }, condition: { type: 'plant', count: 50 } },
  { id: 'plant_100', category: 'gardening', name: '田园诗人', description: '累计种植100次', icon: '🍃', reward: { coins: 1000 }, condition: { type: 'plant', count: 100 } },
  { id: 'harvest_1', category: 'gardening', name: '初次收获', description: '收获第一颗作物', icon: '🥬', reward: { coins: 50 }, condition: { type: 'harvest', count: 1 } },
  { id: 'harvest_50', category: 'gardening', name: '丰收季节', description: '累计收获50次', icon: '🌾', reward: { coins: 500 }, condition: { type: 'harvest', count: 50 } },
  { id: 'harvest_200', category: 'gardening', name: '农场主', description: '累计收获200次', icon: '🎃', reward: { coins: 1500 }, condition: { type: 'harvest', count: 200 } },
  { id: 'water_100', category: 'gardening', name: '辛勤园丁', description: '累计浇水100次', icon: '💧', reward: { coins: 300 }, condition: { type: 'water', count: 100 } },
  { id: 'fertilize_50', category: 'gardening', name: '施肥专家', description: '累计施肥50次', icon: '🧪', reward: { coins: 300 }, condition: { type: 'fertilize', count: 50 } },
  { id: 'all_crops', category: 'gardening', name: '作物图鉴', description: '种植过所有类型的作物', icon: '📖', reward: { coins: 800 }, condition: { type: 'uniqueCrops', count: 8 }, hidden: true },

  // 宠物成就
  { id: 'pet_adopt', category: 'pet', name: '初次收养', description: '收养第一只宠物', icon: '🐱', reward: { coins: 100 }, condition: { type: 'petAdopt', count: 1 } },
  { id: 'pet_feed_10', category: 'pet', name: '饲养新手', description: '喂养宠物10次', icon: '🥣', reward: { coins: 100 }, condition: { type: 'petFeed', count: 10 } },
  { id: 'pet_feed_100', category: 'pet', name: '贴心主人', description: '喂养宠物100次', icon: '🍖', reward: { coins: 500 }, condition: { type: 'petFeed', count: 100 } },
  { id: 'pet_chat_10', category: 'pet', name: '闲聊家常', description: '与宠物聊天10次', icon: '💬', reward: { coins: 100 }, condition: { type: 'petChat', count: 10 } },
  { id: 'pet_chat_50', category: 'pet', name: '心灵伙伴', description: '与宠物聊天50次', icon: '🤝', reward: { coins: 300 }, condition: { type: 'petChat', count: 50 } },
  { id: 'pet_max_level', category: 'pet', name: '宠物大师', description: '宠物达到最高等级', icon: '👑', reward: { coins: 1000 }, condition: { type: 'petMaxLevel', count: 1 }, hidden: true },

  // 社交成就
  { id: 'friend_1', category: 'social', name: '社交达人', description: '添加第一个好友', icon: '🤝', reward: { coins: 100 }, condition: { type: 'friends', count: 1 } },
  { id: 'friend_10', category: 'social', name: '交友广泛', description: '拥有10个好友', icon: '👥', reward: { coins: 300 }, condition: { type: 'friends', count: 10 } },
  { id: 'post_1', category: 'social', name: '初次发帖', description: '发布第一篇帖子', icon: '📝', reward: { coins: 50 }, condition: { type: 'post', count: 1 } },
  { id: 'post_10', category: 'social', name: '内容创作者', description: '发布10篇帖子', icon: '✍️', reward: { coins: 300 }, condition: { type: 'post', count: 10 } },
  { id: 'comment_10', category: 'social', name: '活跃评论', description: '发表评论10次', icon: '💭', reward: { coins: 100 }, condition: { type: 'comment', count: 10 } },
  { id: 'like_50', category: 'social', name: '人气博主', description: '获得50个点赞', icon: '❤️', reward: { coins: 200 }, condition: { type: 'receiveLike', count: 50 } },

  // 竞技成就
  { id: 'battle_1', category: 'combat', name: '初出茅庐', description: '参加第一次竞技', icon: '⚔️', reward: { coins: 50 }, condition: { type: 'battle', count: 1 } },
  { id: 'battle_win_10', category: 'combat', name: '常胜将军', description: '累计获胜10次', icon: '🏅', reward: { coins: 500 }, condition: { type: 'battleWin', count: 10 } },
  { id: 'battle_win_50', category: 'combat', name: '战神', description: '累计获胜50次', icon: '💎', reward: { coins: 1500 }, condition: { type: 'battleWin', count: 50 } },
  { id: 'rank_top10', category: 'combat', name: '排行榜之星', description: '进入排行榜前10', icon: '🌟', reward: { coins: 1000 }, condition: { type: 'rankTop10', count: 1 }, hidden: true },

  // 收藏成就
  { id: 'solar_terms_24', category: 'collection', name: '节气学者', description: '解锁全部24节气知识', icon: '📅', reward: { coins: 800 }, condition: { type: 'solarTermsUnlocked', count: 24 }, hidden: true },
  { id: 'handbook_complete', category: 'collection', name: '百科全书', description: '解锁全部植物百科', icon: '📚', reward: { coins: 500 }, condition: { type: 'handbookComplete', count: 1 }, hidden: true },

  // 特殊成就
  { id: 'login_7', category: 'special', name: '一周坚持', description: '连续登录7天', icon: '📆', reward: { coins: 200 }, condition: { type: 'loginStreak', count: 7 } },
  { id: 'login_30', category: 'special', name: '月度玩家', description: '连续登录30天', icon: '🏠', reward: { coins: 1000 }, condition: { type: 'loginStreak', count: 30 } },
  { id: 'first_recharge', category: 'special', name: '慷慨解囊', description: '首次充值（预留）', icon: '💰', reward: { coins: 0 }, condition: { type: 'recharge', count: 1 }, hidden: true },
  { id: 'share_game', category: 'special', name: '分享达人', description: '成功分享游戏5次', icon: '🔗', reward: { coins: 100 }, condition: { type: 'share', count: 5 } },
  { id: 'offline_earn', category: 'special', name: '离线收益', description: '离线后首次领取收益', icon: '⏰', reward: { coins: 100 }, condition: { type: 'offlineCollect', count: 1 } }
]

class AchievementManager {
  constructor() {
    this.currentUserId = null
    this.unlockedAchievements = []
    this.pendingUnlock = null
    this.listeners = {}
  }

  setCurrentUser(openid) {
    this.currentUserId = openid
  }

  async loadAchievements() {
    if (!this.currentUserId) return { success: false, message: '未登录' }

    try {
      const result = await wx.cloud.callFunction({
        name: 'getUserAchievements',
        data: { userId: this.currentUserId }
      })

      if (result.success) {
        this.unlockedAchievements = result.achievements || []
        return { success: true, achievements: this.unlockedAchievements }
      }

      return { success: false, message: result.message || '加载失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async checkAndUnlock(condition) {
    if (!this.currentUserId) return null

    const { type, count, value } = condition

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      if (this.isUnlocked(achievement.id)) continue
      if (achievement.hidden) continue

      const achCondition = achievement.condition
      if (achCondition.type !== type) continue

      let targetCount = achCondition.count
      if (type === 'uniqueCrops' || type === 'solarTermsUnlocked') {
        targetCount = achCondition.count
      }

      if (count >= targetCount) {
        return await this.unlock(achievement.id)
      }
    }

    return null
  }

  async unlock(achievementId) {
    if (!this.currentUserId) return { success: false, message: '未登录' }

    const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId)
    if (!achievement) {
      return { success: false, message: '成就不存在' }
    }

    if (this.isUnlocked(achievementId)) {
      return { success: false, message: '已解锁' }
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'unlockAchievement',
        data: {
          userId: this.currentUserId,
          achievementId
        }
      })

      if (result.success) {
        this.unlockedAchievements.push({
          ...achievement,
          unlockTime: Date.now()
        })
        this.pendingUnlock = achievement
        this.notifyListeners('achievementUnlocked', achievement)
        return { success: true, achievement }
      }

      return { success: false, message: result.message || '解锁失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  isUnlocked(achievementId) {
    return this.unlockedAchievements.some(a => a.id === achievementId)
  }

  getUnlockedCount() {
    return this.unlockedAchievements.length
  }

  getTotalCount() {
    return ACHIEVEMENT_DEFINITIONS.filter(a => !a.hidden).length
  }

  getProgress() {
    return `${this.getUnlockedCount()}/${this.getTotalCount()}`
  }

  getByCategory(categoryId) {
    const category = ACHIEVEMENT_CATEGORIES[categoryId]
    const achievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.category === categoryId)

    return {
      category,
      achievements: achievements.map(ach => ({
        ...ach,
        unlocked: this.isUnlocked(ach.id),
        unlockData: this.unlockedAchievements.find(a => a.id === ach.id)
      }))
    }
  }

  getAllAchievements() {
    return ACHIEVEMENT_DEFINITIONS.map(ach => ({
      ...ach,
      unlocked: this.isUnlocked(ach.id),
      unlockData: this.unlockedAchievements.find(a => a.id === ach.id)
    }))
  }

  getPendingUnlock() {
    return this.pendingUnlock
  }

  clearPendingUnlock() {
    this.pendingUnlock = null
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
          console.error('[AchievementManager] Listener error:', e)
        }
      })
    }
  }
}

const achievementManager = new AchievementManager()

function renderAchievementBadge(ctx, x, y, achievement, size = 60) {
  const { icon, name, unlocked } = achievement
  const alpha = unlocked ? 1.0 : 0.4

  ctx.save()
  ctx.globalAlpha = alpha

  const gradient = ctx.createRadialGradient(x + size/2, y + size/2, 0, x + size/2, y + size/2, size/2)
  if (unlocked) {
    gradient.addColorStop(0, '#fef3c7')
    gradient.addColorStop(1, '#fcd34d')
  } else {
    gradient.addColorStop(0, '#e5e7eb')
    gradient.addColorStop(1, '#9ca3af')
  }

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = unlocked ? '#f59e0b' : '#d1d5db'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.font = `${size * 0.5}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(icon, x + size/2, y + size/2)

  ctx.restore()
}

function renderAchievementPopup(ctx, screenWidth, screenHeight, achievement, progress = 0) {
  const popupWidth = 280
  const popupHeight = 160
  const popupX = (screenWidth - popupWidth) / 2
  const popupY = screenHeight / 2 - popupHeight - 50

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  const scale = Math.min(1, progress * 2)
  ctx.save()
  ctx.translate(popupX + popupWidth/2, popupY + popupHeight/2)
  ctx.scale(scale, scale)
  ctx.translate(-popupWidth/2, -popupHeight/2)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)'
  roundRect(ctx, 0, 0, popupWidth, popupHeight, [20, 20, 20, 20])
  ctx.fill()

  ctx.fillStyle = '#f59e0b'
  roundRect(ctx, popupWidth/2 - 50, -15, 100, 30, [15, 15, 15, 15])
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🏆 成就解锁', popupWidth/2, 5)

  ctx.font = 'bold 20px sans-serif'
  ctx.fillStyle = '#333'
  ctx.fillText(achievement.icon + ' ' + achievement.name, popupWidth/2, 55)

  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#666'
  ctx.fillText(achievement.description, popupWidth/2, 85)

  if (achievement.reward && achievement.reward.coins > 0) {
    ctx.fillStyle = '#fef3c7'
    roundRect(ctx, popupWidth/2 - 60, 100, 120, 35, [17, 17, 17, 17])
    ctx.fill()
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText(`+${achievement.reward.coins} 金币`, popupWidth/2, 123)
  }

  ctx.restore()

  return { x: popupX, y: popupY, width: popupWidth, height: popupHeight }
}

function renderAchievementList(ctx, screenWidth, screenHeight, options = {}) {
  const {
    achievements = [],
    category = null,
    scrollY = 0,
    onTap = null
  } = options

  const categories = category ? [ACHIEVEMENT_CATEGORIES[category]] : Object.values(ACHIEVEMENT_CATEGORIES)
  let currentY = 80 - scrollY

  categories.forEach(cat => {
    const catAchievements = achievements.filter(a => a.category === cat.id)

    ctx.fillStyle = cat.color
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${cat.icon} ${cat.name}`, 20, currentY + 15)

    currentY += 35

    catAchievements.forEach(ach => {
      ctx.fillStyle = ach.unlocked ? 'rgba(255, 255, 255, 0.95)' : 'rgba(239, 239, 239, 0.8)'
      roundRect(ctx, 15, currentY, screenWidth - 30, 60, [12, 12, 12, 12])
      ctx.fill()

      if (ach.unlocked) {
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(ach.icon, 50, currentY + 38)

      ctx.fillStyle = ach.unlocked ? '#333' : '#999'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(ach.name, 85, currentY + 25)

      ctx.font = '12px sans-serif'
      ctx.fillStyle = ach.unlocked ? '#666' : '#bbb'
      ctx.fillText(ach.description, 85, currentY + 43)

      if (ach.unlocked && ach.unlockData) {
        const date = new Date(ach.unlockData.unlockTime)
        ctx.font = '10px sans-serif'
        ctx.fillStyle = '#999'
        ctx.textAlign = 'right'
        ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, screenWidth - 25, currentY + 25)
      }

      if (ach.reward && ach.reward.coins > 0) {
        ctx.fillStyle = '#fef3c7'
        roundRect(ctx, screenWidth - 90, currentY + 15, 60, 28, [14, 14, 14, 14])
        ctx.fill()
        ctx.fillStyle = '#f59e0b'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`+${ach.reward.coins}`, screenWidth - 60, currentY + 34)
      }

      currentY += 70
    })

    currentY += 15
  })

  return currentY
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
  achievementManager,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_DEFINITIONS,
  renderAchievementBadge,
  renderAchievementPopup,
  renderAchievementList
}