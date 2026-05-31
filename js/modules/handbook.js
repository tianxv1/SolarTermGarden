// 节气手账模块

const { drawRoundRect, drawCircle, drawText, drawProgressBar, drawTopMenu, getGameState, getGlobal } = require('./globals')

function getCtx() {
  return getGlobal('ctx')
}

function getScreenWidth() {
  return getGlobal('screenWidth', 375)
}

function getScreenHeight() {
  return getGlobal('screenHeight', 667)
}

const SOLAR_TERMS_DATA = [
  { id: 'lichun', name: '立春', season: 'spring', month: 2, day: 4, emoji: '🌱', poem: '东风带雨逐西风，大地阳和暖气生', description: '春季开始，万物复苏', tips: '适合种植：桃花、杏花' },
  { id: 'yushui', name: '雨水', season: 'spring', month: 2, day: 19, emoji: '🌧️', poem: '好雨知时节，当春乃发生', description: '降雨开始，雨量渐增', tips: '适合种植：莲花、荸荠' },
  { id: 'jingzhe', name: '惊蛰', season: 'spring', month: 3, day: 5, emoji: '⚡', poem: '春雷响，万物长', description: '春雷始鸣，惊醒蛰虫', tips: '适合种植：牡丹、芍药' },
  { id: 'chunfen', name: '春分', season: 'spring', month: 3, day: 21, emoji: '🌸', poem: '春分雨脚落声微，柳岸斜风带客归', description: '昼夜平分，春季过半', tips: '适合种植：樱花、玉兰' },
  { id: 'qingming', name: '清明', season: 'spring', month: 4, day: 5, emoji: '🌿', poem: '清明时节雨纷纷，路上行人欲断魂', description: '气温回升，春暖花开', tips: '适合种植：柳树、杨梅' },
  { id: 'guyu', name: '谷雨', season: 'spring', month: 4, day: 20, emoji: '🌾', poem: '谷雨如丝复似尘，煮瓶浮蜡正尝新', description: '雨量增多，利于谷物生长', tips: '适合种植：水稻、棉花' },
  { id: 'lixia', name: '立夏', season: 'summer', month: 5, day: 5, emoji: '☀️', poem: '四月清和雨乍晴，南山当户转分明', description: '夏季开始，气温升高', tips: '适合种植：荷花、茉莉' },
  { id: 'xiaoman', name: '小满', season: 'summer', month: 5, day: 21, emoji: '🌾', poem: '小满动三车，忙得不知人', description: '小麦饱满，雨水增多', tips: '适合种植：小麦、苦菜' },
  { id: 'mangzhong', name: '芒种', season: 'summer', month: 6, day: 6, emoji: '🌿', poem: '时雨及芒种，四野皆插秧', description: '有芒作物成熟，抢收抢种', tips: '适合种植：水稻、玉米' },
  { id: 'xiazhi', name: '夏至', season: 'summer', month: 6, day: 21, emoji: '🌻', poem: '昼晷已云极，宵漏自此长', description: '白昼最长，阳气至极', tips: '适合种植：向日葵、薄荷' },
  { id: 'xiaoshu', name: '小暑', season: 'summer', month: 7, day: 7, emoji: '🔥', poem: '倏忽温风至，因循小暑来', description: '暑气渐盛，雷暴增多', tips: '适合种植：西瓜、丝瓜' },
  { id: 'dashu', name: '大暑', season: 'summer', month: 7, day: 22, emoji: '🌡️', poem: '大暑三秋近，林钟九夏移', description: '一年最热时节', tips: '适合种植：荷花、美人蕉' },
  { id: 'liqiu', name: '立秋', season: 'autumn', month: 8, day: 7, emoji: '🍂', poem: '乳鸦啼散玉屏空，一枕新凉一扇风', description: '秋季开始，暑去凉来', tips: '适合种植：桂花、菊花' },
  { id: 'chushu', name: '处暑', season: 'autumn', month: 8, day: 23, emoji: '🍃', poem: '处暑无三日，新凉直万金', description: '暑气消退，秋意渐浓', tips: '适合种植：海棠、腊梅' },
  { id: 'bailu', name: '白露', season: 'autumn', month: 9, day: 7, emoji: '💧', poem: '蒹葭苍苍，白露为霜', description: '夜凉水汽凝结成露', tips: '适合种植：芦苇、菊花' },
  { id: 'qiufen', name: '秋分', season: 'autumn', month: 9, day: 23, emoji: '🍁', poem: '金气秋分，风清露冷秋期半', description: '昼夜平分，秋季过半', tips: '适合种植：枫叶、银杏' },
  { id: 'hanlu', name: '寒露', season: 'autumn', month: 10, day: 8, emoji: '🌙', poem: '袅袅凉风动，凄凄寒露零', description: '露气寒冷，秋季渐深', tips: '适合种植：山楂、枸杞' },
  { id: 'shuangjiang', name: '霜降', season: 'autumn', month: 10, day: 23, emoji: '❄️', poem: '霜降水返壑，风落木归山', description: '天气渐冷，开始降霜', tips: '适合种植：柿子、栗子' },
  { id: 'lidong', name: '立冬', season: 'winter', month: 11, day: 7, emoji: '🌨️', poem: '冻笔新诗懒写，寒炉美酒时温', description: '冬季开始，万物收藏', tips: '适合种植：梅花、水仙' },
  { id: 'xiaoxue', name: '小雪', season: 'winter', month: 11, day: 22, emoji: '🌨️', poem: '小雪已晴芦叶暗，长波乍急鹤声嘶', description: '开始降雪，雪量不大', tips: '适合种植：冬青、雪莲' },
  { id: 'daxue', name: '大雪', season: 'winter', month: 12, day: 7, emoji: '❄️', poem: '大雪江南见未曾，今年方始是严凝', description: '雪量增大，积雪渐厚', tips: '适合种植：松树、竹子' },
  { id: 'dongzhi', name: '冬至', season: 'winter', month: 12, day: 21, emoji: '☃️', poem: '冬至阳生春又来，天时人事日相催', description: '白昼最短，阴极阳生', tips: '适合种植：冬笋、山药' },
  { id: 'xiaohan', name: '小寒', season: 'winter', month: 1, day: 5, emoji: '🌨️', poem: '小寒连大吕，欢鹊垒新巢', description: '气候渐冷，未到最寒', tips: '适合种植：腊梅、水仙' },
  { id: 'dahan', name: '大寒', season: 'winter', month: 1, day: 20, emoji: '🥶', poem: '大寒须守火，无事莫出门', description: '一年最寒时节', tips: '适合种植：冬青、瑞香' }
]

const HANDBOOK_REWARDS = {
  '立春': { type: 'seed', item: 'peach', name: '桃花种子', count: 3, icon: '🌱' },
  '雨水': { type: 'seed', item: 'lotus', name: '莲花种子', count: 2, icon: '🪷' },
  '惊蛰': { type: 'decoration', item: 'butterfly', name: '蝴蝶装饰', count: 1, icon: '🦋' },
  '春分': { type: 'seed', item: 'chrysanthemum', name: '菊花种子', count: 3, icon: '🌼' },
  '清明': { type: 'gold', item: null, name: '金币', count: 50, icon: '💰' },
  '谷雨': { type: 'seed', item: 'spinach', name: '菠菜种子', count: 4, icon: '🥬' },
  '立夏': { type: 'decoration', item: 'flowerpot', name: '花盆装饰', count: 1, icon: '🪴' },
  '小满': { type: 'gold', item: null, name: '金币', count: 60, icon: '💰' },
  '芒种': { type: 'seed', item: 'watermelon', name: '西瓜种子', count: 2, icon: '🍉' },
  '夏至': { type: 'decoration', item: 'sun', name: '太阳装饰', count: 1, icon: '☀️' },
  '小暑': { type: 'gold', item: null, name: '金币', count: 70, icon: '💰' },
  '大暑': { type: 'seed', item: 'peach', name: '桃花种子', count: 5, icon: '🌱' },
  '立秋': { type: 'decoration', item: 'moon', name: '月亮装饰', count: 1, icon: '🌙' },
  '处暑': { type: 'gold', item: null, name: '金币', count: 80, icon: '💰' },
  '白露': { type: 'seed', item: 'lotus', name: '莲花种子', count: 3, icon: '🪷' },
  '秋分': { type: 'decoration', item: 'leaf', name: '落叶装饰', count: 1, icon: '🍂' },
  '寒露': { type: 'gold', item: null, name: '金币', count: 90, icon: '💰' },
  '霜降': { type: 'seed', item: 'chrysanthemum', name: '菊花种子', count: 4, icon: '🌼' },
  '立冬': { type: 'decoration', item: 'snowflake', name: '雪花装饰', count: 1, icon: '❄️' },
  '小雪': { type: 'gold', item: null, name: '金币', count: 100, icon: '💰' },
  '大雪': { type: 'seed', item: 'spinach', name: '菠菜种子', count: 5, icon: '🥬' },
  '冬至': { type: 'decoration', item: 'star', name: '星星装饰', count: 1, icon: '⭐' },
  '小寒': { type: 'gold', item: null, name: '金币', count: 110, icon: '💰' },
  '大寒': { type: 'seed', item: 'watermelon', name: '西瓜种子', count: 3, icon: '🍉' }
}

const SEASON_COLORS = {
  spring: { bg: '#fce7eb', text: '#c9305a', name: '春季' },
  summer: { bg: '#dcfce7', text: '#16a34a', name: '夏季' },
  autumn: { bg: '#ffedd5', text: '#c2410c', name: '秋季' },
  winter: { bg: '#f1f5f9', text: '#475569', name: '冬季' }
}

let currentTab = 'all'
let scrollOffset = 0
let handbookData = []

function initHandbookData() {
  const GameState = getGameState()
  const rewards = GameState.handbookRewards || {}
  const currentTerm = GameState.currentSolarTerm || '立春'
  const collectedTerms = GameState.collectedSolarTerms || []

  handbookData = SOLAR_TERMS_DATA.map((term, index) => {
    const isCollected = collectedTerms.includes(term.name)
    const isUnlocked = getTermUnlocked(term, currentTerm)
    const isClaimed = rewards[term.name] === true
    const reward = HANDBOOK_REWARDS[term.name]

    return {
      ...term,
      index,
      isCollected,
      isUnlocked,
      isClaimed,
      reward,
      canClaim: isCollected && !isClaimed && isUnlocked
    }
  })
}

function getTermUnlocked(term, currentTerm) {
  const currentIndex = SOLAR_TERMS_DATA.findIndex(t => t.name === currentTerm)
  const termIndex = SOLAR_TERMS_DATA.findIndex(t => t.name === term.name)
  return termIndex <= currentIndex
}

function claimHandbookReward(termName) {
  const GameState = getGameState()

  if (!GameState.handbookRewards) {
    GameState.handbookRewards = {}
  }

  if (GameState.handbookRewards[termName]) {
    return { success: false, message: '奖励已领取' }
  }

  const reward = HANDBOOK_REWARDS[termName]
  if (!reward) {
    return { success: false, message: '未找到奖励' }
  }

  GameState.handbookRewards[termName] = true

  switch (reward.type) {
    case 'gold':
      GameState.gold = (GameState.gold || 0) + reward.count
      break
    case 'seed':
      break
    case 'decoration':
      break
  }

  return { success: true, reward }
}

function renderHandbook(ctx, screenWidth, screenHeight) {
  const GameState = getGameState()
  ctx = getCtx() || ctx
  screenWidth = getScreenWidth() || screenWidth || 375
  screenHeight = getScreenHeight() || screenHeight || 667

  initHandbookData()

  const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight)
  bgGradient.addColorStop(0, '#fdf2f4')
  bgGradient.addColorStop(0.5, '#fce7eb')
  bgGradient.addColorStop(1, '#f9d0d9')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  const watercolor = ctx.createRadialGradient(screenWidth * 0.7, screenHeight * 0.2, 0, screenWidth * 0.7, screenHeight * 0.2, screenWidth * 0.5)
  watercolor.addColorStop(0, 'rgba(252, 231, 235, 0.5)')
  watercolor.addColorStop(1, 'transparent')
  ctx.fillStyle = watercolor
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  renderHeader(ctx, screenWidth)
  renderProgress(ctx, screenWidth)
  renderTabs(ctx, screenWidth)
  renderSolarTermList(ctx, screenWidth, screenHeight)
  renderTip(ctx, screenWidth, screenHeight)
}

function renderHeader(ctx, screenWidth) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  drawRoundRect(ctx, 0, 50, screenWidth, 55, 0)
  ctx.fill()

  drawCircle(ctx, 35, 75, 18, 'rgba(255,255,255,0.8)')
  drawText(ctx, '<', 35, 75, { align: 'center', font: 'bold 18px sans-serif', color: '#666' })

  drawText(ctx, '节气手账', screenWidth / 2, 75, {
    align: 'center', font: 'bold 20px sans-serif', color: '#333'
  })

  const collectedCount = handbookData.filter(t => t.isClaimed).length
  const totalCount = handbookData.length
  drawText(ctx, `${collectedCount}/${totalCount}`, screenWidth - 30, 75, {
    align: 'right', font: 'bold 12px sans-serif', color: '#c9305a'
  })
}

function renderProgress(ctx, screenWidth) {
  const collectedCount = handbookData.filter(t => t.isClaimed).length
  const totalCount = handbookData.length
  const progress = (collectedCount / totalCount) * 100

  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  drawRoundRect(ctx, 15, 110, screenWidth - 30, 60, 12)
  ctx.fill()

  drawText(ctx, '收集进度', 30, 130, { font: 'bold 12px sans-serif', color: '#666' })
  drawText(ctx, `${collectedCount} / ${totalCount}`, screenWidth - 30, 130, {
    align: 'right', font: 'bold 12px sans-serif', color: '#333'
  })

  const barWidth = screenWidth - 60
  drawProgressBar(ctx, 30, 150, barWidth, 10, progress, '#e5e7eb', '#22c55e')

  const seasonCounts = {}
  handbookData.forEach(term => {
    if (term.isClaimed) {
      seasonCounts[term.season] = (seasonCounts[term.season] || 0) + 1
    }
  })

  const seasonX = [30, 120, 210, 300]
  Object.keys(SEASON_COLORS).forEach((season, i) => {
    const count = seasonCounts[season] || 0
    const seasonInfo = SEASON_COLORS[season]
    ctx.fillStyle = seasonInfo.bg
    drawRoundRect(ctx, seasonX[i], 165, 80, 20, 10)
    ctx.fill()
    drawText(ctx, `${seasonInfo.name} ${count}个`, seasonX[i] + 40, 175, {
      align: 'center', font: '10px sans-serif', color: seasonInfo.text
    })
  })
}

function renderTabs(ctx, screenWidth) {
  const tabs = [
    { id: 'all', name: '全部' },
    { id: 'collected', name: '已收集' },
    { id: 'locked', name: '待解锁' }
  ]
  const tabY = 195

  tabs.forEach((tab, i) => {
    const isActive = currentTab === tab.id
    const tabX = 15 + i * 85

    ctx.fillStyle = isActive ? '#c9305a' : 'rgba(255,255,255,0.9)'
    drawRoundRect(ctx, tabX, tabY, 75, 32, 16)
    ctx.fill()

    drawText(ctx, tab.name, tabX + 37, tabY + 16, {
      align: 'center', font: '12px sans-serif', color: isActive ? '#fff' : '#666'
    })
  })
}

function renderSolarTermList(ctx, screenWidth, screenHeight) {
  const filteredData = handbookData.filter(term => {
    if (currentTab === 'collected') return term.isClaimed
    if (currentTab === 'locked') return !term.isClaimed
    return true
  })

  const startY = 240
  const cardHeight = 85
  const cardGap = 10
  const visibleCount = Math.floor((screenHeight - startY - 60) / (cardHeight + cardGap))

  filteredData.forEach((term, i) => {
    if (i >= visibleCount) return

    const y = startY + i * (cardHeight + cardGap)
    renderTermCard(ctx, term, screenWidth, y)
  })

  if (filteredData.length > visibleCount) {
    const totalPages = Math.ceil(filteredData.length / visibleCount)
    const currentPage = Math.floor(scrollOffset / visibleCount)
    const pageY = screenHeight - 40

    for (let i = 0; i < totalPages; i++) {
      const dotX = screenWidth / 2 - (totalPages * 10) / 2 + i * 12
      ctx.fillStyle = i === currentPage ? '#c9305a' : '#d1d5db'
      ctx.beginPath()
      ctx.arc(dotX, pageY, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function renderTermCard(ctx, term, screenWidth, y) {
  const seasonInfo = SEASON_COLORS[term.season]

  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  drawRoundRect(ctx, 15, y, screenWidth - 30, 85, 12)
  ctx.fill()

  ctx.strokeStyle = term.isClaimed ? '#c9305a' : '#e5e7eb'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(15, y + 12)
  ctx.lineTo(15, y + 73)
  ctx.stroke()

  ctx.fillStyle = seasonInfo.bg
  drawRoundRect(ctx, 30, y + 10, 45, 20, 10)
  ctx.fill()
  drawText(ctx, seasonInfo.name, 52, y + 20, {
    align: 'center', font: '10px sans-serif', color: seasonInfo.text
  })

  ctx.globalAlpha = term.isUnlocked ? 1 : 0.4
  drawCircle(ctx, 55, y + 50, 20, term.isClaimed ? '#fce7eb' : '#f3f4f6')
  drawText(ctx, term.emoji, 55, y + 50, { align: 'center', font: '22px sans-serif' })
  ctx.globalAlpha = 1

  const textColor = term.isUnlocked ? '#333' : '#999'
  drawText(ctx, term.name, 90, y + 32, { font: 'bold 16px sans-serif', color: textColor })
  drawText(ctx, `${term.month}月${term.day}日`, 90, y + 50, { font: '10px sans-serif', color: '#999' })
  drawText(ctx, term.poem.substring(0, 12) + '...', 90, y + 66, { font: '10px sans-serif', color: '#aaa' })

  renderRewardButton(ctx, term, screenWidth, y)
}

function renderRewardButton(ctx, term, screenWidth, y) {
  const btnX = screenWidth - 95
  const btnY = y + 15
  const btnW = 65
  const btnH = 25

  if (!term.isUnlocked) {
    ctx.fillStyle = '#f3f4f6'
    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 12)
    ctx.fill()
    drawText(ctx, '🔒 未解锁', btnX + btnW / 2, btnY + btnH / 2, {
      align: 'center', font: '10px sans-serif', color: '#999'
    })
  } else if (term.isClaimed) {
    ctx.fillStyle = '#e5e7eb'
    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 12)
    ctx.fill()
    drawText(ctx, '✓ 已领取', btnX + btnW / 2, btnY + btnH / 2, {
      align: 'center', font: '10px sans-serif', color: '#6b7280'
    })
  } else if (term.canClaim) {
    ctx.fillStyle = '#fef3c7'
    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 12)
    ctx.fill()
    drawText(ctx, `${term.reward?.icon || '🎁'} 领取`, btnX + btnW / 2, btnY + btnH / 2, {
      align: 'center', font: '10px sans-serif', color: '#d97706'
    })
  } else {
    ctx.fillStyle = '#f3f4f6'
    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 12)
    ctx.fill()
    drawText(ctx, '📋 待收集', btnX + btnW / 2, btnY + btnH / 2, {
      align: 'center', font: '10px sans-serif', color: '#999'
    })
  }
}

function renderTip(ctx, screenWidth, screenHeight) {
  const tipY = screenHeight - 60
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  drawRoundRect(ctx, 15, tipY, screenWidth - 30, 45, 12)
  ctx.fill()
  drawText(ctx, '💡', 35, tipY + 22, { align: 'center', font: '16px sans-serif' })
  drawText(ctx, '在对应节气期间完成种植任务即可解锁手账', 55, tipY + 22, {
    font: '11px sans-serif', color: '#666'
  })
}

function handleHandbookTouch(x, y) {
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()

  if (x >= 15 && x <= 55 && y >= 65 && y <= 85) {
    const GameState = getGameState()
    GameState.currentScene = 'garden'
    return
  }

  const tabs = [
    { id: 'all', x: 15, w: 75 },
    { id: 'collected', x: 100, w: 75 },
    { id: 'locked', x: 185, w: 75 }
  ]
  const tabY = 195

  for (const tab of tabs) {
    if (y >= tabY && y <= tabY + 32 && x >= tab.x && x <= tab.x + tab.w) {
      currentTab = tab.id
      return
    }
  }

  const filteredData = handbookData.filter(term => {
    if (currentTab === 'collected') return term.isClaimed
    if (currentTab === 'locked') return !term.isClaimed
    return true
  })

  const startY = 240
  const cardHeight = 85
  const cardGap = 10

  filteredData.forEach((term, i) => {
    const cardY = startY + i * (cardHeight + cardGap)
    if (y >= cardY && y <= cardY + cardHeight && x >= 15 && x <= screenWidth - 15) {
      if (x >= screenWidth - 95 && x <= screenWidth - 30 && y >= cardY + 15 && y <= cardY + 40) {
        if (term.canClaim) {
          const result = claimHandbookReward(term.name)
          if (result.success) {
            wx.showToast({
              title: `获得${result.reward.icon} ${result.reward.name}×${result.reward.count}`,
              icon: 'success'
            })
          }
        } else if (!term.isUnlocked) {
          wx.showToast({ title: `${term.name}还未解锁`, icon: 'none' })
        } else if (term.isClaimed) {
          wx.showToast({ title: '奖励已领取', icon: 'none' })
        } else {
          wx.showToast({ title: '请先收集该节气', icon: 'none' })
        }
      } else {
        showTermDetail(term)
      }
      return
    }
  })
}

function showTermDetail(term) {
  const reward = term.reward || {}
  let content = `${term.description}\n\n📅 时间：${term.month}月${term.day}日\n🌍 季节：${SEASON_COLORS[term.season].name}\n\n💡 种植提示：${term.tips}\n\n📜 节气诗词：\n"${term.poom}"`
  if (reward.icon) {
    content += `\n\n🎁 节气奖励：${reward.icon} ${reward.name}×${reward.count}`
  }

  wx.showModal({
    title: `${term.emoji} ${term.name}`,
    content,
    showCancel: false
  })
}

function renderHandbookDetail(ctx, screenWidth, screenHeight, term) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  const modalW = screenWidth - 60
  const modalH = 350
  const modalX = 30
  const modalY = (screenHeight - modalH) / 2

  ctx.fillStyle = 'rgba(255,255,255,0.98)'
  drawRoundRect(ctx, modalX, modalY, modalW, modalH, 20)
  ctx.fill()

  const seasonInfo = SEASON_COLORS[term.season]
  drawCircle(ctx, modalX + modalW / 2, modalY + 50, 35, seasonInfo.bg)
  drawText(ctx, term.emoji, modalX + modalW / 2, modalY + 50, { align: 'center', font: '40px sans-serif' })

  drawText(ctx, term.name, modalX + modalW / 2, modalY + 100, {
    align: 'center', font: 'bold 22px sans-serif', color: '#333'
  })

  drawText(ctx, `${term.month}月${term.day}日 · ${seasonInfo.name}`, modalX + modalW / 2, modalY + 125, {
    align: 'center', font: '12px sans-serif', color: '#999'
  })

  ctx.fillStyle = '#f5f5f5'
  drawRoundRect(ctx, modalX + 20, modalY + 145, modalW - 40, 80, 12)
  ctx.fill()

  drawText(ctx, term.description, modalX + modalW / 2, modalY + 170, {
    align: 'center', font: '12px sans-serif', color: '#666'
  })

  drawText(ctx, `"${term.poem}"`, modalX + modalW / 2, modalY + 200, {
    align: 'center', font: '11px sans-serif', color: '#888', italic: true
  })

  if (term.reward) {
    ctx.fillStyle = '#fef3c7'
    drawRoundRect(ctx, modalX + 20, modalY + 240, modalW - 40, 50, 12)
    ctx.fill()
    drawText(ctx, `🎁 节气奖励`, modalX + 40, modalY + 260, {
      font: 'bold 12px sans-serif', color: '#92400e'
    })
    drawText(ctx, `${term.reward.icon} ${term.reward.name} ×${term.reward.count}`, modalX + 40, modalY + 278, {
      font: '12px sans-serif', color: '#78350f'
    })
  }

  ctx.fillStyle = '#c9305a'
  drawRoundRect(ctx, modalX + modalW / 2 - 50, modalY + modalH - 50, 100, 35, 17)
  ctx.fill()
  drawText(ctx, '关闭', modalX + modalW / 2, modalY + modalH - 32, {
    align: 'center', font: '14px sans-serif', color: '#fff'
  })
}

module.exports = {
  renderHandbook,
  handleHandbookTouch,
  claimHandbookReward,
  initHandbookData,
  SOLAR_TERMS_DATA,
  HANDBOOK_REWARDS,
  SEASON_COLORS
}