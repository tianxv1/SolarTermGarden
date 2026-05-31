// 全局变量共享模块

// 安全获取全局变量
function getGlobal(key, defaultValue = null) {
  if (typeof GameGlobal !== 'undefined' && GameGlobal[key] !== undefined) {
    return GameGlobal[key]
  }
  return defaultValue
}

// 从GameGlobal获取全局变量
function getGlobals() {
  return {
    ctx: getGlobal('ctx'),
    screenWidth: getGlobal('screenWidth', 375),
    screenHeight: getGlobal('screenHeight', 667),
    GameState: getGameState()
  }
}

// 默认GameState配置
const DEFAULT_GAME_STATE = {
  currentScene: 'garden',
  randomEvent: { active: false },
  crowWarning: { active: false },
  menuExpanded: false,
  menuBtnPos: null,
  menuItems: null,
  updateStatus: {},
  gold: 0,
  petals: 0,
  pet: { type: 'cat' },
  selectedPlot: null,
  backBtnPos: { x: 30, y: 30, r: 20 },
  dailyTasks: {
    date: null,
    tasks: [],
    completed: 0
  },
  playerStats: {
    waterCount: 0,
    harvestCount: 0,
    chatCount: 0,
    petCount: 0
  },
  handbookRewards: {},
  pots: {
    unlocked: ['basic'],
    current: 'basic',
    seasonal: {
      spring: 'basic',
      summer: null,
      autumn: null,
      winter: null
    }
  },
  audioSettings: {
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.7,
    musicVolume: 0.5
  },
  currentSeason: 'spring',
  userInfo: null,
  buttons: [],
  selectedSeed: null
}

// 获取GameState（带默认值和同步机制）
function getGameState() {
  // 如果GameGlobal.GameState已存在，直接返回
  if (typeof GameGlobal !== 'undefined' && GameGlobal.GameState !== undefined) {
    return GameGlobal.GameState
  }
  
  // 如果GameGlobal不存在，创建一个临时对象（用于测试或非微信环境）
  if (typeof GameGlobal === 'undefined') {
    return { ...DEFAULT_GAME_STATE }
  }
  
  // 如果GameGlobal存在但GameState未设置，设置默认值并返回
  GameGlobal.GameState = { ...DEFAULT_GAME_STATE }
  return GameGlobal.GameState
}

// 确保GameState的关键属性存在（安全检查）
function ensureGameState() {
  const state = getGameState()
  
  // 确保所有必要的属性都存在
  Object.keys(DEFAULT_GAME_STATE).forEach(key => {
    if (state[key] === undefined) {
      state[key] = DEFAULT_GAME_STATE[key]
    }
  })
  
  return state
}

// 工具函数
function drawRoundRect(ctx, x, y, width, height, radius) {
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

function drawCircle(ctx, x, y, radius, color) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

function drawText(ctx, text, x, y, options = {}) {
  ctx.font = options.font || '14px sans-serif'
  ctx.fillStyle = options.color || '#333333'
  ctx.textAlign = options.align || 'left'
  ctx.textBaseline = options.baseline || 'middle'
  if (options.bold) {
    const fontParts = ctx.font.split(' ')
    const size = fontParts[0]
    ctx.font = 'bold ' + size + ' sans-serif'
  }
  if (options.shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetY = 1
  }
  ctx.fillText(text, x, y)
  if (options.shadow) {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
  }
}

function drawButton(ctx, x, y, width, height, text, bgColor, textColor, radius = 8) {
  ctx.fillStyle = bgColor
  drawRoundRect(ctx, x, y, width, height, radius)
  ctx.fill()
  drawText(ctx, text, x + width / 2, y + height / 2, {
    align: 'center',
    color: textColor,
    font: '14px sans-serif'
  })
}

function drawProgressBar(ctx, x, y, width, height, progress, bgColor, fillColor) {
  ctx.fillStyle = bgColor
  drawRoundRect(ctx, x, y, width, height, height/2)
  ctx.fill()
  if (progress > 0) {
    ctx.fillStyle = fillColor
    const fillWidth = width * (progress / 100)
    drawRoundRect(ctx, x, y, fillWidth, height, height/2)
    ctx.fill()
  }
}

function drawCard(ctx, x, y, width, height, bgColor = '#ffffff', shadow = true) {
  if (shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 4
  }
  ctx.fillStyle = bgColor
  drawRoundRect(ctx, x, y, width, height, 12)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

// 绘制返回按钮
function drawBackButton(ctx) {
  const GameState = getGameState()
  if (!GameState || !GameState.backBtnPos) return
  
  const { x, y, r } = GameState.backBtnPos
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.lineWidth = 1
  ctx.stroke()
  
  ctx.fillStyle = '#666'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('←', x, y)
}

// 绘制左上角菜单按钮
function drawTopMenu(ctx, screenWidth, screenHeight) {
  const GameState = getGameState()
  if (!GameState) return
  
  // 仅在花园主页显示菜单按钮
  if (GameState.currentScene !== 'garden') {
    GameState.menuBtnPos = null
    return
  }
  
  const btnX = 35  // 移到左上角
  const btnY = 205  // 放在顶部信息栏下面
  const btnR = 22

  GameState.menuBtnPos = { x: btnX, y: btnY, r: btnR }

  if (GameState.menuExpanded) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, screenWidth, screenHeight)

    const menuItems = [
      { emoji: '🐱', scene: 'pet', label: '宠物' },
      { emoji: '👥', scene: 'community', label: '社区' },
      { emoji: '🛒', scene: 'seedshop', label: '商店' },
      { emoji: '📖', scene: 'handbook', label: '手账' },
      { emoji: '🐛', scene: 'disease', label: '防治' },
      { emoji: '🏆', scene: 'battle', label: '挑战' },
      { emoji: '👤', scene: 'profile', label: '我的' }
    ]

    GameState.menuItems = []

    const itemHeight = 50
    const itemWidth = 120
    const startY = btnY + btnR + 10
    const itemX = btnX - btnR  // 从左侧向右展开

    menuItems.forEach((item, index) => {
      const itemY = startY + index * (itemHeight + 8)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      drawRoundRect(ctx, itemX, itemY, itemWidth, itemHeight, 12)
      ctx.fill()

      ctx.strokeStyle = 'rgba(201, 48, 90, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.font = '20px sans-serif'
      ctx.fillStyle = '#333'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.emoji, itemX + 15, itemY + itemHeight / 2)

      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#333'
      ctx.fillText(item.label, itemX + 45, itemY + itemHeight / 2)

      // 检查是否需要显示更新小红点
      if (GameState.updateStatus && GameState.updateStatus[item.scene]) {
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc(itemX + itemWidth - 15, itemY + 15, 6, 0, Math.PI * 2)
        ctx.fill()
      }

      GameState.menuItems.push({
        x: itemX + itemWidth / 2,
        y: itemY + itemHeight / 2,
        r: itemHeight / 2,
        scene: item.scene,
        width: itemWidth,
        height: itemHeight
      })
    })

    ctx.fillStyle = '#c9305a'
    ctx.beginPath()
    ctx.arc(btnX, btnY, btnR, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✕', btnX, btnY)
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.beginPath()
    ctx.arc(btnX, btnY, btnR, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#c9305a'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('☰', btnX, btnY)
  }
}

// 底部导航
function drawBottomNav(ctx, screenWidth, screenHeight, activeTab) {
  const navY = screenHeight - 60
  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = -5
  drawRoundRect(ctx, 0, navY, screenWidth, 60, 0)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  ctx.strokeStyle = '#e5e7eb'
  ctx.beginPath()
  ctx.moveTo(0, navY)
  ctx.lineTo(screenWidth, navY)
  ctx.stroke()

  const navItems = [
    { id: 'garden', icon: '\u{1F3E0}', text: '花园' },
    { id: 'pet', icon: '\u{1F431}', text: '宠物' },
    { id: 'community', icon: '\u{1F464}', text: '社区' },
    { id: 'seedshop', icon: '\u{1F3EA}', text: '商店' },
    { id: 'profile', icon: '\u{1F464}', text: '我的' }
  ]

  navItems.forEach((item, i) => {
    const x = screenWidth * (i + 0.5) / navItems.length
    const isActive = item.id === activeTab
    const color = isActive ? '#22c55e' : '#9ca3af'

    drawText(ctx, item.icon, x, navY + 22, { align: 'center', font: '18px sans-serif' })
    drawText(ctx, item.text, x, navY + 42, { align: 'center', font: '10px sans-serif', color })

    if (isActive) {
      ctx.fillStyle = '#22c55e'
      drawRoundRect(ctx, x - 12, navY + 46, 24, 2, 1)
      ctx.fill()
    }
  })
}

module.exports = {
  getGlobals,
  getGlobal,
  getGameState,
  ensureGameState,
  drawRoundRect,
  drawCircle,
  drawText,
  drawButton,
  drawProgressBar,
  drawCard,
  drawBackButton,
  drawTopMenu,
  drawBottomNav,
  distance
}
