// 节气花园 - 个人中心模块

const { drawRoundRect, drawCircle, drawText, drawProgressBar, drawBackButton, drawTopMenu, getGameState, getGlobal } = require('./globals')
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

// 设置面板状态
let settingsPanelVisible = false

function renderProfile(ctx, screenWidth, screenHeight) {
  const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight)
  bgGradient.addColorStop(0, '#fdf2f4')
  bgGradient.addColorStop(0.5, '#fce7eb')
  bgGradient.addColorStop(1, '#f9d0d9')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  drawRoundRect(ctx, 0, 50, screenWidth, 70, 0)
  ctx.fill()

  drawText(ctx, '我的', screenWidth/2, 85, { align: 'center', font: 'bold 20px sans-serif', color: '#333' })

  drawCircle(ctx, screenWidth - 35, 85, 18, 'rgba(255,255,255,0.8)')
  drawText(ctx, '\u{2699}', screenWidth - 35, 85, { align: 'center', font: '16px sans-serif', color: '#666' })

  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  drawRoundRect(ctx, 15, 130, screenWidth - 30, 120, 12)
  ctx.fill()

  drawCircle(ctx, 65, 190, 35, '#fce7eb')
  drawText(ctx, '\u{1F464}', 65, 190, { align: 'center', font: '36px sans-serif' })

  drawText(ctx, '花园小主', 120, 175, { font: 'bold 18px sans-serif', color: '#333' })
  drawText(ctx, 'LV.12', 120, 195, { font: '12px sans-serif', color: '#c9305a' })
  drawProgressBar(ctx, 120, 205, 150, 8, 65, '#e5e7eb', '#c9305a')

  ctx.fillStyle = '#c9305a'
  drawRoundRect(ctx, screenWidth - 110, 180, 80, 28, 14)
  ctx.fill()
  drawText(ctx, '编辑资料', screenWidth - 70, 196, { align: 'center', font: '11px sans-serif', color: '#fff' })

  const stats = [
    { label: '种植', value: '156' },
    { label: '收获', value: '89' },
    { label: '好友', value: '23' },
    { label: '金币', value: '1.2k' }
  ]

  stats.forEach((stat, i) => {
    const x = 30 + i * (screenWidth - 60) / 4
    drawText(ctx, stat.value, x + 25, 270, { align: 'center', font: 'bold 16px sans-serif', color: '#333' })
    drawText(ctx, stat.label, x + 25, 290, { align: 'center', font: '11px sans-serif', color: '#666' })
  })

  const menuItems = [
    { icon: '\u{1F4E6}', text: '我的背包', color: '#fce7eb' },
    { icon: '\u{1F3C6}', text: '我的成就', color: '#fef3c7' },
    { icon: '\u{1F4D6}', text: '游戏攻略', color: '#dcfce7' },
    { icon: '\u{1F4AC}', text: '帮助反馈', color: '#dbeafe' },
    { icon: '\u{1F4E4}', text: '分享给好友', color: '#fce7eb' },
    { icon: '\u{2699}', text: '设置', color: '#f3f4f6' }
  ]

  menuItems.forEach((item, i) => {
    const row = Math.floor(i / 2)
    const col = i % 2
    const x = 15 + col * (screenWidth / 2 - 7)
    const y = 320 + row * 75

    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    drawRoundRect(ctx, x, y, screenWidth/2 - 22, 65, 12)
    ctx.fill()

    drawCircle(ctx, x + 35, y + 32, 20, item.color)
    drawText(ctx, item.icon, x + 35, y + 32, { align: 'center', font: '18px sans-serif' })

    drawText(ctx, item.text, x + 70, y + 32, { font: '13px sans-serif', color: '#333' })
    drawText(ctx, '>', x + (screenWidth/2 - 35), y + 32, { align: 'center', font: 'bold 14px sans-serif', color: '#ccc' })
  })

  drawTopMenu(ctx, screenWidth, screenHeight)
  
  // 渲染设置面板
  if (settingsPanelVisible) {
    renderSettingsPanel(ctx, screenWidth, screenHeight)
  }
}

function renderSettingsPanel(ctx, screenWidth, screenHeight) {
  // 半透明遮罩
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, screenWidth, screenHeight)
  
  // 设置面板
  const panelWidth = screenWidth - 60
  const panelHeight = 300
  const panelX = 30
  const panelY = (screenHeight - panelHeight) / 2
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)'
  drawRoundRect(ctx, panelX, panelY, panelWidth, panelHeight, 16)
  ctx.fill()
  
  // 标题
  drawText(ctx, '设置', panelX + panelWidth / 2, panelY + 40, { 
    align: 'center', 
    font: 'bold 20px sans-serif', 
    color: '#333' 
  })
  
  // 设置项
  const settings = [
    { 
      label: '音效', 
      key: 'soundEnabled',
      value: AudioManager.enabled,
      icon: '\u{1F50A}'
    },
    { 
      label: '背景音乐', 
      key: 'musicEnabled',
      value: AudioManager.musicEnabled,
      icon: '\u{1F3B5}'
    },
    { 
      label: '音效音量', 
      key: 'volume',
      value: AudioManager.volume,
      icon: '\u{1F508}',
      isSlider: true
    },
    { 
      label: '音乐音量', 
      key: 'musicVolume',
      value: AudioManager.musicVolume,
      icon: '\u{1F506}',
      isSlider: true
    }
  ]
  
  settings.forEach((setting, index) => {
    const y = panelY + 80 + index * 55
    
    // 图标
    drawCircle(ctx, panelX + 35, y, 20, '#fce7eb')
    drawText(ctx, setting.icon, panelX + 35, y, { 
      align: 'center', 
      font: '18px sans-serif' 
    })
    
    // 标签
    drawText(ctx, setting.label, panelX + 70, y, { 
      font: '14px sans-serif', 
      color: '#333' 
    })
    
    if (setting.isSlider) {
      // 滑块
      const sliderX = panelX + 160
      const sliderWidth = 120
      const sliderY = y - 3
      
      // 滑块背景
      ctx.fillStyle = '#e5e7eb'
      drawRoundRect(ctx, sliderX, sliderY, sliderWidth, 6, 3)
      ctx.fill()
      
      // 滑块进度
      const progressWidth = sliderWidth * setting.value
      ctx.fillStyle = '#c9305a'
      drawRoundRect(ctx, sliderX, sliderY, progressWidth, 6, 3)
      ctx.fill()
      
      // 滑块按钮
      const buttonX = sliderX + progressWidth
      drawCircle(ctx, buttonX, sliderY + 3, 8, '#c9305a')
      
      // 音量值
      drawText(ctx, `${Math.round(setting.value * 100)}%`, panelX + panelWidth - 30, y, { 
        font: '12px sans-serif', 
        color: '#666' 
      })
    } else {
      // 开关按钮
      const switchX = panelX + panelWidth - 50
      const switchY = y - 12
      const switchWidth = 44
      const switchHeight = 24
      
      // 开关背景
      ctx.fillStyle = setting.value ? '#22c55e' : '#d1d5db'
      drawRoundRect(ctx, switchX, switchY, switchWidth, switchHeight, 12)
      ctx.fill()
      
      // 开关滑块
      const sliderOffset = setting.value ? 20 : 2
      drawCircle(ctx, switchX + sliderOffset, switchY + 12, 10, '#fff')
    }
  })
  
  // 关闭按钮
  ctx.fillStyle = '#c9305a'
  drawRoundRect(ctx, panelX + panelWidth / 2 - 60, panelY + panelHeight - 50, 120, 36, 18)
  ctx.fill()
  drawText(ctx, '关闭', panelX + panelWidth / 2, panelY + panelHeight - 32, { 
    align: 'center', 
    font: '14px sans-serif', 
    color: '#fff' 
  })
}

function handleProfileTouch(x, y, render) {
  const GameState = getGameState()
  
  // 处理设置面板触摸
  if (settingsPanelVisible) {
    handleSettingsTouch(x, y, render)
    return
  }
  
  const functions = [
    { name: '我的宠物', action: 'pet' },
    { name: '我的收藏', action: 'favorite' },
    { name: '我的心得', action: 'post' },
    { name: '节气成就', action: 'achievement' },
    { name: '邀请好友', action: 'invite' },
    { name: '设置', action: 'settings' }
  ]

  functions.forEach((func, i) => {
    const row = Math.floor(i / 2)
    const col = i % 2
    const funcX = 15 + col * (screenWidth / 2 - 7)
    const funcY = 320 + row * 75
    
    if (x >= funcX && x <= funcX + (screenWidth / 2 - 22) &&
        y >= funcY && y <= funcY + 65) {
      if (func.action === 'pet') {
        GameState.currentScene = 'pet'
        render()
      } else if (func.action === 'settings') {
        settingsPanelVisible = true
        AudioManager.playClick()
        render()
      } else {
        wx.showToast({ title: `点击了${func.name}`, icon: 'none' })
      }
    }
  })
}

function handleSettingsTouch(x, y, render) {
  const panelWidth = screenWidth - 60
  const panelHeight = 300
  const panelX = 30
  const panelY = (screenHeight - panelHeight) / 2
  
  // 检查是否点击关闭按钮
  const closeBtnX = panelX + panelWidth / 2 - 60
  const closeBtnY = panelY + panelHeight - 50
  if (x >= closeBtnX && x <= closeBtnX + 120 &&
      y >= closeBtnY && y <= closeBtnY + 36) {
    settingsPanelVisible = false
    AudioManager.playClick()
    render()
    return
  }
  
  // 检查设置项点击
  const settings = [
    { key: 'soundEnabled', isSwitch: true },
    { key: 'musicEnabled', isSwitch: true },
    { key: 'volume', isSwitch: false },
    { key: 'musicVolume', isSwitch: false }
  ]
  
  settings.forEach((setting, index) => {
    const settingY = panelY + 80 + index * 55
    
    if (y >= settingY - 15 && y <= settingY + 15) {
      if (setting.isSwitch) {
        // 处理开关
        const switchX = panelX + panelWidth - 50
        if (x >= switchX && x <= switchX + 44) {
          AudioManager.playClick()
          if (setting.key === 'soundEnabled') {
            AudioManager.setSoundEnabled(!AudioManager.enabled)
          } else if (setting.key === 'musicEnabled') {
            AudioManager.setMusicEnabled(!AudioManager.musicEnabled)
          }
          render()
        }
      } else {
        // 处理滑块
        const sliderX = panelX + 160
        const sliderWidth = 120
        if (x >= sliderX - 10 && x <= sliderX + sliderWidth + 10) {
          AudioManager.playClick()
          const newVolume = Math.max(0, Math.min(1, (x - sliderX) / sliderWidth))
          if (setting.key === 'volume') {
            AudioManager.setVolume(newVolume)
          } else if (setting.key === 'musicVolume') {
            AudioManager.setMusicVolume(newVolume)
          }
          render()
        }
      }
    }
  })
}

module.exports = {
  renderProfile,
  handleProfileTouch
}