// 节气花园 - 主入口文件 (增强版)
// 统一管理所有模块的渲染和交互

console.log('=== 节气花园启动 ===')

let canvas, ctx, dpr, screenWidth, screenHeight
let modules = {}
let GameState = {}
let sceneManager = null
let tooltipManager = null
let achievementManager = null
let seasonalEventManager = null
let lastRenderTime = 0
let isInitialized = false

async function init() {
  if (isInitialized) return

  try {
    canvas = wx.createCanvas()
    ctx = canvas.getContext('2d')

    dpr = wx.getSystemInfoSync().devicePixelRatio || 1
    screenWidth = canvas.width || 375
    screenHeight = canvas.height || 667

    canvas.width = screenWidth * dpr
    canvas.height = screenHeight * dpr
    ctx.scale(dpr, dpr)

    GameGlobal.ctx = ctx
    GameGlobal.screenWidth = screenWidth
    GameGlobal.screenHeight = screenHeight

    GameState = {
      currentScene: 'splash',
      userInfo: null,
      gold: 100,
      petals: 0,
      level: 1,
      experience: 0,
      currentSolarTerm: getCurrentSolarTerm(),
      currentSeason: getCurrentSeason(),
      menuExpanded: false,
      menuBtnPos: { x: screenWidth - 35, y: 75, r: 22 },
      menuItems: [],
      backBtnPos: { x: 35, y: 75, r: 20 },
      buttons: [],
      selectedPlot: null,
      selectedSeed: null,
      pet: {
        type: 'cat',
        name: '小橘',
        satiety: 80,
        energy: 70,
        intimacy: 50,
        mood: 'happy'
      },
      playerStats: {
        plantCount: 0,
        waterCount: 0,
        harvestCount: 0,
        fertilizeCount: 0,
        chatCount: 0,
        petCount: 0,
        battleWinCount: 0,
        battleCount: 0,
        postCount: 0,
        commentCount: 0,
        loginDays: 1
      },
      dailyTasks: {
        date: null,
        tasks: [],
        completed: 0,
        lastReset: 0
      },
      randomEvent: {
        active: false,
        type: null,
        title: '',
        description: '',
        reward: 0,
        effect: null,
        endTime: 0
      },
      crowWarning: {
        active: false,
        targetRow: -1,
        targetCol: -1,
        warningTime: 0
      },
      audioSettings: {
        soundEnabled: true,
        musicEnabled: true,
        volume: 0.7,
        musicVolume: 0.5
      },
      pots: {
        unlocked: ['basic'],
        current: 'basic'
      },
      updateStatus: {},
      settings: {
        showTooltips: true,
        autoWater: false,
        notifications: true
      }
    }

    GameGlobal.GameState = GameState

    loadModules()
    initGameData()
    initEventListeners()

    wx.onTouchStart(handleTouchStart)
    wx.onTouchMove(handleTouchMove)
    wx.onTouchEnd(handleTouchEnd)

    isInitialized = true
    console.log('游戏初始化完成')

    requestAnimationFrame(gameLoop)

    setTimeout(() => {
      if (GameState.currentScene === 'splash') {
        transitionTo('garden')
      }
    }, 3000)

  } catch (e) {
    console.error('初始化失败:', e)
  }
}

function loadModules() {
  const globals = require('./modules/globals')
  Object.assign(GameGlobal, globals)

  modules = {
    globals,
    splash: require('./modules/splash'),
    garden: require('./modules/garden'),
    seedShop: require('./modules/seedShop'),
    petChat: require('./modules/petChat'),
    handbook: require('./modules/handbook'),
    disease: require('./modules/disease'),
    community: require('./modules/community'),
    battle: require('./modules/battle'),
    profile: require('./modules/profile'),
    dailyTasks: require('./modules/dailyTasks'),
    offline: require('./modules/offline'),
    tutorial: require('./modules/tutorial'),
    friends: require('./modules/friends'),
    achievement: require('./modules/achievement'),
    leaderboard: require('./modules/leaderboard'),
    tooltip: require('./modules/tooltip'),
    seasonalEvent: require('./modules/seasonalEvent'),
    feedback: require('./modules/feedback'),
    analytics: require('./modules/analytics'),
    audioManager: require('./modules/audioManager'),
    imageLoader: require('./modules/imageLoader'),
    sceneManager: require('./modules/sceneManager')
  }

  tooltipManager = modules.tooltip?.tooltipManager
  achievementManager = modules.achievement?.achievementManager
  seasonalEventManager = modules.seasonalEvent?.seasonalEventManager
  sceneManager = modules.sceneManager?.sceneManager

  console.log('模块加载完成:', Object.keys(modules).length, '个模块')
}

function initGameData() {
  if (modules.garden?.CameraState?.initBounds) {
    modules.garden.CameraState.initBounds(screenWidth, screenHeight)
  }

  if (modules.garden?.GardenData?.initPlots) {
    modules.garden.GardenData.initPlots()
  }

  if (seasonalEventManager) {
    seasonalEventManager.init()
  }

  if (modules.dailyTasks?.initDailyTasks) {
    modules.dailyTasks.initDailyTasks()
  }

  if (modules.audioManager?.preloadCommonImages) {
    modules.audioManager.preloadCommonImages()
  }

  checkAndResetDailyTasks()
  calculateOfflineEarnings()
}

function initEventListeners() {
  if (modules.audioManager?.playClick) {
    wx.onTouchStart(() => {
      modules.audioManager.playClick()
    })
  }

  if (modules.offline?.checkOfflineStatus) {
    wx.onShow(() => {
      calculateOfflineEarnings()
    })
  }
}

function gameLoop(timestamp) {
  if (!isInitialized) {
    requestAnimationFrame(gameLoop)
    return
  }

  const deltaTime = timestamp - lastRenderTime
  lastRenderTime = timestamp

  update(deltaTime)
  render()

  requestAnimationFrame(gameLoop)
}

function update(deltaTime) {
  if (modules.seasonalEvent?.seasonalEventManager) {
    modules.seasonalEvent.seasonalEventManager.checkActiveEvents()
  }

  if (GameState.randomEvent.active && Date.now() > GameState.randomEvent.endTime) {
    dismissRandomEvent()
  }

  if (GameState.crowWarning.active && Date.now() > GameState.crowWarning.warningTime + 5000) {
    GameState.crowWarning.active = false
  }

  if (achievementManager) {
    const pendingUnlock = achievementManager.getPendingUnlock()
    if (pendingUnlock) {
      if (tooltipManager) {
        tooltipManager.show({
          title: '🏆 成就解锁',
          content: `${pendingUnlock.icon} ${pendingUnlock.name}`,
          type: 'success'
        }, { autoDismiss: true, duration: 3000 })
      }
      achievementManager.clearPendingUnlock()
    }
  }
}

function render() {
  ctx.fillStyle = '#fdf2f4'
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  const currentScene = GameState.currentScene

  switch (currentScene) {
    case 'splash':
      modules.splash?.renderSplash?.()
      break
    case 'tutorial':
      modules.tutorial?.renderTutorial?.()
      break
    case 'garden':
      renderGardenScene()
      break
    case 'seedshop':
      modules.seedShop?.renderSeedShop?.(ctx, screenWidth, screenHeight)
      break
    case 'pet':
      modules.petChat?.renderPetChat?.(ctx, screenWidth, screenHeight)
      break
    case 'handbook':
      modules.handbook?.renderHandbook?.(ctx, screenWidth, screenHeight)
      break
    case 'disease':
      modules.disease?.renderDiseasePage?.(ctx, screenWidth, screenHeight)
      break
    case 'community':
      modules.community?.renderCommunityPage?.(ctx, screenWidth, screenHeight)
      break
    case 'battle':
      modules.battle?.renderBattlePage?.(ctx, screenWidth, screenHeight)
      break
    case 'profile':
      modules.profile?.renderProfile?.(ctx, screenWidth, screenHeight)
      break
    case 'friends':
      modules.friends?.renderFriendsList?.(ctx, screenWidth, screenHeight)
      break
    case 'achievement':
      modules.achievement?.renderAchievementList?.(ctx, screenWidth, screenHeight)
      break
    case 'leaderboard':
      modules.leaderboard?.renderRankingsList?.(ctx, screenWidth, screenHeight)
      break
    case 'feedback':
      modules.feedback?.renderFeedbackForm?.(ctx, screenWidth, screenHeight)
      break
    case 'analytics':
      modules.analytics?.renderAnalyticsOverview?.(ctx, screenWidth, screenHeight)
      break
    case 'settings':
      renderSettingsPage()
      break
    default:
      modules.garden?.renderGardenPage?.(ctx, screenWidth, screenHeight)
  }

  renderActiveTooltip()
  renderRandomEventBanner()
  renderAchievementPopup()

  renderTopMenu()
  renderBottomNav()
  renderBackButton()
}

function renderGardenScene() {
  modules.garden?.renderGardenPage?.(ctx, screenWidth, screenHeight)

  if (modules.seasonalEvent?.renderSeasonBonus) {
    const season = seasonalEventManager?.getCurrentSeason() || GameState.currentSeason
    const bonuses = seasonalEventManager?.getBonuses() || []
    if (bonuses.length > 0) {
      modules.seasonalEvent.renderSeasonBonus(ctx, screenWidth, season, bonuses)
    }
  }

  if (GameState.randomEvent.active) {
    modules.seasonalEvent?.renderEventBanner?.(ctx, screenWidth, GameState.randomEvent)
  }
}

function renderTopMenu() {
  if (GameState.currentScene === 'splash' || GameState.currentScene === 'tutorial') return

  const { drawRoundRect, drawCircle, drawText } = modules.globals

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  drawRoundRect(ctx, 0, 50, screenWidth, 55, 0)
  ctx.fill()

  drawText(ctx, `💰 ${GameState.gold || 0}`, screenWidth - 80, 75, {
    align: 'right', font: 'bold 14px sans-serif', color: '#b45309'
  })

  drawText(ctx, `🌸 ${GameState.petals || 0}`, screenWidth - 160, 75, {
    align: 'right', font: 'bold 14px sans-serif', color: '#ec4899'
  })

  drawText(ctx, GameState.currentSolarTerm || '立春', 70, 75, {
    align: 'left', font: 'bold 14px sans-serif', color: '#16a34a'
  })

  const menuX = screenWidth - 35
  const menuY = 75
  drawCircle(ctx, menuX, menuY, 22, 'rgba(255, 255, 255, 0.8)')
  drawText(ctx, '☰', menuX, menuY, {
    align: 'center', font: 'bold 16px sans-serif', color: '#666'
  })
}

function renderBottomNav() {
  if (GameState.currentScene === 'splash' || GameState.currentScene === 'tutorial') return
  if (GameState.currentScene !== 'garden') return

  const { drawRoundRect, drawCircle, drawText } = modules.globals

  const navItems = [
    { icon: '🏠', label: '花园', scene: 'garden' },
    { icon: '🛒', label: '商店', scene: 'seedshop' },
    { icon: '🐱', label: '宠物', scene: 'pet' },
    { icon: '📖', label: '百科', scene: 'handbook' },
    { icon: '💬', label: '社区', scene: 'community' }
  ]

  const navY = screenHeight - 70
  const navHeight = 60
  const itemWidth = screenWidth / navItems.length

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  drawRoundRect(ctx, 0, navY, screenWidth, navHeight, 20)
  ctx.fill()

  navItems.forEach((item, i) => {
    const x = itemWidth * i + itemWidth / 2
    const isActive = GameState.currentScene === item.scene

    if (isActive) {
      ctx.fillStyle = 'rgba(201, 48, 90, 0.1)'
      drawRoundRect(ctx, x - 25, navY + 8, 50, 44, 12)
      ctx.fill()
    }

    drawText(ctx, item.icon, x, navY + 22, {
      align: 'center', font: '18px sans-serif'
    })

    drawText(ctx, item.label, x, navY + 45, {
      align: 'center', font: '10px sans-serif', color: isActive ? '#c9305a' : '#999'
    })
  })
}

function renderBackButton() {
  if (GameState.currentScene === 'splash' || GameState.currentScene === 'tutorial') return
  if (GameState.currentScene === 'garden') return

  const { drawCircle, drawText } = modules.globals

  drawCircle(ctx, 35, 75, 20, 'rgba(255, 255, 255, 0.8)')
  drawText(ctx, '<', 35, 75, {
    align: 'center', font: 'bold 18px sans-serif', color: '#666'
  })
}

function renderActiveTooltip() {
  if (!tooltipManager?.isTooltipActive()) return

  const tooltip = tooltipManager.getCurrentTooltip()
  if (tooltip) {
    modules.tooltip?.renderTooltip?.(ctx, screenWidth, tooltip)
  }
}

function renderRandomEventBanner() {
  if (!GameState.randomEvent.active) return

  if (modules.seasonalEvent?.renderEventBanner) {
    modules.seasonalEvent.renderEventBanner(ctx, screenWidth, GameState.randomEvent)
  }
}

function renderAchievementPopup() {
  if (!achievementManager?.getPendingUnlock()) return

  const achievement = achievementManager.getPendingUnlock()
  if (achievement && modules.achievement?.renderAchievementPopup) {
    modules.achievement.renderAchievementPopup(ctx, screenWidth, screenHeight, achievement)
  }
}

function renderSettingsPage() {
  const { drawRoundRect, drawText } = modules.globals

  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  drawRoundRect(ctx, 0, 50, screenWidth, 55, 0)
  ctx.fill()

  drawText(ctx, '设置', screenWidth / 2, 75, {
    align: 'center', font: 'bold 18px sans-serif', color: '#333'
  })

  const settings = [
    { icon: '🔊', label: '音效', value: GameState.audioSettings.soundEnabled },
    { icon: '🎵', label: '音乐', value: GameState.audioSettings.musicEnabled },
    { icon: '💡', label: '工具提示', value: GameState.settings.showTooltips },
    { icon: '🔔', label: '通知', value: GameState.settings.notifications }
  ]

  settings.forEach((item, i) => {
    const y = 140 + i * 60
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    drawRoundRect(ctx, 15, y, screenWidth - 30, 50, 12)
    ctx.fill()

    drawText(ctx, item.icon, 35, y + 25, { align: 'left', font: '18px sans-serif' })
    drawText(ctx, item.label, 70, y + 25, { align: 'left', font: '14px sans-serif', color: '#333' })

    ctx.fillStyle = item.value ? '#22c55e' : '#d1d5db'
    drawRoundRect(ctx, screenWidth - 65, y + 15, 50, 20, 10)
    ctx.fill()
  })
}

function handleTouchStart(e) {
  const touch = e.touches[0]
  const x = touch.clientX
  const y = touch.clientY

  if (handleGlobalTouch(x, y)) return

  switch (GameState.currentScene) {
    case 'garden':
      modules.garden?.handleGardenPageTouch?.(x, y, render)
      break
    case 'seedshop':
      modules.seedShop?.handleSeedShopTouch?.(x, y, render)
      break
    case 'pet':
      modules.petChat?.handlePetChatTouch?.(x, y)
      break
    case 'handbook':
      modules.handbook?.handleHandbookTouch?.(x, y)
      break
    case 'disease':
      modules.disease?.handleDiseaseTouch?.(x, y)
      break
    case 'community':
      modules.community?.handleCommunityTouch?.(x, y)
      break
    case 'battle':
      modules.battle?.handleBattleTouch?.(x, y)
      break
    case 'profile':
      modules.profile?.handleProfileTouch?.(x, y, render)
      break
    case 'friends':
      modules.friends?.handleFriendTouch?.(x, y)
      break
    case 'achievement':
      modules.achievement?.handleAchievementTouch?.(x, y)
      break
    case 'leaderboard':
      modules.leaderboard?.handleLeaderboardTouch?.(x, y)
      break
    case 'feedback':
      modules.feedback?.handleFeedbackTouch?.(x, y)
      break
    case 'analytics':
      modules.analytics?.handleAnalyticsTouch?.(x, y)
      break
    case 'settings':
      handleSettingsTouch(x, y)
      break
  }
}

function handleGlobalTouch(x, y) {
  const { distance } = modules.globals

  if (GameState.currentScene !== 'garden') {
    if (distance(x, y, 35, 75) <= 20) {
      transitionTo('garden')
      return true
    }
  }

  if (distance(x, y, screenWidth - 35, 75) <= 22) {
    handleMenuTouch(x, y)
    return true
  }

  if (GameState.currentScene === 'garden') {
    const navItems = [
      { scene: 'seedshop', x: screenWidth / 4 * 1 },
      { scene: 'pet', x: screenWidth / 4 * 2 },
      { scene: 'handbook', x: screenWidth / 4 * 3 }
    ]

    const navY = screenHeight - 70
    if (y >= navY) {
      for (const item of navItems) {
        if (Math.abs(x - item.x) < 40) {
          transitionTo(item.scene)
          return true
        }
      }
      return true
    }
  }

  return false
}

function handleMenuTouch(x, y) {
  const { distance } = modules.globals

  if (GameState.menuExpanded) {
    const menuItems = [
      { icon: '👤', label: '个人中心', scene: 'profile' },
      { icon: '👥', label: '好友', scene: 'friends' },
      { icon: '🏆', label: '排行榜', scene: 'leaderboard' },
      { icon: '🎯', label: '成就', scene: 'achievement' },
      { icon: '📊', label: '数据', scene: 'analytics' },
      { icon: '⚙️', label: '设置', scene: 'settings' },
      { icon: '📝', label: '反馈', scene: 'feedback' }
    ]

    for (const item of menuItems) {
      const itemX = screenWidth - 100
      const itemY = 120 + menuItems.indexOf(item) * 50
      if (distance(x, y, itemX, itemY) <= 40) {
        transitionTo(item.scene)
        GameState.menuExpanded = false
        return
      }
    }

    GameState.menuExpanded = false
  } else {
    GameState.menuExpanded = true
  }

  render()
}

function handleSettingsTouch(x, y) {
  const settings = [
    { key: 'soundEnabled', y: 140 },
    { key: 'musicEnabled', y: 200 },
    { key: 'showTooltips', y: 260 },
    { key: 'notifications', y: 320 }
  ]

  for (const setting of settings) {
    if (y >= setting.y && y <= setting.y + 50) {
      if (x >= screenWidth - 65 && x <= screenWidth - 15) {
        GameState.audioSettings[setting.key] = !GameState.audioSettings[setting.key]
        GameState.settings[setting.key] = !GameState.settings[setting.key]
        render()
        return
      }
    }
  }
}

function handleTouchMove(e) {
  if (GameState.currentScene === 'garden') {
    modules.garden?.handleGardenPageTouchMove?.(e)
  }
}

function handleTouchEnd(e) {
}

function transitionTo(scene) {
  if (scene === 'battle' && modules.battle?.initGame) {
    modules.battle.initGame(GameState.currentScene)
  }

  if (scene === 'disease' && modules.disease?.initDisease) {
    modules.disease.initDisease(GameState.currentScene)
  }

  GameState.currentScene = scene
  GameState.menuExpanded = false

  modules.audioManager?.playClick?.()

  console.log('切换到场景:', scene)
  render()
}

function checkAndResetDailyTasks() {
  const now = Date.now()
  const lastReset = GameState.dailyTasks.lastReset || 0
  const oneDay = 24 * 60 * 60 * 1000

  if (!GameState.dailyTasks.date || now - lastReset >= oneDay) {
    if (modules.dailyTasks?.resetDailyTasks) {
      modules.dailyTasks.resetDailyTasks()
    }
    GameState.dailyTasks.lastReset = now
    GameState.dailyTasks.date = new Date().toDateString()
    GameState.dailyTasks.completed = 0
  }
}

function calculateOfflineEarnings() {
  if (modules.offline?.calculateOfflineEarnings) {
    const earnings = modules.offline.calculateOfflineEarnings()
    if (earnings && earnings.total > 0) {
      GameState.gold += earnings.total
      showRandomEvent({
        type: 'offline',
        title: '⏰ 离线收益',
        description: `离线期间获得 ${earnings.total} 金币！`,
        reward: earnings.total
      })
    }
  }
}

function showRandomEvent(event) {
  GameState.randomEvent = {
    active: true,
    type: event.type,
    title: event.title,
    description: event.description,
    reward: event.reward || 0,
    effect: event.effect,
    endTime: Date.now() + 5000
  }
  render()
}

function dismissRandomEvent() {
  GameState.randomEvent.active = false
  render()
}

function getCurrentSolarTerm() {
  const solarTerms = [
    { name: '立春', month: 2, day: 4 },
    { name: '雨水', month: 2, day: 19 },
    { name: '惊蛰', month: 3, day: 5 },
    { name: '春分', month: 3, day: 21 },
    { name: '清明', month: 4, day: 5 },
    { name: '谷雨', month: 4, day: 20 },
    { name: '立夏', month: 5, day: 5 },
    { name: '小满', month: 5, day: 21 },
    { name: '芒种', month: 6, day: 6 },
    { name: '夏至', month: 6, day: 21 },
    { name: '小暑', month: 7, day: 7 },
    { name: '大暑', month: 7, day: 22 },
    { name: '立秋', month: 8, day: 7 },
    { name: '处暑', month: 8, day: 23 },
    { name: '白露', month: 9, day: 7 },
    { name: '秋分', month: 9, day: 23 },
    { name: '寒露', month: 10, day: 8 },
    { name: '霜降', month: 10, day: 23 },
    { name: '立冬', month: 11, day: 7 },
    { name: '小雪', month: 11, day: 22 },
    { name: '大雪', month: 12, day: 7 },
    { name: '冬至', month: 12, day: 22 },
    { name: '小寒', month: 1, day: 6 },
    { name: '大寒', month: 1, day: 20 }
  ]

  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  for (let i = solarTerms.length - 1; i >= 0; i--) {
    const term = solarTerms[i]
    if (month > term.month || (month === term.month && day >= term.day)) {
      return term.name
    }
  }
  return '立春'
}

function getCurrentSeason() {
  const term = getCurrentSolarTerm()
  const seasonMap = {
    '立春': 'spring', '雨水': 'spring', '惊蛰': 'spring', '春分': 'spring', '清明': 'spring', '谷雨': 'spring',
    '立夏': 'summer', '小满': 'summer', '芒种': 'summer', '夏至': 'summer', '小暑': 'summer', '大暑': 'summer',
    '立秋': 'autumn', '处暑': 'autumn', '白露': 'autumn', '秋分': 'autumn', '寒露': 'autumn', '霜降': 'autumn',
    '立冬': 'winter', '小雪': 'winter', '大雪': 'winter', '冬至': 'winter', '小寒': 'winter', '大寒': 'winter'
  }
  return seasonMap[term] || 'spring'
}

init()

module.exports = {
  GameState,
  transitionTo,
  getCurrentSolarTerm,
  getCurrentSeason
}