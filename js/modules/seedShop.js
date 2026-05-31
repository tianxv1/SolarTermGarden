// 节气花园 - 种子商店模块

const { drawRoundRect, drawCircle, drawText, drawBackButton, drawTopMenu, getGameState, getGlobal } = require('./globals')

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

function renderSeedShop(ctx, screenWidth, screenHeight) {
  const GameState = getGameState()
  
  const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight)
  bgGradient.addColorStop(0, '#fdf2f4')
  bgGradient.addColorStop(0.5, '#fce7eb')
  bgGradient.addColorStop(1, '#f9d0d9')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  const watercolor1 = ctx.createRadialGradient(screenWidth * 0.2, screenHeight * 0.3, 0, screenWidth * 0.2, screenHeight * 0.3, screenWidth * 0.5)
  watercolor1.addColorStop(0, 'rgba(253, 242, 244, 0.5)')
  watercolor1.addColorStop(1, 'transparent')
  ctx.fillStyle = watercolor1
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  drawRoundRect(ctx, 0, 50, screenWidth, 120, 0)
  ctx.fill()

  drawCircle(ctx, 35, 75, 18, 'rgba(255,255,255,0.8)')
  drawText(ctx, '<', 35, 75, { align: 'center', font: 'bold 18px sans-serif', color: '#666' })

  drawText(ctx, '种子商店', screenWidth / 2, 75, { align: 'center', font: 'bold 20px sans-serif', color: '#333' })

  drawCircle(ctx, screenWidth - 60, 75, 22, '#fef3c7')
  drawText(ctx, '\u{1F4B0}', screenWidth - 75, 75, { align: 'center', font: '14px sans-serif' })
  drawText(ctx, `${GameState.gold || 0}`, screenWidth - 35, 75, { align: 'right', font: '14px sans-serif', color: '#b45309' })

  ctx.fillStyle = 'rgba(252, 231, 235, 0.9)'
  drawRoundRect(ctx, 15, 105, screenWidth - 30, 60, 12)
  ctx.fill()
  drawCircle(ctx, 45, 135, 22, '#f9d0d9')
  drawText(ctx, '\u{1F338}', 45, 135, { align: 'center', font: '24px sans-serif' })
  drawText(ctx, '立春 \u00B7 宜种桃花', 80, 130, { font: 'bold 14px sans-serif', color: '#333' })
  drawText(ctx, '当前节气种子生长速度 +20%', 80, 150, { font: '11px sans-serif', color: '#666' })

  const tabs = ['全部', '春季', '夏季', '秋季', '冬季']
  const tabY = 180
  tabs.forEach((tab, i) => {
    const isActive = i === 0
    const tabX = 15 + i * 75
    ctx.fillStyle = isActive ? '#c9305a' : 'rgba(255,255,255,0.8)'
    drawRoundRect(ctx, tabX, tabY, 65, 32, 16)
    ctx.fill()
    drawText(ctx, tab, tabX + 32, tabY + 20, { align: 'center', font: '12px sans-serif', color: isActive ? '#fff' : '#666' })
  })

  const seeds = [
    { name: '桃花', emoji: '\u{1F338}', price: 20, season: '春季', time: '10分钟', unlocked: true },
    { name: '西瓜', emoji: '\u{1F349}', price: 30, season: '夏季', time: '15分钟', unlocked: false },
    { name: '菊花', emoji: '\u{1F3F3}', price: 25, season: '秋季', time: '12分钟', unlocked: false },
    { name: '梅花', emoji: '\u{1F338}', price: 35, season: '冬季', time: '20分钟', unlocked: false },
    { name: '荷花', emoji: '\u{1FAB7}', price: 10, season: '限定', time: '30分钟', unlocked: true, rare: true },
    { name: '翠竹', emoji: '\u{1F38B}', price: 28, season: '夏季', time: '18分钟', unlocked: false }
  ]

  const cardWidth = (screenWidth - 45) / 2
  const cardHeight = 160
  const startY = 225

  seeds.forEach((seed, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 15 + col * (cardWidth + 15)
    const y = startY + row * (cardHeight + 12)

    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    drawRoundRect(ctx, x, y, cardWidth, cardHeight, 12)
    ctx.fill()

    const seasonColors = { '春季': '#fce7eb', '夏季': '#dcfce7', '秋季': '#ffedd5', '冬季': '#f1f5f9', '限定': '#fef3c7' }
    const seasonTextColors = { '春季': '#c9305a', '夏季': '#16a34a', '秋季': '#c2410c', '冬季': '#475569', '限定': '#ca8a04' }
    ctx.fillStyle = seasonColors[seed.season] || '#f3f4f6'
    drawRoundRect(ctx, x + 10, y + 10, 40, 18, 9)
    ctx.fill()
    drawText(ctx, seed.season, x + 30, y + 20, { align: 'center', font: '10px sans-serif', color: seasonTextColors[seed.season] || '#666' })

    if (!seed.unlocked) {
      ctx.fillStyle = '#f3f4f6'
      drawRoundRect(ctx, x + cardWidth - 55, y + 10, 45, 18, 9)
      ctx.fill()
      drawText(ctx, '待解锁', x + cardWidth - 32, y + 20, { align: 'center', font: '10px sans-serif', color: '#999' })
    } else if (seed.rare) {
      ctx.fillStyle = '#f3e8ff'
      drawRoundRect(ctx, x + cardWidth - 50, y + 10, 40, 18, 9)
      ctx.fill()
      drawText(ctx, '稀有', x + cardWidth - 30, y + 20, { align: 'center', font: '10px sans-serif', color: '#a855f7' })
    }

    ctx.globalAlpha = seed.unlocked ? 1 : 0.5
    drawText(ctx, seed.emoji, x + cardWidth/2, y + 65, { align: 'center', font: '48px sans-serif' })
    ctx.globalAlpha = 1

    drawText(ctx, seed.name, x + cardWidth/2, y + 105, { align: 'center', font: 'bold 14px sans-serif', color: seed.unlocked ? '#333' : '#999' })
    drawText(ctx, seed.time, x + cardWidth/2, y + 120, { align: 'center', font: '10px sans-serif', color: '#999' })

    if (seed.rare && seed.unlocked) {
      drawText(ctx, '\u{1F48E}', x + 15, y + 145, { font: '12px sans-serif' })
      drawText(ctx, `${seed.price}`, x + 30, y + 145, { font: 'bold 12px sans-serif', color: '#2563eb' })
    } else {
      drawText(ctx, '\u{1F4B0}', x + 15, y + 145, { font: '12px sans-serif' })
      drawText(ctx, `${seed.price}`, x + 30, y + 145, { font: 'bold 12px sans-serif', color: '#b45309' })
    }

    const btnColor = seed.unlocked ? (seed.rare ? '#f59e0b' : '#c9305a') : '#d1d5db'
    const btnText = seed.unlocked ? (seed.rare ? '兑换' : '购买') : '锁定'
    ctx.fillStyle = btnColor
    drawRoundRect(ctx, x + cardWidth - 60, y + 132, 50, 24, 12)
    ctx.fill()
    drawText(ctx, btnText, x + cardWidth - 35, y + 146, { align: 'center', font: '11px sans-serif', color: '#fff' })
  })

  const inventoryY = screenHeight - 155
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  drawRoundRect(ctx, 15, inventoryY, screenWidth - 30, 60, 16)
  ctx.fill()
  drawCircle(ctx, 45, inventoryY + 30, 22, '#fce7eb')
  drawText(ctx, '\u{1F4E6}', 45, inventoryY + 30, { align: 'center', font: '22px sans-serif' })
  drawText(ctx, '我的库存', 80, inventoryY + 22, { font: 'bold 14px sans-serif', color: '#333' })
  drawText(ctx, '已拥有 12 颗种子', 80, inventoryY + 42, { font: '11px sans-serif', color: '#666' })
  drawText(ctx, '>', screenWidth - 35, inventoryY + 30, { align: 'center', font: 'bold 16px sans-serif', color: '#ccc' })

  drawTopMenu(ctx, screenWidth, screenHeight)
}

function handleSeedShopTouch(x, y, render) {
  const GameState = getGameState()
  
  const seeds = [
    { name: '桃花', price: 20, unlocked: true, plantType: 'peach' },
    { name: '西瓜', price: 30, unlocked: false, plantType: 'watermelon' },
    { name: '菊花', price: 25, unlocked: false, plantType: 'chrysanthemum' },
    { name: '梅花', price: 35, unlocked: false, plantType: 'peach' }
  ]
  
  const cardWidth = (screenWidth - 45) / 2
  const cardHeight = 140
  
  seeds.forEach((seed, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const cardX = 15 + col * (cardWidth + 15)
    const cardY = 185 + row * (cardHeight + 15)
    
    if (x >= cardX && x <= cardX + cardWidth &&
        y >= cardY && y <= cardY + cardHeight) {
      if (seed.unlocked && (GameState.gold || 0) >= seed.price) {
        GameState.gold = (GameState.gold || 0) - seed.price
        GameState.selectedSeed = seed.plantType
        wx.showToast({ title: `购买${seed.name}成功！`, icon: 'success' })
        GameState.currentScene = 'garden'
      } else if (!seed.unlocked) {
        wx.showToast({ title: `${seed.name}还未解锁`, icon: 'none' })
      } else {
        wx.showToast({ title: '金币不足', icon: 'none' })
      }
      render()
      return
    }
  })
}

module.exports = {
  renderSeedShop,
  handleSeedShopTouch
}