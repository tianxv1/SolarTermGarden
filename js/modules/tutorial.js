// 节气花园 - 新手引导模块
// 首次进入时的分步引导

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    scene: 'splash',
    title: '欢迎来到节气花园',
    content: '在这里你可以种植喜欢的植物，与宠物互动，感受中国传统节气的魅力！',
    highlight: null,
    position: 'center',
    buttonText: '下一步'
  },
  {
    id: 'garden_intro',
    scene: 'garden',
    title: '这是你的花园',
    content: '点击空地可以播种，点击作物可以浇水、施肥或收获。成熟后别忘了收获哦！',
    highlight: 'plot',
    position: 'bottom',
    buttonText: '知道了'
  },
  {
    id: 'plant_seed',
    scene: 'garden',
    title: '播种一粒种子',
    content: '点击商店购买种子，然后点击空地播种，开始你的种植之旅吧！',
    highlight: 'shop_button',
    position: 'bottom',
    buttonText: '去买种子'
  },
  {
    id: 'pet_intro',
    scene: 'garden',
    title: '认识你的宠物',
    content: '宠物会帮你守护花园，遇到乌鸦袭击时挺身而出！记得经常喂食和互动哦~',
    highlight: 'pet_area',
    position: 'right',
    buttonText: '和它打个招呼'
  },
  {
    id: 'chat_with_pet',
    scene: 'pet_chat',
    title: '与宠物聊天',
    content: '点击消息框输入内容，AI宠物会根据当前节气和花园状态回复你！',
    highlight: 'chat_input',
    position: 'top',
    buttonText: '开始聊天'
  },
  {
    id: 'handbook_intro',
    scene: 'garden',
    title: '节气手账',
    content: '每个节气都有专属奖励，完成节气任务可以获得丰厚奖品！',
    highlight: 'handbook_button',
    position: 'bottom',
    buttonText: '去看看'
  },
  {
    id: 'daily_tasks',
    scene: 'garden',
    title: '每日任务',
    content: '每天完成浇水、收获等任务可以获得金币奖励，坚持打卡有惊喜！',
    highlight: 'task_button',
    position: 'bottom',
    buttonText: '领取奖励'
  },
  {
    id: 'complete',
    scene: 'garden',
    title: '引导完成',
    content: '恭喜你！已经掌握了基本玩法，开始你的花园之旅吧！祝你在节气花园玩得开心~',
    highlight: null,
    position: 'center',
    buttonText: '开始游戏'
  }
]

const TUTORIAL_STORAGE_KEY = 'tutorial_completed'

class TutorialManager {
  constructor() {
    this.currentStep = 0
    this.isActive = false
    this.stepListeners = []
    this.completedListeners = []
  }

  checkFirstLaunch() {
    try {
      const completed = wx.getStorageSync(TUTORIAL_STORAGE_KEY)
      return !completed
    } catch (e) {
      return true
    }
  }

  isCompleted() {
    return this.checkFirstLaunch() === false
  }

  markCompleted() {
    try {
      wx.setStorageSync(TUTORIAL_STORAGE_KEY, true)
    } catch (e) {
      console.error('[Tutorial] Failed to mark completed:', e)
    }
  }

  reset() {
    try {
      wx.removeStorageSync(TUTORIAL_STORAGE_KEY)
    } catch (e) {
      console.error('[Tutorial] Failed to reset:', e)
    }
    this.currentStep = 0
  }

  start(fromStep = 0) {
    if (this.isCompleted() && fromStep === 0) {
      return false
    }

    this.currentStep = fromStep
    this.isActive = true
    this.notifyStepChange()
    return true
  }

  nextStep() {
    if (this.currentStep < TUTORIAL_STEPS.length - 1) {
      this.currentStep++
      this.notifyStepChange()
      return true
    } else {
      this.complete()
      return false
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--
      this.notifyStepChange()
      return true
    }
    return false
  }

  goToStep(stepId) {
    const index = TUTORIAL_STEPS.findIndex(s => s.id === stepId)
    if (index >= 0) {
      this.currentStep = index
      this.notifyStepChange()
      return true
    }
    return false
  }

  complete() {
    this.isActive = false
    this.markCompleted()
    this.notifyComplete()
  }

  skip() {
    this.complete()
  }

  getCurrentStep() {
    return TUTORIAL_STEPS[this.currentStep]
  }

  getStepCount() {
    return TUTORIAL_STEPS.length
  }

  getProgress() {
    return {
      current: this.currentStep + 1,
      total: TUTORIAL_STEPS.length,
      percentage: Math.round(((this.currentStep + 1) / TUTORIAL_STEPS.length) * 100)
    }
  }

  onStepChange(listener) {
    this.stepListeners.push(listener)
    return () => {
      this.stepListeners = this.stepListeners.filter(l => l !== listener)
    }
  }

  onComplete(listener) {
    this.completedListeners.push(listener)
    return () => {
      this.completedListeners = this.completedListeners.filter(l => l !== listener)
    }
  }

  notifyStepChange() {
    const step = this.getCurrentStep()
    const progress = this.getProgress()
    const data = { step, progress, index: this.currentStep }

    this.stepListeners.forEach(listener => {
      try {
        listener(data)
      } catch (e) {
        console.error('[Tutorial] Step listener error:', e)
      }
    })
  }

  notifyComplete() {
    this.completedListeners.forEach(listener => {
      try {
        listener()
      } catch (e) {
        console.error('[Tutorial] Complete listener error:', e)
      }
    })
  }
}

const tutorialManager = new TutorialManager()

function renderTutorialOverlay(ctx, screenWidth, screenHeight, step) {
  if (!tutorialManager.isActive) return

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  if (step.highlight) {
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    ctx.beginPath()

    const highlightArea = getHighlightArea(step.highlight, screenWidth, screenHeight)
    if (highlightArea) {
      const { x, y, width, height, radius } = highlightArea
      if (radius) {
        roundRect(ctx, x, y, width, height, radius)
      } else {
        ctx.rect(x, y, width, height)
      }
    }
    ctx.fill()
    ctx.restore()
  }

  const panelHeight = 200
  const panelY = screenHeight - panelHeight - 40

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
  ctx.shadowBlur = 20
  roundRect(ctx, 20, panelY, screenWidth - 40, panelHeight, [20, 20, 20, 20])
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.fillStyle = '#333'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(step.title, screenWidth / 2, panelY + 40)

  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#666'
  wrapText(ctx, step.content, screenWidth / 2, panelY + 75, screenWidth - 60, 20)

  const btnWidth = 120
  const btnHeight = 40
  const btnX = (screenWidth - btnWidth) / 2
  const btnY = panelY + panelHeight - 60

  ctx.fillStyle = '#c9305a'
  roundRect(ctx, btnX, btnY, btnWidth, btnHeight, [20, 20, 20, 20])
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.font = '14px sans-serif'
  ctx.fillText(step.buttonText, screenWidth / 2, btnY + 26)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()
  ctx.arc(screenWidth / 2, panelY - 15, 8, 0, Math.PI * 2)
  ctx.fill()

  const progress = tutorialManager.getProgress()
  ctx.fillStyle = '#c9305a'
  ctx.beginPath()
  ctx.arc(screenWidth / 2, panelY - 15, 4, 0, Math.PI * 2)
  ctx.fill()

  return { btnArea: { x: btnX, y: btnY, width: btnWidth, height: btnHeight } }
}

function getHighlightArea(highlight, screenWidth, screenHeight) {
  const areas = {
    plot: { x: screenWidth * 0.15, y: screenHeight * 0.4, width: screenWidth * 0.7, height: screenHeight * 0.35, radius: 15 },
    shop_button: { x: screenWidth * 0.7, y: screenHeight * 0.05, width: 80, height: 80, radius: 10 },
    pet_area: { x: screenWidth * 0.7, y: screenHeight * 0.25, width: 100, height: 100, radius: 50 },
    chat_input: { x: 20, y: screenHeight * 0.7, width: screenWidth - 40, height: 60, radius: 30 },
    handbook_button: { x: screenWidth * 0.1, y: screenHeight * 0.05, width: 60, height: 60, radius: 10 },
    task_button: { x: screenWidth * 0.4, y: screenHeight * 0.05, width: 60, height: 60, radius: 10 }
  }

  return areas[highlight]
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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split('')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = words[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
}

function handleTutorialTap(x, y, hitArea) {
  if (!tutorialManager.isActive) return false

  if (hitArea && hitArea.x <= x && x <= hitArea.x + hitArea.width &&
      hitArea.y <= y && y <= hitArea.y + hitArea.height) {
    tutorialManager.nextStep()
    return true
  }

  return false
}

module.exports = {
  tutorialManager,
  TUTORIAL_STEPS,
  renderTutorialOverlay,
  handleTutorialTap
}