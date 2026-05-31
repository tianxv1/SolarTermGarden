// 节气花园 - 花园主页模块

const { drawRoundRect, drawCircle, drawText, drawProgressBar, drawBackButton, drawTopMenu, distance, getGameState, getGlobal } = require('./globals')
const { getTodayTasks, getTaskProgress, closeRandomEvent, recordPlayerAction } = require('./dailyTasks')
const AudioManager = require('./audioManager')
const ImageLoader = require('./imageLoader')
const GardenData = require('./gardenData')

// 动态获取全局变量（不在模块加载时获取，避免时机问题）
function getCtx() {
  return getGlobal('ctx')
}

function getScreenWidth() {
  return getGlobal('screenWidth', 375)
}

function getScreenHeight() {
  return getGlobal('screenHeight', 667)
}

// 花园世界层说明：
// - CameraState 只保存“视口偏移”，不承载作物、宠物、任务等业务状态。
// - 后续如果要新增用地、建筑、活动区或其它花园模块，只要把新内容挂到 GARDEN_WORLD 里，
//   并继续使用 projectGardenWorld() 映射到屏幕即可。
// - 这样相机、地图和业务数据是分离的，后续扩展时不需要重写触摸逻辑。
const GARDEN_WORLD = {
  width: 1680,
  height: 1260,
  background: {
    x: 100,
    y: 20,
    w: 930,
    h: 1080
  },
  modules: [
    {
      id: 'seedshop',
      label: '种子商店',
      icon: '🛒',
      hint: '可继续扩展更多季节种子',
      accent: '#f59e0b',
      x: 1035,
      y: 110,
      w: 250,
      h: 150
    },
    {
      id: 'pet',
      label: '宠物屋',
      icon: '🐱',
      hint: '后续可接入更多宠物互动',
      accent: '#c9305a',
      x: 1035,
      y: 320,
      w: 250,
      h: 150
    },
    {
      id: 'community',
      label: '花园社区',
      icon: '💬',
      hint: '可继续增加帖子、话题和活动',
      accent: '#2563eb',
      x: 150,
      y: 790,
      w: 260,
      h: 150
    },
    {
      id: 'handbook',
      label: '节气手账',
      icon: '📖',
      hint: '知识图鉴可继续扩容',
      accent: '#8b5cf6',
      x: 450,
      y: 790,
      w: 260,
      h: 150
    },
    {
      id: 'battle',
      label: '竞技擂台',
      icon: '🏆',
      hint: '后续可接入新的小游戏模式',
      accent: '#22c55e',
      x: 780,
      y: 790,
      w: 260,
      h: 150
    },
    {
      id: 'reserve',
      label: '预留用地',
      icon: '🧩',
      hint: '新增地块、装饰区、活动区都可放在这里',
      accent: '#94a3b8',
      x: 1080,
      y: 760,
      w: 330,
      h: 220
    }
  ]
}

// 地图配置常量
const MAP_CONFIG = {
  SIZE: 5,
  PLOT_SIZE: 120,
  GAP: 15,
  PLOT_GAP: 20,
  get PLOT_DISPLAY_SIZE() { return this.PLOT_SIZE - this.PLOT_GAP },
  get TOTAL_SIZE() { return this.SIZE * (this.PLOT_SIZE + this.GAP) - this.GAP }
}

// 等轴测配置
const ISO_CONFIG = {
  k: 0.866,
  k2: 0.5,
  scale: 1.0,
  
  worldToScreen(worldX, worldY, offsetX, offsetY) {
    const screenX = (worldX - worldY) * this.k * this.scale - offsetX
    const screenY = (worldX + worldY) * this.k2 * this.scale - offsetY
    return { x: screenX, y: screenY }
  },
  
  screenToWorld(screenX, screenY, offsetX, offsetY) {
    const projX = screenX + offsetX
    const projY = screenY + offsetY
    const sum = projY / (this.k2 * this.scale)
    const diff = projX / (this.k * this.scale)
    const worldX = (sum + diff) / 2
    const worldY = (sum - diff) / 2
    return { worldX, worldY }
  },
  
  getWorldPos(row, col) {
    const spacing = MAP_CONFIG.PLOT_SIZE + MAP_CONFIG.GAP
    return {
      x: col * spacing + MAP_CONFIG.PLOT_SIZE / 2,
      y: row * spacing + MAP_CONFIG.PLOT_SIZE / 2
    }
  }
}

// 摄像机状态
const CameraState = {
  offsetX: 0,
  offsetY: 0,
  viewportWidth: 0,
  viewportHeight: 0,
  worldWidth: 0,
  worldHeight: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragStartOffsetX: 0,
  dragStartOffsetY: 0,
  moved: false,
  dragThreshold: 6,
  
  initBounds(screenWidth, screenHeight, worldSize = {}) {
    this.viewportWidth = screenWidth
    this.viewportHeight = screenHeight
    this.worldWidth = worldSize.width || Math.max(screenWidth * 2.2, GARDEN_WORLD.width)
    this.worldHeight = worldSize.height || Math.max(screenHeight * 1.6, GARDEN_WORLD.height)
    this.offsetX = Math.max(0, (this.worldWidth - this.viewportWidth) / 2)
    this.offsetY = Math.max(0, (this.worldHeight - this.viewportHeight) / 2)
    this.clampOffset()
  },
  
  setViewport(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth
    this.viewportHeight = viewportHeight
    this.clampOffset()
  },
  
  clampOffset() {
    const maxOffsetX = Math.max(0, this.worldWidth - this.viewportWidth)
    const maxOffsetY = Math.max(0, this.worldHeight - this.viewportHeight)
    this.offsetX = Math.max(0, Math.min(this.offsetX, maxOffsetX))
    this.offsetY = Math.max(0, Math.min(this.offsetY, maxOffsetY))
  },
  
  beginDrag(x, y) {
    this.isDragging = true
    this.dragStartX = x
    this.dragStartY = y
    this.dragStartOffsetX = this.offsetX
    this.dragStartOffsetY = this.offsetY
    this.moved = false
  },
  
  updateDrag(x, y) {
    if (!this.isDragging) return false
    
    const deltaX = x - this.dragStartX
    const deltaY = y - this.dragStartY
    const distanceMoved = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (!this.moved && distanceMoved < this.dragThreshold) {
      return false
    }
    
    this.moved = true
    this.offsetX = this.dragStartOffsetX - deltaX
    this.offsetY = this.dragStartOffsetY - deltaY
    this.clampOffset()
    return true
  },
  
  endDrag() {
    const moved = this.moved
    this.isDragging = false
    this.moved = false
    return moved
  }
}

function projectGardenWorld(worldX, worldY, mapStartY, parallax = 1) {
  return {
    x: worldX - CameraState.offsetX * parallax,
    y: mapStartY + worldY - CameraState.offsetY * parallax
  }
}

function drawGardenModuleCard(ctx, module, mapStartY, parallax = 1) {
  const pos = projectGardenWorld(module.x, module.y, mapStartY, parallax)
  const cardWidth = module.w
  const cardHeight = module.h

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.10)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 5
  drawRoundRect(ctx, pos.x, pos.y, cardWidth, cardHeight, 18)
  ctx.fill()

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  ctx.strokeStyle = `${module.accent}44`
  ctx.lineWidth = 1.5
  ctx.stroke()

  drawCircle(ctx, pos.x + 38, pos.y + 38, 24, module.accent)
  drawText(ctx, module.icon, pos.x + 38, pos.y + 39, {
    align: 'center',
    font: '20px sans-serif',
    color: '#ffffff'
  })

  drawText(ctx, module.label, pos.x + 74, pos.y + 30, {
    font: 'bold 15px sans-serif',
    color: '#333'
  })

  drawText(ctx, module.hint, pos.x + 74, pos.y + 54, {
    font: '11px sans-serif',
    color: '#6b7280'
  })

  ctx.fillStyle = `${module.accent}16`
  drawRoundRect(ctx, pos.x + 18, pos.y + cardHeight - 34, cardWidth - 36, 18, 9)
  ctx.fill()
  drawText(ctx, '可扩展', pos.x + cardWidth - 30, pos.y + cardHeight - 25, {
    align: 'right',
    font: '10px sans-serif',
    color: module.accent
  })
  ctx.restore()
}

function renderGardenWorld(ctx, screenWidth, mapStartY, mapVisibleHeight) {
  const bg = ImageLoader.getImage('images/background.png')

  // 背景图作为“世界底图”绘制，摄像机拖拽时会带来轻微视差，增强可移动视角的感觉。
  const bgScale = 1.12
  const bgWidth = Math.max(screenWidth * bgScale, GARDEN_WORLD.background.w)
  const bgHeight = Math.max(mapVisibleHeight * bgScale, GARDEN_WORLD.background.h)
  const bgPos = projectGardenWorld(GARDEN_WORLD.background.x, GARDEN_WORLD.background.y, mapStartY, 0.22)
  const bgX = bgPos.x - (bgWidth - GARDEN_WORLD.background.w) / 2
  const bgY = bgPos.y - (bgHeight - GARDEN_WORLD.background.h) / 2

  if (bg) {
    ctx.globalAlpha = 0.96
    ctx.drawImage(bg, bgX, bgY, bgWidth, bgHeight)
    ctx.globalAlpha = 1
  } else {
    ctx.fillStyle = '#e7f5e9'
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight)
  }

  // 用一层轻薄雾气把移动中的世界层和静态 UI 过渡得更自然。
  const mist = ctx.createLinearGradient(0, mapStartY, 0, mapStartY + mapVisibleHeight)
  mist.addColorStop(0, 'rgba(255,255,255,0.18)')
  mist.addColorStop(0.5, 'rgba(255,255,255,0.08)')
  mist.addColorStop(1, 'rgba(255,255,255,0.22)')
  ctx.fillStyle = mist
  ctx.fillRect(0, mapStartY, screenWidth, mapVisibleHeight)

  // 未来扩展说明卡：让后续开发者清楚这里是可继续加模块的位置。
  const guidePos = projectGardenWorld(40, 25, mapStartY, 1)
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.shadowColor = 'rgba(0,0,0,0.08)'
  ctx.shadowBlur = 10
  drawRoundRect(ctx, guidePos.x, guidePos.y, 260, 52, 16)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  drawText(ctx, '拖动花园可移动视角', guidePos.x + 18, guidePos.y + 18, {
    font: 'bold 13px sans-serif',
    color: '#1f2937'
  })
  drawText(ctx, '后续可在 world 坐标里继续添加用地和模块', guidePos.x + 18, guidePos.y + 35, {
    font: '11px sans-serif',
    color: '#6b7280'
  })

  // 花园主背景模块与扩展模块统一按世界坐标绘制，后续新增功能只需要往 GARDEN_WORLD.modules 追加数据。
  GARDEN_WORLD.modules.forEach(module => drawGardenModuleCard(ctx, module, mapStartY))

  // 在世界层上做一个柔和的边界提示，避免用户误以为地图已经到头。
  const borderPos = projectGardenWorld(60, 980, mapStartY, 1)
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  drawRoundRect(ctx, borderPos.x, borderPos.y, 520, 52, 18)
  ctx.fill()
  drawText(ctx, '这里是预留扩展区：可以新增用地、节气场景、活动模块或更多小游戏入口', borderPos.x + 18, borderPos.y + 21, {
    font: '12px sans-serif',
    color: '#374151'
  })
  drawText(ctx, '提示：CameraState 只负责视口偏移，不要在这里写业务逻辑。', borderPos.x + 18, borderPos.y + 38, {
    font: '11px sans-serif',
    color: '#6b7280'
  })
}

// GardenData 已从 gardenData.js 导入

function drawCrowWarning(ctx, screenWidth, screenHeight) {
  const GameState = getGameState()
  if (!GameState || !GameState.crowWarning || !GameState.crowWarning.active) return
  
  const x = screenWidth - 70
  const y = 100
  const time = Date.now() - GameState.crowWarning.warningTime
  
  const floatY = Math.sin(time / 200) * 5
  
  const alpha = 0.3 + Math.sin(time / 150) * 0.2
  ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`
  ctx.beginPath()
  ctx.arc(x, y + floatY, 35, 0, Math.PI * 2)
  ctx.fill()
  
  // 使用乌鸦图片
  ImageLoader.loadImage('images/crow.png', (img) => {
    if (img) {
      const imgSize = 32
      ctx.drawImage(img, x - imgSize / 2, y + floatY - imgSize / 2, imgSize, imgSize)
    } else {
      // 图片加载失败时使用emoji作为备选
      ctx.font = '32px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('\u{1F426}', x, y + floatY)
    }
  })
  
  ctx.font = 'bold 20px sans-serif'
  ctx.fillStyle = '#dc2626'
  ctx.fillText('!', x + 15, y + floatY - 15)
  
  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#333'
  ctx.fillText('乌鸦来袭!', x, y + floatY + 30)
  
  if (!GameState.crowWarning) GameState.crowWarning = {}
  GameState.crowWarning.hitArea = { x, y: y + floatY, r: 40 }
}

function drawRandomEventModal(ctx, screenWidth, screenHeight) {
  const GameState = getGameState()
  if (!GameState || !GameState.randomEvent || !GameState.randomEvent.active) return
  
  const event = GameState.randomEvent
  const modalWidth = 280
  const modalHeight = 200
  const modalX = (screenWidth - modalWidth) / 2
  const modalY = (screenHeight - modalHeight) / 2
  
  // 半透明遮罩
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, screenWidth, screenHeight)
  
  // 弹窗背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  drawRoundRect(ctx, modalX, modalY, modalWidth, modalHeight, 16)
  ctx.fill()
  
  // 事件图标
  const iconY = modalY + 50
  const iconFloatY = Math.sin(Date.now() / 300) * 3
  drawCircle(ctx, modalX + modalWidth / 2, iconY + iconFloatY, 35, '#fef3c7')
  drawText(ctx, event.icon, modalX + modalWidth / 2, iconY + iconFloatY, { align: 'center', font: '32px sans-serif' })
  
  // 事件标题
  drawText(ctx, event.title, modalX + modalWidth / 2, modalY + 100, { align: 'center', font: 'bold 18px sans-serif', color: '#333' })
  
  // 事件描述
  const words = event.description.split('')
  let line = ''
  let lineY = modalY + 130
  const maxWidth = modalWidth - 40
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && i > 0) {
      drawText(ctx, line, modalX + modalWidth / 2, lineY, { align: 'center', font: '12px sans-serif', color: '#666' })
      line = words[i]
      lineY += 20
    } else {
      line = testLine
    }
  }
  drawText(ctx, line, modalX + modalWidth / 2, lineY, { align: 'center', font: '12px sans-serif', color: '#666' })
  
  // 奖励信息
  if (event.reward > 0) {
    drawText(ctx, `获得${event.reward}金币！`, modalX + modalWidth / 2, modalY + 170, { align: 'center', font: 'bold 14px sans-serif', color: '#f97316' })
  }
  
  // 关闭按钮
  const closeBtnX = modalX + modalWidth - 30
  const closeBtnY = modalY + 20
  drawCircle(ctx, closeBtnX, closeBtnY, 12, '#f3f4f6')
  drawText(ctx, '×', closeBtnX, closeBtnY, { align: 'center', font: 'bold 16px sans-serif', color: '#666' })
  
  // 存储关闭按钮位置
  if (!GameState.randomEvent) GameState.randomEvent = {}
  GameState.randomEvent.closeBtn = { x: closeBtnX, y: closeBtnY, r: 15 }
}

function showTaskModal() {
  const tasks = getTodayTasks()
  let taskList = '今日任务：\n\n'
  
  tasks.forEach((task, index) => {
    const status = task.completed ? '✅' : '⬜'
    taskList += `${status} ${task.icon} ${task.description} (${task.progress}/${task.target})\n`
    if (!task.completed && task.progress > 0) {
      taskList += `   进度：${Math.floor(task.progress / task.target * 100)}%\n`
    }
    taskList += `   奖励：${task.reward}金币\n\n`
  })
  
  const progress = getTaskProgress()
  taskList += `完成进度：${progress.completed}/${progress.total}`
  
  wx.showModal({
    title: '每日任务',
    content: taskList,
    showCancel: false,
    confirmText: '知道了'
  })
}

function handleCrowDefense() {
  const GameState = getGameState()
  wx.showModal({
    title: '乌鸦来袭！',
    content: '乌鸦正在觊觎你的作物，是否观看广告驱赶乌鸦？',
    confirmText: '驱赶乌鸦',
    cancelText: '暂时不管',
    success: (res) => {
      if (res.confirm) {
        wx.showLoading({ title: '播放广告中...' })
        setTimeout(() => {
          wx.hideLoading()
          hideCrowWarning()
          wx.showToast({ title: '成功驱赶乌鸦！', icon: 'success' })
          GameState.gold = (GameState.gold || 0) + 10
        }, 1500)
      }
    }
  })
}

function showCrowWarning(targetRow, targetCol) {
  const GameState = getGameState()
  if (!GameState.crowWarning) GameState.crowWarning = {}
  GameState.crowWarning.active = true
  GameState.crowWarning.targetRow = targetRow
  GameState.crowWarning.targetCol = targetCol
  GameState.crowWarning.warningTime = Date.now()
  
  // 播放乌鸦音效
  AudioManager.playCrow()
  
  if (GameState.crowWarning.timeout) {
    clearTimeout(GameState.crowWarning.timeout)
  }
  
  GameState.crowWarning.timeout = setTimeout(() => {
    const state = getGameState()
    if (state.crowWarning && state.crowWarning.active) {
      const plot = GardenData.plots[targetRow][targetCol]
      if (plot && plot.plant) {
        plot.plant = null
        plot.stage = 'empty'
        plot.progress = 0
        wx.showToast({ title: '乌鸦偷走了作物！', icon: 'none' })
      }
      hideCrowWarning()
    }
  }, 10000)
}

function hideCrowWarning() {
  const GameState = getGameState()
  if (!GameState.crowWarning) GameState.crowWarning = {}
  GameState.crowWarning.active = false
  GameState.crowWarning.targetRow = -1
  GameState.crowWarning.targetCol = -1
  if (GameState.crowWarning.timeout) {
    clearTimeout(GameState.crowWarning.timeout)
    GameState.crowWarning.timeout = null
  }
}

/**
   * 渲染花园主页面
   * 负责绘制花园页面的所有元素，包括背景、顶部信息栏、植物地块、操作按钮等
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} screenWidth - 屏幕宽度
   * @param {number} screenHeight - 屏幕高度
   */
function renderGardenPage(ctx, screenWidth, screenHeight) {
  // 地图区域起始Y坐标（顶部信息栏下方）
  const mapStartY = 175
  // 地图可见区域高度（减去顶部信息栏、底部操作栏和底部导航栏）
  const mapVisibleHeight = screenHeight - 175 - 165 - 60
  
  // 1. 先绘制底层背景
  const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight)
  bgGradient.addColorStop(0, '#f0fdf4')
  bgGradient.addColorStop(0.3, '#dcfce7')
  bgGradient.addColorStop(1, '#bbf7d0')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  const watercolor1 = ctx.createRadialGradient(screenWidth * 0.3, screenHeight * 0.2, 0, screenWidth * 0.3, screenHeight * 0.2, screenWidth * 0.5)
  watercolor1.addColorStop(0, 'rgba(134, 239, 172, 0.3)')
  watercolor1.addColorStop(1, 'transparent')
  ctx.fillStyle = watercolor1
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  // 2. 绘制地图区域背景图片（在顶部信息栏下方）
  // ImageLoader 已在模块顶部导入，此处无需重复导入
  
  // 立即尝试加载背景图片
  const img = ImageLoader.getImage('images/background.png')
  if (img) {
    ctx.drawImage(img, 0, mapStartY, screenWidth, mapVisibleHeight)
  } else {
    // 使用纯色背景作为占位符，加载更快
    ctx.fillStyle = '#dcfce7'
    ctx.fillRect(0, mapStartY, screenWidth, mapVisibleHeight)
    
    // 异步加载背景图片，加载完成后重新渲染
    ImageLoader.loadImage('images/background.png', () => {
      console.log('背景图片加载完成')
      // 图片加载完成后，在下一帧渲染时会显示
    })
  }

  // 3. 绘制顶部信息栏（在背景之上）
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  drawRoundRect(ctx, 15, 55, screenWidth - 30, 110, 16)
  ctx.fill()

  drawCircle(ctx, 40, 85, 20, '#fce7eb')
  drawText(ctx, '\u{1F331}', 40, 85, { align: 'center', font: '20px sans-serif' })
  drawText(ctx, '立春 2月4日', 70, 80, { font: 'bold 14px sans-serif', color: '#333' })
  drawText(ctx, '黄经315°', 70, 98, { font: '11px sans-serif', color: '#666' })

  // 显示金币数量（橙色）和花瓣数量（蓝色）
  drawText(ctx, '\u{1F4B0} 1,280', screenWidth - 20, 80, { align: 'right', font: '13px sans-serif', color: '#b45309' })
  drawText(ctx, '\u{1F48E} 56', screenWidth - 20, 98, { align: 'right', font: '13px sans-serif', color: '#2563eb' })

  // 绘制宠物头像（渐变色圆形背景）
  const petGradient = ctx.createLinearGradient(45 - 22, 135 - 22, 45 + 22, 135 + 22)
  petGradient.addColorStop(0, '#fdba74')
  petGradient.addColorStop(1, '#fb923c')
  drawCircle(ctx, 45, 135, 22, petGradient)
  drawText(ctx, '\u{1F431}', 45, 135, { align: 'center', font: '24px sans-serif' })
  drawCircle(ctx, 62, 150, 8, '#22c55e')
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(62, 150, 8, 0, Math.PI * 2)
  ctx.stroke()

  drawText(ctx, '我的伙伴', 85, 128, { font: '10px sans-serif', color: '#666' })
  drawText(ctx, '小橘', 85, 145, { font: 'bold 13px sans-serif', color: '#333' })

  drawCircle(ctx, screenWidth - 85, 135, 18, '#dcfce7')
  drawText(ctx, '\u{1F4AC}', screenWidth - 85, 135, { align: 'center', font: '16px sans-serif' })

  drawCircle(ctx, screenWidth - 45, 135, 18, '#fee2e2')
  drawText(ctx, '\u{1F41B}', screenWidth - 45, 135, { align: 'center', font: '16px sans-serif' })

  // 任务按钮
  const taskProgress = getTaskProgress()
  drawCircle(ctx, screenWidth - 125, 135, 18, '#fef3c7')
  drawText(ctx, '\u{1F4CB}', screenWidth - 125, 135, { align: 'center', font: '16px sans-serif' })
  drawCircle(ctx, screenWidth - 108, 125, 10, '#ef4444')
  drawText(ctx, `${taskProgress.completed}/${taskProgress.total}`, screenWidth - 108, 125, { align: 'center', font: '9px sans-serif', color: '#fff' })

  // 随机事件弹窗（在最上层）
  const GameState = getGameState()
  if (GameState.randomEvent && GameState.randomEvent.active) {
    drawRandomEventModal(ctx, screenWidth, screenHeight)
  }

  // 植物绘制逻辑已删除 - 使用外部图片导入逻辑链替代
  
  // 绘制花瓣和脚印效果
  GardenData.updatePetals()
  GardenData.updateFootprints()
  GardenData.drawPetals(ctx)
  GardenData.drawFootprints(ctx)

  // 绘制宠物
  const petScreenX = screenWidth * 0.5
  const petScreenY = mapStartY + 150
  
  const petImageMap = {
    cat: 'images/pet_cat.png',
    dog: 'images/pet_dog.png',
    owl: 'images/pet_owl.png'
  }
  const petType = (GameState.pet && GameState.pet.type) || 'cat'
  const imagePath = petImageMap[petType] || 'images/pet_cat.png'
  
  ImageLoader.loadImage(imagePath, (img) => {
    if (img) {
      const petSize = 40
      ctx.drawImage(img, petScreenX - petSize / 2, petScreenY - petSize / 2, petSize, petSize)
    }
  })

  // ========== 绘制底部操作栏 ==========
  // 操作栏Y坐标（向上偏移30像素，避免遮挡内容）
  const actionBarY = screenHeight - 195
  // 绘制操作栏背景（半透明白色圆角矩形）
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  drawRoundRect(ctx, 15, actionBarY, screenWidth - 30, 75, 18)
  ctx.fill()

  // 操作按钮配置数组
  const actions = [
    { icon: '\u{1F331}', text: '种植', color: '#fce7eb', x: screenWidth * 0.15, image: 'images/btn_plant.png' },
    { icon: '\u{1F4A7}', text: '浇水', color: '#dbeafe', x: screenWidth * 0.38, image: 'images/btn_water.png' },
    { icon: '\u{2728}', text: '施肥', color: '#fef3c7', x: screenWidth * 0.62, image: 'images/btn_fertilize.png' },
    { icon: '\u{1F4D6}', text: '图鉴', color: '#f3e8ff', x: screenWidth * 0.85, image: 'images/btn_handbook.png' }
  ]

  actions.forEach(action => {
    drawCircle(ctx, action.x, actionBarY + 28, 24, action.color)
    
    // 使用真实图片
    ImageLoader.loadImage(action.image, (img) => {
      if (img) {
        const imgSize = 20
        ctx.drawImage(img, action.x - imgSize / 2, actionBarY + 28 - imgSize / 2, imgSize, imgSize)
      } else {
        // 图片加载失败时使用emoji作为备选
        drawText(ctx, action.icon, action.x, actionBarY + 28, { align: 'center', font: '20px sans-serif' })
      }
    })
    
    drawText(ctx, action.text, action.x, actionBarY + 62, { align: 'center', font: '11px sans-serif', color: '#333' })
  })

  const fabX = screenWidth - 70
  const fabY = screenHeight - 280
  const fabGradient = ctx.createLinearGradient(fabX, fabY, fabX + 56, fabY + 56)
  fabGradient.addColorStop(0, '#fb923c')
  fabGradient.addColorStop(1, '#ef4444')

  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 4
  drawCircle(ctx, fabX + 28, fabY + 28, 28, fabGradient)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // 使用挑战赛按钮图片
  ImageLoader.loadImage('images/btn_battle.png', (img) => {
    if (img) {
      const imgSize = 28
      ctx.drawImage(img, fabX + 28 - imgSize / 2, fabY + 28 - imgSize / 2, imgSize, imgSize)
    } else {
      // 图片加载失败时使用emoji作为备选
      drawText(ctx, '\u{1F3C6}', fabX + 28, fabY + 28, { align: 'center', font: '24px sans-serif' })
    }
  })



  drawCrowWarning(ctx, screenWidth, screenHeight)
  
  // 绘制左上角菜单按钮（在最上层）
  drawTopMenu(ctx, screenWidth, screenHeight)
}

/**
   * 处理花园页面的触摸事件
   * @param {number} x - 触摸点的X坐标
   * @param {number} y - 触摸点的Y坐标
   * @param {function} render - 渲染函数，用于触发重新渲染
   */
function handleGardenPageTouch(x, y, render) {
  // 获取全局变量（使用安全获取方式）
  const GameState = getGameState()
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  
  if (!GameState) return
  
  if (x >= 25 && x <= 75 && y >= 110 && y <= 160) {
    GameState.currentScene = 'pet'
    render()
    return
  }

  const chatBtnX = screenWidth - 103
  const chatBtnY = 117
  if (x >= chatBtnX && x <= chatBtnX + 36 && y >= chatBtnY && y <= chatBtnY + 36) {
    GameState.currentScene = 'pet'
    render()
    return
  }

  const diseaseBtnX = screenWidth - 63
  const diseaseBtnY = 117
  if (x >= diseaseBtnX && x <= diseaseBtnX + 36 && y >= diseaseBtnY && y <= diseaseBtnY + 36) {
    GameState.currentScene = 'disease'
    render()
    return
  }

  // 任务按钮
  const taskBtnX = screenWidth - 143
  const taskBtnY = 117
  if (x >= taskBtnX && x <= taskBtnX + 36 && y >= taskBtnY && y <= taskBtnY + 36) {
    showTaskModal()
    return
  }

  // 随机事件弹窗关闭按钮
  if (GameState.randomEvent && GameState.randomEvent.active && GameState.randomEvent.closeBtn) {
    const closeBtn = GameState.randomEvent.closeBtn
    if (distance(x, y, closeBtn.x, closeBtn.y) <= closeBtn.r) {
      closeRandomEvent()
      return
    }
  }

  const fabX = screenWidth - 70
  const fabY = screenHeight - 280
  if (x >= fabX && x <= fabX + 56 && y >= fabY && y <= fabY + 56) {
    const battle = require('./battle')
    battle.initGame('garden')
    GameState.currentScene = 'battle'
    render()
    return
  }
  
  const actionBarY = screenHeight - 195
  
  const actionButtons = [
    { 
      x: screenWidth * 0.15, 
      y: actionBarY + 28, 
      radius: 45,
      label: '种植',
      action: () => {
        GameState.currentScene = 'seedshop'
        render()
      }
    },
    { 
      x: screenWidth * 0.38, 
      y: actionBarY + 28, 
      radius: 45,
      label: '浇水',
      action: () => {
        recordPlayerAction('water')
        AudioManager.playWater()
        wx.showToast({ title: '浇水成功！生长+10%', icon: 'success' })
      }
    },
    { 
      x: screenWidth * 0.62, 
      y: actionBarY + 28, 
      radius: 45,
      label: '施肥',
      action: () => {
        recordPlayerAction('fertilize')
        AudioManager.playMagic()
        wx.showToast({ title: '施肥成功！生长+20%', icon: 'success' })
      }
    },
    { 
      x: screenWidth * 0.85, 
      y: actionBarY + 28, 
      radius: 45,
      label: '图鉴',
      action: () => {
        GameState.currentScene = 'handbook'
        render()
      }
    }
  ]
  
  for (const btn of actionButtons) {
    if (distance(x, y, btn.x, btn.y) <= btn.radius) {
      btn.action()
      return
    }
    if (distance(x, y, btn.x, btn.y + 34) <= 25) {
      btn.action()
      return
    }
  }

  // 地块触摸处理已删除 - 使用外部逻辑链替代

  if (GameState.crowWarning && GameState.crowWarning.active && GameState.crowWarning.hitArea) {
    const hitArea = GameState.crowWarning.hitArea
    if (distance(x, y, hitArea.x, hitArea.y) <= hitArea.r) {
      handleCrowDefense()
      return
    }
  }

  // 底部导航栏触摸处理
  const navY = screenHeight - 60
  if (y >= navY && y <= screenHeight) {
    const navItems = ['garden', 'pet', 'community', 'seedshop', 'profile']
    const itemWidth = screenWidth / navItems.length
    const clickedIndex = Math.floor(x / itemWidth)
    if (clickedIndex >= 0 && clickedIndex < navItems.length) {
      const targetScene = navItems[clickedIndex]
      if (targetScene !== 'garden') {
        GameState.currentScene = targetScene
        render()
      }
    }
  }

}

module.exports = {
  MAP_CONFIG,
  ISO_CONFIG,
  CameraState,
  GardenData,
  renderGardenPage,
  handleGardenPageTouch,
  showCrowWarning,
  hideCrowWarning
}
