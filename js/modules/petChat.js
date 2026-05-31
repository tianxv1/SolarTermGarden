// 节气花园 - 宠物聊天模块（AI智能聊天版）

const { drawRoundRect, drawCircle, drawText, drawProgressBar, drawBackButton, getGameState, getGlobal } = require('./globals')
const { GardenData } = require('./garden')
const { recordPlayerAction } = require('./dailyTasks')
const AudioManager = require('./audioManager')
const ImageLoader = require('./imageLoader')

// 动态获取全局变量
function getCtx() {
  return getGlobal('ctx')
}

function getScreenWidth() {
  return getGlobal('screenWidth', 375)
}

function getScreenHeight() {
  return getGlobal('screenHeight', 667)
}

// 宠物心情枚举
const PetMood = {
  HAPPY: 'happy',
  SAD: 'sad',
  EXCITED: 'excited',
  SLEEPY: 'sleepy',
  HUNGRY: 'hungry',
  LOVING: 'loving'
}

// 宠物性格类型
const PetPersonality = {
  SUNNY: { name: '阳光活泼', color: '#fbbf24', traits: ['开朗', '话多', '爱撒娇'] },
  CALM: { name: '冷静沉稳', color: '#94a3b8', traits: ['稳重', '话少', '理性'] },
  PLAYFUL: { name: '调皮捣蛋', color: '#a855f7', traits: ['活泼', '恶作剧', '好奇心强'] },
  GENTLE: { name: '温柔体贴', color: '#ec4899', traits: ['善解人意', '细心', '关心人'] }
}

// 宠物配置
const petConfig = {
  cat: {
    name: '小橘',
    emoji: '🐱',
    color: '#fdba74',
    bgColor: '#fff7ed',
    sound: '喵',
    moods: {
      happy: { emoji: '😊', message: '心情很好呢～' },
      sad: { emoji: '😿', message: '有点不开心...' },
      excited: { emoji: '🤩', message: '太兴奋啦！' },
      sleepy: { emoji: '😴', message: '好困呀～' },
      hungry: { emoji: '😾', message: '肚子饿了！' },
      loving: { emoji: '🥰', message: '最喜欢主人了～' }
    },
    messages: {
      greeting: ['主人主人！我好想你呀～喵～', '喵～主人来了！今天要陪我玩吗？', '主人主人！花园里的花开得好漂亮呀～喵～'],
      hungry: ['喵～主人，我肚子饿了～', '主人主人，给我点吃的吧～喵～', '肚子饿饿～要吃饭饭～喵～'],
      happy: ['好开心呀～主人最好了～喵～', '和主人在一起最快乐了～喵～', '主人主人，我们一起去花园玩吧～喵～'],
      tired: ['喵～有点累了～', '主人，我想休息一下～', '今天玩得很开心，有点累了～喵～']
    }
  },
  dog: {
    name: '旺财',
    emoji: '🐶',
    color: '#a8a29e',
    bgColor: '#f5f5f4',
    sound: '汪',
    moods: {
      happy: { emoji: '😄', message: '尾巴摇摇！' },
      sad: { emoji: '🐕', message: '好难过...' },
      excited: { emoji: '🐕‍🦺', message: '太棒了！' },
      sleepy: { emoji: '😴', message: '哈欠～' },
      hungry: { emoji: '🐶', message: '肚子饿了！' },
      loving: { emoji: '❤️', message: '最爱主人！' }
    },
    messages: {
      greeting: ['主人！你回来啦！汪！', '汪！主人好！今天过得怎么样？', '主人主人！我好想你呀！汪！'],
      hungry: ['汪！肚子饿了！要吃饭饭！', '主人，我饿了～汪～', '肚子咕咕叫～要吃东西～汪～'],
      happy: ['汪！好开心！和主人在一起最棒了！', '主人最好了！汪！', '我们一起去玩吧！汪！'],
      tired: ['汪～有点累了～', '主人，我想休息一下～', '今天玩得很开心，有点累了～汪～']
    }
  },
  owl: {
    name: '智慧',
    emoji: '🦉',
    color: '#94a3b8',
    bgColor: '#f1f5f9',
    sound: '咕',
    moods: {
      happy: { emoji: '😊', message: '心情平静～' },
      sad: { emoji: '🦉', message: '有些忧伤...' },
      excited: { emoji: '🤓', message: '有新发现！' },
      sleepy: { emoji: '🦉', message: '该休息了...' },
      hungry: { emoji: '🦉', message: '需要进食...' },
      loving: { emoji: '🤗', message: '感谢陪伴～' }
    },
    messages: {
      greeting: ['主人，你来了。咕。', '今天天气不错，适合在花园里散步。咕。', '主人，需要我帮你照看花园吗？咕。'],
      hungry: ['我有点饿了，主人。咕。', '主人，能给我点吃的吗？咕。', '肚子有点饿了。咕。'],
      happy: ['和主人在一起很愉快。咕。', '主人，你今天看起来很高兴。咕。', '花园里的植物生长得很好。咕。'],
      tired: ['我需要休息一下。咕。', '今天有点累了。咕。', '主人，我想小憩一会儿。咕。']
    }
  }
}

// 聊天历史
let chatMessages = []
let messageOffset = 0
let isScrolling = false
let lastScrollY = 0

// 宠物心情
let petMood = PetMood.HAPPY

// 宠物性格
let petPersonality = PetPersonality.SUNNY

// 宠物动画
let petAnimation = {
  floatY: 0,
  isBlinking: false,
  blinkTimer: 0
}

// 宠物特效
let petEffects = []

// 宠物状态检查定时器
let petStatusCheckTimer = null
let lastMoodUpdate = Date.now()

// AI对话关键词和回复
const aiResponses = {
  greetings: ['你好呀～', '主人好！', '喵～有什么事吗？', '汪！主人！'],
  care: ['谢谢关心～', '主人最好了！', '有主人在真好～'],
  weather: ['今天天气很棒呢～', '阳光明媚，适合散步～', '有点热呢～'],
  mood: ['和主人聊天很开心～', '有点想睡觉～', '精神很好！'],
  garden: ['花园里的花开得很漂亮～', '作物都长得很健康～', '我去巡逻过了～'],
  self: ['我最喜欢主人了～', '我很乖的！', '喵～'],
  default: ['主人说得对～', '喵喵～', '好呀好呀～', '汪！']
}

// 分析用户输入，返回合适的回复
function analyzeUserMessage(userMessage) {
  const message = userMessage.toLowerCase()
  const pet = getCurrentPetConfig()
  
  let prefix = ''
  switch (petPersonality) {
    case PetPersonality.SUNNY:
      prefix = pet.sound + '～'
      break
    case PetPersonality.CALM:
      prefix = '嗯。'
      break
    case PetPersonality.PLAYFUL:
      prefix = pet.sound + '！'
      break
    case PetPersonality.GENTLE:
      prefix = pet.sound + '～'
      break
  }
  
  if (message.match(/你好|嗨|hi|hello/i)) {
    return prefix + aiResponses.greetings[Math.floor(Math.random() * aiResponses.greetings.length)]
  }
  
  if (message.match(/关心|想你|爱你/i)) {
    return prefix + aiResponses.care[Math.floor(Math.random() * aiResponses.care.length)]
  }
  
  if (message.match(/天气|热|冷|下雨/i)) {
    return prefix + aiResponses.weather[Math.floor(Math.random() * aiResponses.weather.length)]
  }
  
  if (message.match(/心情|怎么样|好吗/i)) {
    return prefix + aiResponses.mood[Math.floor(Math.random() * aiResponses.mood.length)]
  }
  
  if (message.match(/花园|花|作物|植物/i)) {
    return prefix + aiResponses.garden[Math.floor(Math.random() * aiResponses.garden.length)]
  }
  
  if (message.match(/你|名字|是谁/i)) {
    return prefix + pet.name + aiResponses.self[Math.floor(Math.random() * aiResponses.self.length)]
  }
  
  if (message.match(/乖|听话|可爱/i)) {
    const loveResponses = ['谢谢夸奖！' + pet.sound + '～', '嘿嘿～', '主人也可爱～']
    return prefix + loveResponses[Math.floor(Math.random() * loveResponses.length)]
  }
  
  if (message.match(/吃饭|饿|食物/i)) {
    const hungryResponses = ['肚子有点饿了～', '想吃东西！', '要吃饭饭！']
    return prefix + hungryResponses[Math.floor(Math.random() * hungryResponses.length)]
  }
  
  if (message.match(/睡觉|困|累/i)) {
    const sleepyResponses = ['有点困了～', '想休息一会儿～', '哈欠～']
    return prefix + sleepyResponses[Math.floor(Math.random() * sleepyResponses.length)]
  }
  
  return prefix + aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)]
}

// 获取当前宠物配置
function getCurrentPetConfig() {
  const GameState = getGameState()
  return petConfig[(GameState.pet && GameState.pet.type) || 'cat'] || petConfig.cat
}

// 更新宠物心情
function updatePetMood() {
  const GameState = getGameState()
  const petData = GameState.pet || { satiety: 50, energy: 50, intimacy: 50 }
  const { satiety, energy, intimacy } = petData
  
  if (satiety < 30) {
    petMood = PetMood.HUNGRY
  } else if (energy < 20) {
    petMood = PetMood.SLEEPY
  } else if (intimacy > 90) {
    petMood = Math.random() > 0.5 ? PetMood.LOVING : PetMood.HAPPY
  } else if (intimacy > 70) {
    petMood = PetMood.HAPPY
  } else if (intimacy < 30) {
    petMood = Math.random() > 0.5 ? PetMood.SAD : PetMood.HUNGRY
  } else if (Math.random() > 0.8) {
    petMood = PetMood.EXCITED
  } else {
    petMood = PetMood.HAPPY
  }
  
  lastMoodUpdate = Date.now()
}

// 处理用户输入
function handleUserInput(content) {
  if (!content || content.trim() === '') return ''
  
  chatMessages.push({ 
    type: 'user', 
    text: content, 
    time: Date.now() 
  })
  
  recordPlayerAction('chat')
  
  const petResponse = analyzeUserMessage(content)
  chatMessages.push({ 
    type: 'pet', 
    text: petResponse, 
    time: Date.now() 
  })
  
  addPetEffect('speech')
  
  if (chatMessages.length > 50) {
    chatMessages = chatMessages.slice(-50)
  }
  
  return petResponse
}

// 处理宠物互动
function handlePetAction(action) {
  const GameState = getGameState()
  const pet = getCurrentPetConfig()
  let response = ''
  
  recordPlayerAction('pet')
  
  if (!GameState.pet) GameState.pet = { type: 'cat', satiety: 50, energy: 50, intimacy: 50 }
  
  petMood = PetMood.EXCITED
  
  switch (action) {
    case '喂食':
      GameState.pet.satiety = Math.min(100, (GameState.pet.satiety || 0) + 20)
      GameState.pet.intimacy = Math.min(100, (GameState.pet.intimacy || 0) + 5)
      response = pet.name + '吃得很开心～' + pet.sound + '～'
      addPetEffect('heart')
      AudioManager.playPetSound(GameState.pet.type)
      break
      
    case '抚摸':
      GameState.pet.intimacy = Math.min(100, (GameState.pet.intimacy || 0) + 10)
      response = '好舒服呀～谢谢主人～' + pet.sound + '～'
      addPetEffect('sparkle')
      AudioManager.playPetSound(GameState.pet.type)
      break
      
    case '巡逻':
      GameState.pet.energy = Math.max(0, (GameState.pet.energy || 50) - 10)
      GameState.pet.intimacy = Math.min(100, (GameState.pet.intimacy || 0) + 3)
      response = '巡逻完毕！花园一切正常～' + pet.sound + '～'
      addPetEffect('search')
      AudioManager.playPetSound(GameState.pet.type)
      break
      
    case '玩耍':
      GameState.pet.energy = Math.max(0, (GameState.pet.energy || 50) - 15)
      GameState.pet.satiety = Math.max(0, (GameState.pet.satiety || 50) - 5)
      GameState.pet.intimacy = Math.min(100, (GameState.pet.intimacy || 0) + 8)
      response = '和主人玩得好开心！' + pet.sound + '～'
      addPetEffect('play')
      AudioManager.playPetSound(GameState.pet.type)
      break
  }
  
  chatMessages.push({ type: 'pet', text: response, time: Date.now() })
  
  if (chatMessages.length > 50) {
    chatMessages = chatMessages.slice(-50)
  }
  
  return response
}

// 显示性格选择器
function showPersonalitySelector() {
  wx.showActionSheet({
    itemList: [
      '🌟 阳光活泼',
      '🌙 冷静沉稳', 
      '🎭 调皮捣蛋',
      '💝 温柔体贴',
      '🗑️ 清空聊天记录'
    ],
    success: (res) => {
      const personalities = [
        PetPersonality.SUNNY,
        PetPersonality.CALM,
        PetPersonality.PLAYFUL,
        PetPersonality.GENTLE
      ]
      
      if (res.tapIndex < 4) {
        petPersonality = personalities[res.tapIndex]
        wx.showToast({ title: `已切换到${petPersonality.name}`, icon: 'none' })
      } else if (res.tapIndex === 4) {
        wx.showModal({
          title: '确认清空',
          content: '确定要清空所有聊天记录吗？',
          success: (confirm) => {
            if (confirm.confirm) {
              chatMessages = []
              wx.showToast({ title: '聊天记录已清空', icon: 'success' })
            }
          }
        })
      }
    }
  })
}

// 添加宠物特效
function addPetEffect(type) {
  petEffects.push({
    type,
    startTime: Date.now(),
    opacity: 1
  })
  
  if (petEffects.length > 5) {
    petEffects.shift()
  }
}

// 更新宠物动画
function updatePetAnimation() {
  const now = Date.now()
  petAnimation.floatY = Math.sin(now / 500) * 5
  
  if (!petAnimation.isBlinking && Math.random() > 0.998) {
    petAnimation.isBlinking = true
    petAnimation.blinkTimer = now
  }
  
  if (petAnimation.isBlinking && now - petAnimation.blinkTimer > 150) {
    petAnimation.isBlinking = false
  }
  
  petEffects = petEffects.filter(effect => {
    const elapsed = now - effect.startTime
    effect.opacity = Math.max(0, 1 - elapsed / 2000)
    return effect.opacity > 0
  })
}

// 渲染宠物聊天页面
function renderPetChat(ctx, screenWidth, screenHeight) {
  const GameState = getGameState()
  
  updatePetAnimation()
  
  if (Date.now() - lastMoodUpdate > 10000) {
    updatePetMood()
  }
  
  const pet = getCurrentPetConfig()
  
  // 背景
  const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight)
  bgGradient.addColorStop(0, '#fdf2f4')
  bgGradient.addColorStop(0.5, pet.bgColor)
  bgGradient.addColorStop(1, '#f9d0d9')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, screenWidth, screenHeight)
  
  // 水彩装饰
  const watercolor1 = ctx.createRadialGradient(screenWidth * 0.3, screenHeight * 0.2, 0, screenWidth * 0.3, screenHeight * 0.2, screenWidth * 0.5)
  watercolor1.addColorStop(0, 'rgba(255, 237, 213, 0.3)')
  watercolor1.addColorStop(1, 'transparent')
  ctx.fillStyle = watercolor1
  ctx.fillRect(0, 0, screenWidth, screenHeight)
  
  // 返回按钮（左上角）
  drawCircle(ctx,  35, 85, 18, 'rgba(255,255,255,0.9)')
  drawText(ctx, '<',  35, 85, { align: 'center', font: 'bold 20px sans-serif', color: '#666' })
  
  // 先定义 infoY
  const infoY = 110
  
  // 先绘制卡片（底层）
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  drawRoundRect(ctx, 20, infoY, screenWidth - 40, 120, 15)
  ctx.fill()
  
  // 然后绘制设置按钮（在卡片上层内部右上角）
  drawCircle(ctx, screenWidth - 40, infoY + 25, 18, 'rgba(255,255,255,0.9)')
  drawText(ctx, '⚙️', screenWidth - 40, infoY + 25, { align: 'center', font: '14px sans-serif' })
  
  // 宠物头像
  const avatarX = 60
  const avatarY = infoY + 60 + petAnimation.floatY
  const avatarGradient = ctx.createRadialGradient(avatarX - 35, avatarY - 35, 0, avatarX, avatarY, 35)
  avatarGradient.addColorStop(0, pet.color)
  avatarGradient.addColorStop(1, pet.color + '80')
  drawCircle(ctx, avatarX, avatarY, 35, avatarGradient)
  
  const scale = petAnimation.isBlinking ? 0.95 : 1
  ctx.save()
  ctx.translate(avatarX, avatarY)
  ctx.scale(scale, scale)
  ctx.translate(-avatarX, -avatarY)
  
  const petImageMap = { cat: 'images/pet_cat.png', dog: 'images/pet_dog.png', owl: 'images/pet_owl.png' }
  const petType = (GameState.pet && GameState.pet.type) || 'cat'
  const imagePath = petImageMap[petType] || 'images/pet_cat.png'
  
  ImageLoader.loadImage(imagePath, (img) => {
    if (img) {
      const imgSize = 45 * scale
      ctx.drawImage(img, avatarX - imgSize/2, avatarY - imgSize/2, imgSize, imgSize)
    } else {
      ctx.font = `${36 * scale}px sans-serif`
      drawText(ctx, pet.emoji, avatarX, avatarY, { align: 'center', font: `${36 * scale}px sans-serif` })
    }
  })
  ctx.restore()
  
  // 宠物名称和性格
  drawText(ctx, pet.name, 110, infoY + 25, { font: 'bold 17px sans-serif', color: '#333' })
  drawText(ctx, petPersonality.name, 110, infoY + 42, { font: '12px sans-serif', color: petPersonality.color })
  
  // 宠物属性
  const petData = GameState.pet || { satiety: 50, energy: 50, intimacy: 50 }
  const stats = [
    { label: '饱腹', value: petData.satiety || 50, color: '#f97316', icon: '🍖', y: infoY + 90 },
    { label: '精力', value: petData.energy || 50, color: '#eab308', icon: '⚡', y: infoY + 110 },
    { label: '亲密', value: petData.intimacy || 50, color: '#ef4444', icon: '❤️', y: infoY + 130 }
  ]
  
  stats.forEach(stat => {
    drawText(ctx, stat.icon, 110, stat.y - 30, { font: '13px sans-serif', color: '#666' })
    drawText(ctx, stat.label, 130, stat.y - 30, { font: '11px sans-serif', color: '#666' })
    drawText(ctx, `${stat.value}%`, screenWidth - 40, stat.y - 32, { align: 'right', font: '11px sans-serif', color: stat.color })
    drawProgressBar(ctx, 160, stat.y - 35, screenWidth - 240, 7, stat.value, '#e5e7eb', stat.color)
  })
  
  // 宠物特效
  petEffects.forEach(effect => {
    ctx.save()
    ctx.globalAlpha = effect.opacity
    const effectX = avatarX + 40
    const effectY = avatarY - 20
    
    switch (effect.type) {
      case 'heart':
        ctx.fillStyle = '#ef4444'
        ctx.font = '18px sans-serif'
        ctx.fillText('❤️', effectX + (Math.random() - 0.5) * 20, effectY - effect.opacity * 25)
        break
      case 'sparkle':
        ctx.fillStyle = '#fbbf24'
        ctx.font = '14px sans-serif'
        for (let i = 0; i < 3; i++) {
          ctx.fillText('✨', effectX - 15 + i * 15, effectY + (Math.random() - 0.5) * 15)
        }
        break
      case 'speech':
        ctx.fillStyle = '#22c55e'
        ctx.font = '12px sans-serif'
        ctx.fillText('💬', effectX + 40, effectY + 10)
        break
      case 'search':
        ctx.fillStyle = '#3b82f6'
        ctx.font = '14px sans-serif'
        ctx.fillText('🔍', effectX + (Math.random() - 0.5) * 30, effectY)
        break
      case 'play':
        ctx.fillStyle = '#a855f7'
        ctx.font = '14px sans-serif'
        ctx.fillText('⭐', effectX + (Math.random() - 0.5) * 40, effectY)
        break
    }
    ctx.restore()
  })
  
  // 聊天区域
  const chatY = 250
  const chatHeight = screenHeight - 450  // 缩短高度，从-350改为-400
  
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  drawRoundRect(ctx, 20, chatY, screenWidth - 40, chatHeight, 12)
  ctx.fill()
  
  // 聊天标题
  drawText(ctx, `与${pet.name}的对话`, screenWidth/2, chatY + 22, { 
    align: 'center', 
    font: 'bold 14px sans-serif', 
    color: '#666' 
  })
  
  // 清空按钮
  if (chatMessages.length > 0) {
    drawText(ctx, '🗑️', screenWidth - 35, chatY + 22, { align: 'center', font: '13px sans-serif' })
  }
  
  // 聊天记录
  const messageStartY = chatY + 45
  const messageHeight = chatHeight - 60
  const visibleMessages = Math.floor(messageHeight / 48)
  const startIndex = Math.max(0, chatMessages.length - visibleMessages + messageOffset)
  const endIndex = Math.min(chatMessages.length, startIndex + visibleMessages)
  
  for (let i = startIndex; i < endIndex; i++) {
    const msg = chatMessages[i]
    const y = messageStartY + (i - startIndex) * 48
    
    if (msg.type === 'pet') {
      drawCircle(ctx, 30, y, 12, pet.color)
      drawText(ctx, pet.emoji, 30, y, { align: 'center', font: '12px sans-serif' })
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      drawRoundRect(ctx, 48, y - 13, screenWidth - 120, 26, 13)
      ctx.fill()
      drawText(ctx, msg.text, 60, y + 2, { font: '11px sans-serif', color: '#333' })
    } else {
      ctx.fillStyle = '#f97316'
      drawRoundRect(ctx, screenWidth - 170, y - 13, 155, 26, 13)
      ctx.fill()
      drawText(ctx, msg.text, screenWidth - 160, y + 2, { font: '11px sans-serif', color: '#fff' })
    }
  }
  
  if (chatMessages.length > visibleMessages) {
    const scrollY = chatY + chatHeight - 15
    ctx.fillStyle = '#999'
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`共${chatMessages.length}条消息 ↑↓滚动`, screenWidth/2, scrollY)
    ctx.textAlign = 'left'
  }
  
  // 操作按钮
  const actionY = screenHeight - 145
  const actions = [
    { icon: '🍖', text: '喂食', color: '#ffedd5' },
    { icon: '🤚', text: '抚摸', color: '#fce7f3' },
    { icon: '🚶', text: '巡逻', color: '#dcfce7' },
    { icon: '🎮', text: '玩耍', color: '#dbeafe' }
  ]
  
  actions.forEach((action, i) => {
    const x = 30 + i * (screenWidth - 60) / 4 + 25
    drawCircle(ctx, x, actionY, 25, action.color)
    drawText(ctx, action.icon, x, actionY - 2, { align: 'center', font: '22px sans-serif' })
    drawText(ctx, action.text, x, actionY + 38, { align: 'center', font: '11px sans-serif', color: '#666' })
  })
  
  // 输入区域
  const inputY = screenHeight - 80
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.fillRect(0, inputY, screenWidth, 80)
  
  drawCircle(ctx, 25, inputY + 30, 16, '#f3f4f6')
  drawText(ctx, '🎤', 25, inputY + 30, { align: 'center', font: '14px sans-serif', color: '#666' })
  
  ctx.fillStyle = '#f3f4f6'
  drawRoundRect(ctx, 50, inputY + 17, screenWidth - 100, 28, 14)
  ctx.fill()
  drawText(ctx, `和${pet.name}聊天...`, 65, inputY + 32, { font: '13px sans-serif', color: '#999' })
  
  drawCircle(ctx, screenWidth - 25, inputY + 30, 14, '#f97316')
  drawText(ctx, '➤', screenWidth - 25, inputY + 30, { align: 'center', font: '13px sans-serif', color: '#fff' })
}

// 处理宠物聊天页面触摸
function handlePetChatTouch(x, y, touchEvent) {
  const GameState = getGameState()
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  
  // 返回按钮
  if (x >= 7 && x <= 43 && y >= 17 && y <= 53) {
    GameState.currentScene = 'garden'
    return
  }
  
  // 设置按钮（在卡片内部右上角）
  if (x >= screenWidth - 48 && x <= screenWidth - 12 && y >= 132 && y <= 148) {
    showPersonalitySelector()
    return
  }
  
  // 清空按钮
  const chatY = 195
  if (chatMessages.length > 0 && x >= screenWidth - 48 && x <= screenWidth - 22 && y >= chatY + 10 && y <= chatY + 34) {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有聊天记录吗？',
      success: (confirm) => {
        if (confirm.confirm) {
          chatMessages = []
          wx.showToast({ title: '聊天记录已清空', icon: 'success' })
        }
      }
    })
    return
  }
  
  // 聊天区域滚动
  const messageStartY = chatY + 45
  const chatHeight = screenHeight - 350
  
  if (y >= messageStartY && y <= messageStartY + chatHeight - 15) {
    if (touchEvent && touchEvent.touches && touchEvent.touches.length > 0) {
      const deltaY = touchEvent.touches[0].clientY - lastScrollY
      lastScrollY = touchEvent.touches[0].clientY
      
      if (deltaY > 5) {
        messageOffset = Math.min(messageOffset + 1, chatMessages.length - 1)
      } else if (deltaY < -5) {
        messageOffset = Math.max(messageOffset - 1, 0)
      }
    }
    return
  }
  
  // 操作按钮
  const actionY = screenHeight - 145
  if (y >= actionY - 25 && y <= actionY + 25) {  // 精确匹配按钮圆形区域（半径25px）
    const actions = ['喂食', '抚摸', '巡逻', '玩耍']
    actions.forEach((action, i) => {
      const btnX = 30 + i * (screenWidth - 60) / 4 + 25
      if (x >= btnX - 25 && x <= btnX + 25) {  // 精确匹配按钮宽度
        const response = handlePetAction(action)
        wx.showToast({ title: response, icon: 'none' })
        return
      }
    })
  }
  
  // 输入区域
  const inputY = screenHeight - 80
  if (y >= inputY + 10 && y <= inputY + 50 && x >= 50 && x <= screenWidth - 50) {
    const pet = getCurrentPetConfig()
    wx.showModal({
      title: `和${pet.name}聊天`,
      editable: true,
      placeholderText: '输入消息...',
      success: (res) => {
        if (res.confirm && res.content) {
          const response = handleUserInput(res.content)
          wx.showToast({ title: response, icon: 'none' })
        }
      }
    })
  }
}

// 检查宠物状态并生成主动提示
function checkPetStatusAndPrompt() {
  const GameState = getGameState()
  const petData = GameState.pet || { satiety: 50, intimacy: 50 }
  const { satiety, intimacy } = petData
  const pet = getCurrentPetConfig()
  
  if (satiety < 30 || intimacy < 20) {
    let message = ''
    
    if (satiety < 30) {
      message = pet.messages.hungry[Math.floor(Math.random() * pet.messages.hungry.length)]
    } else if (intimacy < 20) {
      message = `主人，我好孤单呀～${pet.sound}～`
    }
    
    chatMessages.push({ type: 'pet', text: message, time: Date.now() })
    
    if (chatMessages.length > 50) {
      chatMessages = chatMessages.slice(-50)
    }
    
    wx.showToast({ title: message, icon: 'none' })
  }
}

// 开始宠物状态检查定时器
function startPetStatusCheck() {
  if (petStatusCheckTimer) {
    clearInterval(petStatusCheckTimer)
  }
  petStatusCheckTimer = setInterval(checkPetStatusAndPrompt, 30000)
}

// 停止宠物状态检查定时器
function stopPetStatusCheck() {
  if (petStatusCheckTimer) {
    clearInterval(petStatusCheckTimer)
    petStatusCheckTimer = null
  }
}

// 宠物能量自动恢复
function startPetEnergyRecovery() {
  setInterval(() => {
    const GameState = getGameState()
    if (GameState.pet && GameState.pet.energy !== undefined) {
      GameState.pet.energy = Math.min(100, (GameState.pet.energy || 50) + 2)
    }
  }, 300000)
}

// 宠物饱腹度自动消耗
function startPetHungerDrain() {
  setInterval(() => {
    const GameState = getGameState()
    if (GameState.pet && GameState.pet.satiety !== undefined) {
      GameState.pet.satiety = Math.max(0, (GameState.pet.satiety || 50) - 3)
    }
  }, 600000)
}

// 初始化
startPetStatusCheck()
startPetEnergyRecovery()
startPetHungerDrain()

module.exports = {
  renderPetChat,
  handlePetChatTouch,
  startPetStatusCheck,
  stopPetStatusCheck,
  getCurrentPetConfig,
  handlePetAction,
  handleUserInput
}
