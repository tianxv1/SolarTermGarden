// 节气花园 - 启动页模块

const { drawRoundRect, drawCircle, drawText, getGameState, getGlobal } = require('./globals')

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

// 启动页状态
const SplashState = {
  progress: 0,
  loadingText: '正在播种...',
  loadingTexts: ['正在播种...', '正在浇水...', '正在施肥...', '即将绽放...'],
  textIndex: 0,
  animationId: null,
  petals: [],
  startTime: Date.now(),
  isFinished: false
}

// 节气数据
const SolarTermsData = [
  { name: '立春', date: '2月4日', icon: '🌱' },
  { name: '雨水', date: '2月19日', icon: '🌧️' },
  { name: '惊蛰', date: '3月6日', icon: '🐛' },
  { name: '春分', date: '3月21日', icon: '⚖️' },
  { name: '清明', date: '4月5日', icon: '🌸' },
  { name: '谷雨', date: '4月20日', icon: '🌧️' },
  { name: '立夏', date: '5月6日', icon: '🌞' },
  { name: '小满', date: '5月21日', icon: '🌾' },
  { name: '芒种', date: '6月6日', icon: '🌾' },
  { name: '夏至', date: '6月22日', icon: '☀️' },
  { name: '小暑', date: '7月7日', icon: '🔥' },
  { name: '大暑', date: '7月23日', icon: '🔥' },
  { name: '立秋', date: '8月8日', icon: '🍂' },
  { name: '处暑', date: '8月23日', icon: '🌬️' },
  { name: '白露', date: '9月8日', icon: '💧' },
  { name: '秋分', date: '9月23日', icon: '🍁' },
  { name: '寒露', date: '10月8日', icon: '🍂' },
  { name: '霜降', date: '10月24日', icon: '❄️' },
  { name: '立冬', date: '11月8日', icon: '🍂' },
  { name: '小雪', date: '11月22日', icon: '❄️' },
  { name: '大雪', date: '12月7日', icon: '❄️' },
  { name: '冬至', date: '12月22日', icon: '☃️' },
  { name: '小寒', date: '1月6日', icon: '❄️' },
  { name: '大寒', date: '1月20日', icon: '❄️' }
]

// 获取当前节气
function getCurrentSolarTerm() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  
  // 简化的节气判断
  const termIndex = Math.floor((month * 30 + day) / 30.42) % 24
  return SolarTermsData[termIndex]
}

// 初始化启动页
function initSplash() {
  SplashState.progress = 0
  SplashState.textIndex = 0
  SplashState.loadingText = SplashState.loadingTexts[0]
  SplashState.petals = []
  SplashState.startTime = Date.now()
  SplashState.isFinished = false
  
  // 获取屏幕尺寸
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  
  // 生成花瓣
  for (let i = 0; i < 20; i++) {
    SplashState.petals.push({
      x: Math.random() * screenWidth,
      y: Math.random() * screenHeight,
      size: Math.random() * 20 + 10,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.3 - 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.5 + 0.3,
      color: ['#ffc0cb', '#ffb6c1', '#ffcba4', '#ffe4e1'][Math.floor(Math.random() * 4)]
    })
  }
}

// 渲染启动页
function renderSplash() {
  // 动态获取全局变量
  const ctx = getCtx()
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, screenWidth, screenHeight)
  
  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, screenHeight)
  gradient.addColorStop(0, '#c9305a')
  gradient.addColorStop(0.5, '#ec4899')
  gradient.addColorStop(1, '#f472b6')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, screenWidth, screenHeight)
  
  // 更新和绘制花瓣
  SplashState.petals.forEach(petal => {
    petal.x += petal.speedX
    petal.y += petal.speedY
    petal.rotation += petal.rotationSpeed
    
    if (petal.x < -petal.size) petal.x = screenWidth + petal.size
    if (petal.x > screenWidth + petal.size) petal.x = -petal.size
    if (petal.y < -petal.size) petal.y = screenHeight + petal.size
    if (petal.y > screenHeight + petal.size) petal.y = -petal.size
    
    ctx.save()
    ctx.translate(petal.x, petal.y)
    ctx.rotate(petal.rotation)
    ctx.globalAlpha = petal.alpha
    
    // 绘制花瓣形状
    ctx.fillStyle = petal.color
    ctx.beginPath()
    ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
  })
  
  // 绘制主标题区域
  const titleY = screenHeight * 0.35
  
  // 绘制花朵装饰
  ctx.font = '64px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🌸', screenWidth / 2, titleY - 40)
  
  // 绘制标题
  ctx.font = 'bold 32px sans-serif'
  ctx.fillStyle = '#fff'
  ctx.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)'
  ctx.fillText('节气花园', screenWidth / 2, titleY + 20)
  
  ctx.font = '16px sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.3)'
  ctx.fillText('二十四节气主题养成游戏', screenWidth / 2, titleY + 55)
  
  // 绘制当前节气
  const currentTerm = getCurrentSolarTerm()
  if (currentTerm) {
    const termX = screenWidth / 2
    const termY = titleY + 100
    
    ctx.font = '14px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText(`今日 ${currentTerm.date}`, termX, termY)
    
    ctx.font = '24px sans-serif'
    ctx.fillStyle = '#fff'
    ctx.fillText(`${currentTerm.icon} ${currentTerm.name}`, termX, termY + 30)
  }
  
  // 绘制加载进度条区域
  const progressY = screenHeight * 0.75
  
  // 进度条背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  drawRoundRect(ctx, screenWidth * 0.15, progressY, screenWidth * 0.7, 8, 4)
  ctx.fill()
  
  // 进度条
  ctx.fillStyle = '#fff'
  drawRoundRect(ctx, screenWidth * 0.15, progressY, screenWidth * 0.7 * (SplashState.progress / 100), 8, 4)
  ctx.fill()
  
  // 加载文字
  ctx.font = '14px sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.textAlign = 'center'
  ctx.fillText(SplashState.loadingText, screenWidth / 2, progressY + 30)
  
  // 进度数字
  ctx.font = 'bold 14px sans-serif'
  ctx.fillStyle = '#fff'
  ctx.fillText(`${Math.floor(SplashState.progress)}%`, screenWidth / 2, progressY - 25)
  
  // 绘制底部装饰渐变
  const bottomGradient = ctx.createLinearGradient(0, screenHeight - 80, 0, screenHeight)
  bottomGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
  bottomGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)')
  ctx.fillStyle = bottomGradient
  ctx.fillRect(0, screenHeight - 80, screenWidth, 80)
  
  // 自动更新进度
  const elapsed = Date.now() - SplashState.startTime
  const targetProgress = Math.min(elapsed / 3000 * 100, 100)
  
  if (SplashState.progress < targetProgress) {
    SplashState.progress += (targetProgress - SplashState.progress) * 0.05
    
    // 切换加载文字
    const textIndex = Math.min(Math.floor(SplashState.progress / 25), SplashState.loadingTexts.length - 1)
    if (textIndex !== SplashState.textIndex) {
      SplashState.textIndex = textIndex
      SplashState.loadingText = SplashState.loadingTexts[textIndex]
    }
  }
  
  // 更新进度和切换场景
  const GameState = getGameState()
  if (SplashState.progress >= 100 && !SplashState.isFinished) {
    SplashState.isFinished = true
    setTimeout(() => {
      const state = getGameState()
      state.currentScene = 'garden'  // 修改为garden而不是home
      SplashState.progress = 0
      SplashState.isFinished = false
      SplashState.petals = []
    }, 800)
  }
}

function splashAnimationLoop(render) {
  const GameState = getGameState()
  if (!GameState || GameState.currentScene !== 'splash') {
    return
  }
  
  renderSplash()
  
  if (GameState.currentScene === 'splash') {
    requestAnimationFrame(() => splashAnimationLoop(render))
  }
}

module.exports = {
  SplashState,
  SolarTermsData,
  initSplash,
  renderSplash,
  splashAnimationLoop,
  getCurrentSolarTerm
}