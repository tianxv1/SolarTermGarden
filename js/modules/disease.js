// 节气花园 - 病虫害防治模块

const { drawRoundRect, drawCircle, drawText, drawBackButton, drawTopMenu, getGameState, getGlobal } = require('./globals')
const AudioManager = require('./audioManager')

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

// 病害数据
const DiseaseData = [
  {
    id: 'aphid',
    name: '蚜虫',
    icon: '🐛',
    symptom: '叶片发黄、卷曲',
    description: '蚜虫会吸食植物汁液，导致叶片发黄、卷曲，严重时会影响植物生长。',
    treatment: '使用肥皂水喷洒或引入瓢虫等天敌',
    goldCost: 10,
    questions: [
      {
        question: '蚜虫主要危害植物的哪个部位？',
        options: [
          { text: '根部', correct: false },
          { text: '叶片', correct: true },
          { text: '花朵', correct: false },
          { text: '果实', correct: false }
        ]
      },
      {
        question: '下列哪种方法不能防治蚜虫？',
        options: [
          { text: '喷洒肥皂水', correct: false },
          { text: '引入瓢虫', correct: false },
          { text: '增加浇水', correct: true },
          { text: '使用杀虫剂', correct: false }
        ]
      }
    ]
  },
  {
    id: 'mold',
    name: '霉菌',
    icon: '🍄',
    symptom: '叶片出现白色霉层',
    description: '霉菌会在潮湿环境中滋生，形成白色或灰色霉层，影响植物光合作用。',
    treatment: '保持通风、控制湿度、使用杀菌剂',
    goldCost: 15,
    questions: [
      {
        question: '霉菌最喜欢什么样的环境？',
        options: [
          { text: '干燥通风', correct: false },
          { text: '潮湿阴暗', correct: true },
          { text: '阳光充足', correct: false },
          { text: '高温干燥', correct: false }
        ]
      },
      {
        question: '以下哪种措施可以预防霉菌？',
        options: [
          { text: '增加浇水次数', correct: false },
          { text: '保持通风', correct: true },
          { text: '减少光照', correct: false },
          { text: '增加施肥', correct: false }
        ]
      }
    ]
  },
  {
    id: 'beetle',
    name: '甲虫',
    icon: '🪲',
    symptom: '叶片出现孔洞',
    description: '甲虫幼虫和成虫都会啃食植物叶片，造成叶片破损，影响植物健康。',
    treatment: '手工捕捉、使用防虫网、生物防治',
    goldCost: 12,
    questions: [
      {
        question: '甲虫主要以什么为食？',
        options: [
          { text: '植物根部', correct: false },
          { text: '植物叶片', correct: true },
          { text: '土壤中的腐殖质', correct: false },
          { text: '其他昆虫', correct: false }
        ]
      },
      {
        question: '下列哪种方法是物理防治甲虫？',
        options: [
          { text: '使用农药', correct: false },
          { text: '手工捕捉', correct: true },
          { text: '施肥', correct: false },
          { text: '浇水', correct: false }
        ]
      }
    ]
  },
  {
    id: 'rust',
    name: '锈病',
    icon: '🔴',
    symptom: '叶片出现黄色或橙色斑点',
    description: '锈病是由真菌引起的病害，会在叶片上形成锈色斑点，严重时导致落叶。',
    treatment: '及时清除病叶、使用杀菌剂、轮作',
    goldCost: 18,
    questions: [
      {
        question: '锈病的病原体是什么？',
        options: [
          { text: '细菌', correct: false },
          { text: '真菌', correct: true },
          { text: '病毒', correct: false },
          { text: '昆虫', correct: false }
        ]
      },
      {
        question: '发现锈病后首先应该怎么做？',
        options: [
          { text: '增加施肥', correct: false },
          { text: '清除病叶', correct: true },
          { text: '增加浇水', correct: false },
          { text: '不管它', correct: false }
        ]
      }
    ]
  },
  {
    id: 'virus',
    name: '病毒病',
    icon: '🦠',
    symptom: '叶片出现斑驳、畸形',
    description: '病毒病会导致植物叶片出现黄绿相间的斑驳，植株生长缓慢、畸形。',
    treatment: '及时清除病株、防治蚜虫等传播媒介',
    goldCost: 20,
    questions: [
      {
        question: '病毒病主要通过什么途径传播？',
        options: [
          { text: '土壤', correct: false },
          { text: '蚜虫等昆虫', correct: true },
          { text: '雨水', correct: false },
          { text: '风', correct: false }
        ]
      },
      {
        question: '下列哪种方法可以预防病毒病？',
        options: [
          { text: '增加施肥', correct: false },
          { text: '防治蚜虫', correct: true },
          { text: '增加浇水', correct: false },
          { text: '减少光照', correct: false }
        ]
      }
    ]
  },
  {
    id: 'nematode',
    name: '线虫',
    icon: '🐜',
    symptom: '根部出现瘤状物',
    description: '线虫会寄生在植物根部，形成瘤状突起，影响根系吸收功能，导致植株衰弱。',
    treatment: '轮作、使用杀线虫剂、生物防治',
    goldCost: 25,
    questions: [
      {
        question: '线虫主要危害植物的哪个部位？',
        options: [
          { text: '叶片', correct: false },
          { text: '根部', correct: true },
          { text: '花朵', correct: false },
          { text: '茎', correct: false }
        ]
      },
      {
        question: '下列哪种方法可以防治线虫？',
        options: [
          { text: '增加浇水', correct: false },
          { text: '轮作', correct: true },
          { text: '增加光照', correct: false },
          { text: '减少施肥', correct: false }
        ]
      }
    ]
  }
]

// 病害状态
const DiseaseState = {
  currentView: 'main',
  selectedDisease: null,
  viewStack: [],
  currentOptions: [],
  prevScene: 'garden',
  gameAttempts: 3,
  gameScore: 0
}

// 选中的答案索引
let selectedAnswerIndex = null

// 生成选项（打乱顺序）
function generateOptions(disease) {
  if (!disease || !disease.questions || disease.questions.length === 0) {
    return []
  }
  const randomQuestion = disease.questions[Math.floor(Math.random() * disease.questions.length)]
  const options = [...randomQuestion.options]
  
  // 打乱选项顺序
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]
  }
  
  return options
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

// 渲染病害防治页面
function renderDiseasePage() {
  // 动态获取全局变量
  const ctx = getCtx()
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, screenWidth, screenHeight)
  
  // 绘制背景
  ctx.fillStyle = '#fef3e2'
  ctx.fillRect(0, 0, screenWidth, screenHeight)
  
  // 绘制顶部信息栏背景
  ctx.fillStyle = '#c9305a'
  drawRoundRect(ctx, 0, 0, screenWidth, 110, 0)
  ctx.fill()
  
  // 绘制标题
  drawText(ctx, '病虫害防治', screenWidth / 2, 55, { 
    align: 'center', 
    font: 'bold 20px sans-serif', 
    color: '#fff' 
  })
  
  // 绘制返回按钮
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()
  ctx.arc(35, 85, 18, 0, Math.PI * 2)
  ctx.fill()
  drawText(ctx, '←', 35, 85, { align: 'center', font: 'bold 16px sans-serif', color: '#333' })
  
  // 根据当前视图渲染内容
  if (DiseaseState.currentView === 'main') {
    renderMainView(ctx, screenWidth, screenHeight)
  } else if (DiseaseState.currentView === 'detail') {
    renderDetailView(ctx, screenWidth, screenHeight)
  } else if (DiseaseState.currentView === 'game') {
    renderGameView(ctx, screenWidth, screenHeight)
  }
}

// 渲染主视图（病害列表）
function renderMainView(ctx, screenWidth, screenHeight) {
  const startY = 130
  const itemHeight = 70
  const gap = 15
  
  DiseaseData.forEach((disease, index) => {
    const y = startY + index * (itemHeight + gap)
    
    // 绘制卡片背景
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.05)'
    ctx.shadowBlur = 5
    ctx.shadowOffsetY = 2
    drawRoundRect(ctx, 15, y, screenWidth - 30, itemHeight, 12)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    
    // 绘制图标背景
    ctx.fillStyle = '#fef3c7'
    ctx.beginPath()
    ctx.arc(45, y + itemHeight / 2, 25, 0, Math.PI * 2)
    ctx.fill()
    
    // 绘制图标
    ctx.font = '28px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(disease.icon, 45, y + itemHeight / 2)
    
    // 绘制名称
    ctx.font = 'bold 16px sans-serif'
    ctx.fillStyle = '#333'
    ctx.textAlign = 'left'
    ctx.fillText(disease.name, 85, y + 25)
    
    // 绘制症状
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#666'
    ctx.fillText(`症状: ${disease.symptom}`, 85, y + 45)
    
    // 绘制金币消耗
    ctx.font = 'bold 14px sans-serif'
    ctx.fillStyle = '#f97316'
    ctx.textAlign = 'right'
    ctx.fillText(`💰 ${disease.goldCost}`, screenWidth - 25, y + itemHeight / 2)
  })
}

// 渲染详情视图
function renderDetailView(ctx, screenWidth, screenHeight) {
  const disease = DiseaseState.selectedDisease
  if (!disease) return
  
  // 绘制卡片背景
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 4
  drawRoundRect(ctx, 15, 130, screenWidth - 30, screenHeight - 250, 12)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  
  // 绘制图标
  ctx.font = '64px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(disease.icon, screenWidth / 2, 180)
  
  // 绘制名称
  drawText(ctx, disease.name, screenWidth / 2, 250, { 
    align: 'center', 
    font: 'bold 24px sans-serif', 
    color: '#333' 
  })
  
  // 绘制症状
  drawText(ctx, `症状: ${disease.symptom}`, screenWidth / 2, 285, { 
    align: 'center', 
    font: '14px sans-serif', 
    color: '#666' 
  })
  
  // 绘制描述
  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#555'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  
  // 文字换行处理
  const description = disease.description
  const lineHeight = 20
  const maxWidth = screenWidth - 60
  const words = description.split('')
  let currentLine = ''
  let y = 310
  
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i]
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && currentLine.length > 0) {
      ctx.fillText(currentLine, 30, y)
      y += lineHeight
      currentLine = words[i]
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine.length > 0) {
    ctx.fillText(currentLine, 30, y)
  }
  
  y += lineHeight + 10
  
  // 绘制防治方法标题
  ctx.font = 'bold 14px sans-serif'
  ctx.fillStyle = '#c9305a'
  ctx.fillText('防治方法:', 30, y)
  
  y += lineHeight
  
  // 绘制防治方法
  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#555'
  ctx.fillText(disease.treatment, 30, y)
  
  // 绘制治疗按钮
  const btnY = screenHeight - 70
  ctx.fillStyle = '#22c55e'
  drawRoundRect(ctx, 30, btnY, screenWidth - 60, 50, 25)
  ctx.fill()
  
  drawText(ctx, `花费 ${disease.goldCost} 金币开始治疗`, screenWidth / 2, btnY + 25, { 
    align: 'center', 
    font: 'bold 16px sans-serif', 
    color: '#fff' 
  })
}

// 渲染游戏视图
function renderGameView(ctx, screenWidth, screenHeight) {
  const disease = DiseaseState.selectedDisease
  if (!disease) return
  
  // 使用保存的选项列表
  const options = DiseaseState.currentOptions.length > 0 ? DiseaseState.currentOptions : generateOptions(disease)
  
  // 绘制卡片背景
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 4
  drawRoundRect(ctx, 15, 130, screenWidth - 30, screenHeight - 250, 12)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  
  // 绘制题目信息
  drawText(ctx, `剩余次数: ${DiseaseState.gameAttempts}`, 30, 155, { 
    font: '14px sans-serif', 
    color: '#666' 
  })
  
  drawText(ctx, `得分: ${DiseaseState.gameScore}`, screenWidth - 30, 155, { 
    align: 'right', 
    font: '14px sans-serif', 
    color: '#f97316' 
  })
  
  // 绘制题目
  const question = disease.questions[Math.floor(Math.random() * disease.questions.length)]
  drawText(ctx, question.question, screenWidth / 2, 200, { 
    align: 'center', 
    font: 'bold 16px sans-serif', 
    color: '#333' 
  })
  
  // 绘制选项
  options.forEach((option, i) => {
    const y = 270 + i * 60
    const isSelected = selectedAnswerIndex === i
    
    // 选项背景
    ctx.fillStyle = isSelected ? '#c9305a' : '#f3f4f6'
    drawRoundRect(ctx, 15, y, screenWidth - 30, 50, 8)
    ctx.fill()
    
    // 选项文字
    ctx.font = '14px sans-serif'
    ctx.fillStyle = isSelected ? '#fff' : '#333'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(option.text, 40, y + 25)
  })
  
  // 绘制提交按钮
  const btnY = 270 + options.length * 60 + 20
  ctx.fillStyle = selectedAnswerIndex !== null ? '#22c55e' : '#d1d5db'
  drawRoundRect(ctx, 30, btnY, screenWidth - 60, 50, 25)
  ctx.fill()
  
  drawText(ctx, '确认答案', screenWidth / 2, btnY + 25, { 
    align: 'center', 
    font: 'bold 16px sans-serif', 
    color: '#fff' 
  })
}

// 处理触摸事件
function handleDiseaseTouch(x, y) {
  const GameState = getGameState()
  
  // 通用返回按钮
  if (distance(x, y, 35, 85) <= 18) {
    if (DiseaseState.currentView === 'main') {
      // 返回之前的场景
      GameState.currentScene = DiseaseState.prevScene
    } else if (DiseaseState.viewStack.length > 0) {
      // 从视图栈中弹出上一个视图
      const prevView = DiseaseState.viewStack.pop()
      DiseaseState.currentView = prevView
      
      // 如果回到main视图，清空选择状态
      if (prevView === 'main') {
        DiseaseState.selectedDisease = null
        selectedAnswerIndex = null
        DiseaseState.currentOptions = []
      }
    } else {
      // 如果栈为空，直接回到main
      DiseaseState.currentView = 'main'
      DiseaseState.selectedDisease = null
      selectedAnswerIndex = null
      DiseaseState.currentOptions = []
    }
    AudioManager.playClick()
    return
  }

  if (DiseaseState.currentView === 'main') {
    // 点击病害列表项
    const startY = 130
    const itemHeight = 70
    const gap = 15
    
    DiseaseData.forEach((disease, index) => {
      const y = startY + index * (itemHeight + gap)
      if (x >= 15 && x <= screenWidth - 15 && y >= y && y <= y + itemHeight) {
        // 将当前视图压入栈
        DiseaseState.viewStack.push(DiseaseState.currentView)
        DiseaseState.currentView = 'detail'
        DiseaseState.selectedDisease = disease
        AudioManager.playClick()
      }
    })
  } else if (DiseaseState.currentView === 'detail') {
    const disease = DiseaseState.selectedDisease
    
    // 治疗按钮
    const btnY = screenHeight - 70
    if (x >= 30 && x <= screenWidth - 30 && y >= btnY && y <= btnY + 50) {
      if (GameState.gold >= disease.goldCost) {
        // 将当前视图压入栈
        DiseaseState.viewStack.push(DiseaseState.currentView)
        // 扣除金币，开始游戏
        GameState.gold -= disease.goldCost
        DiseaseState.gameAttempts = 3
        DiseaseState.gameScore = 0
        DiseaseState.currentView = 'game'
        selectedAnswerIndex = null
        // 生成并保存当前游戏的选项（只生成一次）
        DiseaseState.currentOptions = generateOptions(disease)
        AudioManager.playClick()
      } else {
        wx.showToast({ title: '金币不足！', icon: 'none' })
      }
      return
    }
  } else if (DiseaseState.currentView === 'game') {
    const disease = DiseaseState.selectedDisease
    // 使用保存的选项列表，而不是每次重新生成
    const options = DiseaseState.currentOptions.length > 0 ? DiseaseState.currentOptions : generateOptions(disease)
    const btnY = 270 + options.length * 60 + 20

    // 选项点击
    options.forEach((option, i) => {
      const optY = 270 + i * 60
      if (x >= 15 && x <= screenWidth - 15 && y >= optY && y <= optY + 50) {
        selectedAnswerIndex = i
        AudioManager.playClick()
        return
      }
    })

    // 提交按钮
    if (x >= 30 && x <= screenWidth - 60 && y >= btnY && y <= btnY + 50) {
      if (selectedAnswerIndex !== null) {
        // 使用保存的选项列表进行判断
        const optionsList = DiseaseState.currentOptions.length > 0 ? DiseaseState.currentOptions : generateOptions(disease)
        
        if (optionsList[selectedAnswerIndex].correct) {
          // 答对了
          DiseaseState.gameScore += 10
          DiseaseState.gameAttempts--
          
          if (DiseaseState.gameAttempts > 0) {
            wx.showToast({ title: '回答正确！+10分', icon: 'success' })
            selectedAnswerIndex = null
            // 生成新的题目选项
            DiseaseState.currentOptions = generateOptions(disease)
          } else {
            // 游戏结束
            GameState.gold += DiseaseState.gameScore * 2
            wx.showModal({
              title: '🎉 挑战成功！',
              content: `最终得分: ${DiseaseState.gameScore}\n获得奖励: ${DiseaseState.gameScore * 2} 金币`,
              showCancel: false,
              success: () => {
                // 清除当前病害的选择状态
                DiseaseState.currentView = 'main'
                DiseaseState.selectedDisease = null
                selectedAnswerIndex = null
                DiseaseState.currentOptions = []
              }
            })
          }
        } else {
          // 答错了
          DiseaseState.gameAttempts--
          selectedAnswerIndex = null
          
          if (DiseaseState.gameAttempts > 0) {
            wx.showToast({ title: `回答错误！剩余${DiseaseState.gameAttempts}次机会`, icon: 'none' })
            // 生成新的题目选项
            DiseaseState.currentOptions = generateOptions(disease)
          } else {
            wx.showModal({
              title: '😢 挑战失败',
              content: '答题机会用完了，再试一次吧！',
              showCancel: false,
              success: () => {
                // 返回详情页，可以重新开始
                DiseaseState.currentView = 'detail'
                selectedAnswerIndex = null
                DiseaseState.currentOptions = []
              }
            })
          }
        }
      }
    }
  }
}

// 初始化页面
function initDiseasePage(prevScene = 'garden') {
  DiseaseState.currentView = 'main'
  DiseaseState.selectedDisease = null
  DiseaseState.viewStack = []
  DiseaseState.currentOptions = []
  DiseaseState.prevScene = prevScene
  DiseaseState.gameAttempts = 3
  DiseaseState.gameScore = 0
  selectedAnswerIndex = null
}

module.exports = {
  renderDiseasePage,
  handleDiseaseTouch,
  initDiseasePage,
  DiseaseState
}