// 节气花园 - 社区模块

const { drawRoundRect, drawCircle, drawText, drawBackButton, drawTopMenu, getGlobal } = require('./globals')

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

function renderCommunityPage(ctx, screenWidth, screenHeight) {
  const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight)
  bgGradient.addColorStop(0, '#fdf2f4')
  bgGradient.addColorStop(0.5, '#fce7eb')
  bgGradient.addColorStop(1, '#f9d0d9')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  drawRoundRect(ctx, 0, 50, screenWidth, 70, 0)
  ctx.fill()

  drawText(ctx, '花园社区', screenWidth/2, 85, { align: 'center', font: 'bold 20px sans-serif', color: '#333' })

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  drawRoundRect(ctx, 15, 130, screenWidth - 30, 45, 22)
  ctx.fill()
  drawText(ctx, '\u{1F50D}', 40, 155, { align: 'center', font: '16px sans-serif', color: '#999' })
  drawText(ctx, '搜索花园、玩家...', 70, 155, { font: '14px sans-serif', color: '#999' })

  const features = [
    { icon: '\u{1F3C6}', text: '排行榜', color: '#fef3c7' },
    { icon: '\u{1F465}', text: '好友', color: '#dbeafe' },
    { icon: '\u{1F4E2}', text: '公告', color: '#fce7eb' },
    { icon: '\u{1F4AC}', text: '论坛', color: '#dcfce7' }
  ]

  features.forEach((feature, i) => {
    const x = 30 + i * (screenWidth - 60) / 4
    drawCircle(ctx, x + 30, 210, 30, feature.color)
    drawText(ctx, feature.icon, x + 30, 210, { align: 'center', font: '24px sans-serif' })
    drawText(ctx, feature.text, x + 30, 255, { align: 'center', font: '11px sans-serif', color: '#666' })
  })

  drawText(ctx, '热门动态', 20, 290, { font: 'bold 16px sans-serif', color: '#333' })
  drawText(ctx, '更多 >', screenWidth - 20, 290, { align: 'right', font: '12px sans-serif', color: '#c9305a' })

  const posts = [
    { name: '花间小筑', avatar: '\u{1F338}', time: '2分钟前', content: '我的桃花终于开花啦！\u{1F338}\u{1F338}', likes: 128, comments: 23 },
    { name: '绿野仙踪', avatar: '\u{1F340}', time: '5分钟前', content: '分享一个防虫小技巧，超实用！', likes: 89, comments: 15 },
    { name: '春风十里', avatar: '\u{1F33C}', time: '10分钟前', content: '今天的花园特别美，晒个图~', likes: 256, comments: 45 }
  ]

  posts.forEach((post, i) => {
    const y = 310 + i * 110

    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    drawRoundRect(ctx, 15, y, screenWidth - 30, 100, 12)
    ctx.fill()

    drawCircle(ctx, 45, y + 35, 20, '#fce7eb')
    drawText(ctx, post.avatar, 45, y + 35, { align: 'center', font: '20px sans-serif' })

    drawText(ctx, post.name, 75, y + 25, { font: 'bold 13px sans-serif', color: '#333' })
    drawText(ctx, post.time, 75, y + 42, { font: '10px sans-serif', color: '#999' })

    drawText(ctx, post.content, 30, y + 70, { font: '12px sans-serif', color: '#666' })

    drawText(ctx, '\u{2764} ' + post.likes, 30, y + 90, { font: '11px sans-serif', color: '#ef4444' })
    drawText(ctx, '\u{1F4AC} ' + post.comments, 100, y + 90, { font: '11px sans-serif', color: '#666' })
    drawText(ctx, '\u{1F4E4}', screenWidth - 45, y + 90, { align: 'center', font: '14px sans-serif', color: '#666' })
  })

  drawTopMenu(ctx, screenWidth, screenHeight)
  
  // 返回按钮（置于最上层）
  drawBackButton(ctx)
}

function handleCommunityTouch(x, y) {
  const tabs = ['最新', '热门', '我的']
  tabs.forEach((tab, i) => {
    const tabX = 30 + i * 100
    if (x >= tabX && x <= tabX + 60 &&
        y >= 115 && y <= 147) {
      wx.showToast({ title: `切换到${tab}`, icon: 'none' })
      return
    }
  })

  const posts = [
    { title: '我的桃花终于开花了！', user: '花园小仙子' },
    { title: '分享一个快速生长技巧', user: '种植达人' }
  ]

  posts.forEach((post, i) => {
    const cardY = 180 + i * 160
    if (x >= 15 && x <= screenWidth - 15 &&
        y >= cardY && y <= cardY + 145) {
      wx.showModal({
        title: post.title,
        content: `作者：${post.user}\n\n点击了帖子详情`,
        showCancel: false
      })
      return
    }
  })

  const fabX = screenWidth - 70
  const fabY = screenHeight - 140
  if (x >= fabX && x <= fabX + 50 &&
      y >= fabY && y <= fabY + 50) {
    wx.showModal({
      title: '发布心得',
      editable: true,
      placeholderText: '分享你的种植心得...',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showToast({ title: '发布成功！', icon: 'success' })
        }
      }
    })
  }
}

module.exports = {
  renderCommunityPage,
  handleCommunityTouch
}