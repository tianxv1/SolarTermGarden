// 节气花园 - 每日任务系统

const { getGameState } = require('./globals')

// 任务类型定义
const taskTypes = [
  {
    id: 'water',
    name: '浇水',
    description: '浇水3次',
    target: 3,
    reward: 20,
    icon: '🌧️',
    checkProgress: () => {
      const state = getGameState()
      return state.playerStats ? (state.playerStats.waterCount || 0) : 0
    },
    onComplete: () => {}
  },
  {
    id: 'harvest',
    name: '收获',
    description: '收获2棵作物',
    target: 2,
    reward: 30,
    icon: '🌾',
    checkProgress: () => {
      const state = getGameState()
      return state.playerStats ? (state.playerStats.harvestCount || 0) : 0
    },
    onComplete: () => {}
  },
  {
    id: 'chat',
    name: '聊天',
    description: '与宠物聊天1次',
    target: 1,
    reward: 15,
    icon: '💬',
    checkProgress: () => {
      const state = getGameState()
      return state.playerStats ? (state.playerStats.chatCount || 0) : 0
    },
    onComplete: () => {}
  },
  {
    id: 'pet',
    name: '互动',
    description: '与宠物互动3次',
    target: 3,
    reward: 25,
    icon: '🐾',
    checkProgress: () => {
      const state = getGameState()
      return state.playerStats ? (state.playerStats.petCount || 0) : 0
    },
    onComplete: () => {}
  },
  {
    id: 'plant',
    name: '种植',
    description: '种植2颗种子',
    target: 2,
    reward: 20,
    icon: '🌱',
    checkProgress: () => {
      const state = getGameState()
      return state.playerStats ? (state.playerStats.plantCount || 0) : 0
    },
    onComplete: () => {}
  },
  {
    id: 'fertilize',
    name: '施肥',
    description: '施肥1次',
    target: 1,
    reward: 15,
    icon: '✨',
    checkProgress: () => {
      const state = getGameState()
      return state.playerStats ? (state.playerStats.fertilizeCount || 0) : 0
    },
    onComplete: () => {}
  }
]

// 随机事件类型
const eventTypes = [
  {
    id: 'sunshine',
    name: '阳光普照',
    description: '今天阳光充足，所有作物生长速度+20%',
    reward: 0,
    icon: '☀️',
    effect: 'growth_boost'
  },
  {
    id: 'rain',
    name: '天降甘霖',
    description: '天降喜雨，所有作物自动浇水一次',
    reward: 0,
    icon: '🌧️',
    effect: 'auto_water'
  },
  {
    id: 'visitor',
    name: '神秘访客',
    description: '一位神秘访客送你礼物！',
    reward: 50,
    icon: '🎁',
    effect: null
  },
  {
    id: 'luck_bonus',
    name: '好运连连',
    description: '今日好运加成，获得额外金币奖励！',
    reward: 30,
    icon: '🍀',
    effect: null
  }
]

function getCurrentDate() {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

// 初始化每日任务
function initDailyTasks() {
  const GameState = getGameState()
  const today = getCurrentDate()
  
  if (!GameState.dailyTasks || GameState.dailyTasks.date !== today) {
    if (!GameState.dailyTasks) GameState.dailyTasks = {}
    GameState.dailyTasks.date = today
    GameState.dailyTasks.tasks = generateRandomTasks(3)
    GameState.dailyTasks.completed = 0
    
    // 初始化玩家统计
    if (!GameState.playerStats) GameState.playerStats = {}
    GameState.playerStats.waterCount = 0
    GameState.playerStats.harvestCount = 0
    GameState.playerStats.chatCount = 0
    GameState.playerStats.petCount = 0
    GameState.playerStats.plantCount = 0
    GameState.playerStats.fertilizeCount = 0
    
    // 触发随机事件
    triggerRandomEvent()
  }
}

// 生成随机任务
function generateRandomTasks(count) {
  const shuffled = [...taskTypes].sort(() => Math.random() - 0.5)
  const selectedTasks = shuffled.slice(0, count)
  
  return selectedTasks.map(task => ({
    ...task,
    progress: 0,
    completed: false
  }))
}

// 更新任务进度
function updateTaskProgress(taskId) {
  const GameState = getGameState()
  if (!GameState.dailyTasks || !GameState.dailyTasks.tasks) return
  
  GameState.dailyTasks.tasks.forEach(task => {
    if (!task.completed && task.id === taskId) {
      const currentProgress = task.checkProgress()
      task.progress = Math.min(currentProgress, task.target)
      
      if (task.progress >= task.target && !task.completed) {
        completeTask(task)
      }
    }
  })
}

// 完成任务
function completeTask(task) {
  const GameState = getGameState()
  task.completed = true
  if (GameState.dailyTasks) {
    GameState.dailyTasks.completed = (GameState.dailyTasks.completed || 0) + 1
  }
  GameState.gold = (GameState.gold || 0) + task.reward
  
  wx.showToast({
    title: `任务完成！获得${task.reward}金币`,
    icon: 'success'
  })
  
  task.onComplete()
}

// 检查所有任务进度
function checkAllTasksProgress() {
  const GameState = getGameState()
  if (!GameState.dailyTasks || !GameState.dailyTasks.tasks) return
  
  GameState.dailyTasks.tasks.forEach(task => {
    if (!task.completed) {
      updateTaskProgress(task.id)
    }
  })
}

// 触发随机事件
function triggerRandomEvent() {
  const GameState = getGameState()
  const randomIndex = Math.floor(Math.random() * eventTypes.length)
  const event = eventTypes[randomIndex]
  
  if (!GameState.randomEvent) GameState.randomEvent = {}
  GameState.randomEvent = {
    active: true,
    type: event.id,
    title: event.name,
    description: event.description,
    reward: event.reward,
    effect: event.effect,
    icon: event.icon
  }
  
  // 发放奖励
  if (event.reward > 0) {
    GameState.gold = (GameState.gold || 0) + event.reward
  }
  
  // 应用效果
  applyEventEffect(event.effect)
}

// 应用事件效果
function applyEventEffect(effect) {
  switch (effect) {
    case 'growth_boost':
      wx.showToast({ title: '所有作物生长加速！', icon: 'none' })
      break
      
    case 'auto_water':
      wx.showToast({ title: '所有作物已自动浇水！', icon: 'none' })
      break
      
    case 'luck_bonus':
      wx.showToast({ title: '获得30金币好运奖励！', icon: 'success' })
      break
  }
}

// 关闭随机事件弹窗
function closeRandomEvent() {
  const GameState = getGameState()
  if (GameState.randomEvent) {
    GameState.randomEvent.active = false
  }
}

// 获取任务完成进度
function getTaskProgress() {
  const GameState = getGameState()
  if (!GameState.dailyTasks || !GameState.dailyTasks.tasks) {
    return { completed: 0, total: 3 }
  }
  const completed = GameState.dailyTasks.tasks.filter(t => t.completed).length
  const total = GameState.dailyTasks.tasks.length
  return { completed, total }
}

// 获取今日任务列表
function getTodayTasks() {
  const GameState = getGameState()
  if (!GameState.dailyTasks || !GameState.dailyTasks.tasks) {
    return []
  }
  return GameState.dailyTasks.tasks
}

// 记录玩家行为
function recordPlayerAction(action) {
  const GameState = getGameState()
  if (!GameState.playerStats) GameState.playerStats = {}
  
  switch (action) {
    case 'water':
      GameState.playerStats.waterCount = (GameState.playerStats.waterCount || 0) + 1
      updateTaskProgress('water')
      break
    case 'harvest':
      GameState.playerStats.harvestCount = (GameState.playerStats.harvestCount || 0) + 1
      updateTaskProgress('harvest')
      break
    case 'chat':
      GameState.playerStats.chatCount = (GameState.playerStats.chatCount || 0) + 1
      updateTaskProgress('chat')
      break
    case 'pet':
      GameState.playerStats.petCount = (GameState.playerStats.petCount || 0) + 1
      updateTaskProgress('pet')
      break
    case 'plant':
      GameState.playerStats.plantCount = (GameState.playerStats.plantCount || 0) + 1
      updateTaskProgress('plant')
      break
    case 'fertilize':
      GameState.playerStats.fertilizeCount = (GameState.playerStats.fertilizeCount || 0) + 1
      updateTaskProgress('fertilize')
      break
  }
}

module.exports = {
  initDailyTasks,
  updateTaskProgress,
  checkAllTasksProgress,
  triggerRandomEvent,
  applyEventEffect,
  closeRandomEvent,
  getTaskProgress,
  getTodayTasks,
  recordPlayerAction
}