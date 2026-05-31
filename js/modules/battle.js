// 节气花园 - 小游戏模块

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

// 游戏状态
const GameStateLocal = {
  currentGame: 'menu', // menu, linkgame, tugofwar
  linkGame: {
    board: [],
    selected: null,
    score: 0,
    timeLeft: 60,
    isPlaying: false
  },
  tugOfWar: {
    playerScore: 0,
    opponentScore: 0,
    round: 1,
    isPlaying: false,
    progress: 50 // 0-100，50为中间
  },
  prevScene: 'garden'
}

// 连连看方块类型
const LINK_TILE_TYPES = [
  '\u{1F331}', '\u{1F338}', '\u{1F33B}', '\u{1F349}', '\u{1F33E}', 
  '\u{1F96C}', '\u{1F34E}', '\u{1F345}', '\u{1F347}', '\u{1F34B}'
]

// 初始化游戏
function initGame(prevScene) {
  GameStateLocal.prevScene = prevScene || 'garden'
  GameStateLocal.currentGame = 'menu'
}

function renderBattlePage(ctx, screenWidth, screenHeight) {
  const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight)
  bgGradient.addColorStop(0, '#fdf2f4')
  bgGradient.addColorStop(0.5, '#fce7eb')
  bgGradient.addColorStop(1, '#f9d0d9')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  // 顶部导航栏
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  drawRoundRect(ctx, 0, 50, screenWidth, 70, 0)
  ctx.fill()

  // 返回按钮
  drawCircle(ctx, 35, 85, 18, 'rgba(255,255,255,0.8)')
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(35, 85, 18, 0, Math.PI * 2)
  ctx.stroke()
  drawText(ctx, '<', 35, 85, { align: 'center', font: 'bold 18px sans-serif', color: '#666' })

  drawText(ctx, '小游戏', screenWidth/2, 85, { align: 'center', font: 'bold 20px sans-serif', color: '#333' })

  // 根据当前游戏渲染不同内容
  if (GameStateLocal.currentGame === 'menu') {
    renderGameMenu(ctx, screenWidth, screenHeight)
  } else if (GameStateLocal.currentGame === 'linkgame') {
    renderLinkGame(ctx, screenWidth, screenHeight)
  } else if (GameStateLocal.currentGame === 'tugofwar') {
    renderTugOfWar(ctx, screenWidth, screenHeight)
  }

  drawTopMenu(ctx, screenWidth, screenHeight)
}

// 游戏菜单
function renderGameMenu(ctx, screenWidth, screenHeight) {
  // 标题
  drawText(ctx, '选择小游戏', 20, 150, { font: 'bold 18px sans-serif', color: '#333' })

  // 连连看游戏卡片
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  drawRoundRect(ctx, 15, 180, screenWidth - 30, 120, 15)
  ctx.fill()

  // 图标背景
  drawCircle(ctx, 75, 240, 40, '#fef3c7')
  drawText(ctx, '\u{1F4CC}', 75, 240, { align: 'center', font: '36px sans-serif' })

  drawText(ctx, '连连看', 140, 220, { font: 'bold 18px sans-serif', color: '#333' })
  drawText(ctx, '消除相同的植物图标', 140, 245, { font: '13px sans-serif', color: '#666' })
  drawText(ctx, '限时60秒，挑战最高分！', 140, 265, { font: '12px sans-serif', color: '#999' })

  drawText(ctx, '开始', screenWidth - 45, 240, { align: 'center', font: 'bold 14px sans-serif', color: '#c9305a' })
  drawText(ctx, '>', screenWidth - 25, 240, { align: 'center', font: 'bold 16px sans-serif', color: '#c9305a' })

  // 分隔线
  ctx.strokeStyle = '#f0f0f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(15, 310)
  ctx.lineTo(screenWidth - 15, 310)
  ctx.stroke()

  // 拔河游戏卡片
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  drawRoundRect(ctx, 15, 330, screenWidth - 30, 120, 15)
  ctx.fill()

  // 图标背景
  drawCircle(ctx, 75, 390, 40, '#dcfce7')
  drawText(ctx, '\u{1F3D1}', 75, 390, { align: 'center', font: '36px sans-serif' })

  drawText(ctx, '偷菜拔河', 140, 370, { font: 'bold 18px sans-serif', color: '#333' })
  drawText(ctx, '和对手比拼手速偷菜', 140, 395, { font: '13px sans-serif', color: '#666' })
  drawText(ctx, '3局2胜制，赢得金币！', 140, 415, { font: '12px sans-serif', color: '#999' })

  drawText(ctx, '开始', screenWidth - 45, 390, { align: 'center', font: 'bold 14px sans-serif', color: '#22c55e' })
  drawText(ctx, '>', screenWidth - 25, 390, { align: 'center', font: 'bold 16px sans-serif', color: '#22c55e' })

  // 游戏说明
  const tipsY = screenHeight - 100
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  drawRoundRect(ctx, 15, tipsY, screenWidth - 30, 70, 12)
  ctx.fill()

  drawText(ctx, '\u{2139}', 30, tipsY + 25, { font: '16px sans-serif', color: '#f59e0b' })
  drawText(ctx, '游戏提示', 50, tipsY + 25, { font: 'bold 12px sans-serif', color: '#333' })
  drawText(ctx, '连连看：点击两个相同且可连接的图标消除', 30, tipsY + 48, { font: '11px sans-serif', color: '#666' })
  drawText(ctx, '拔河：快速点击屏幕抢蔬菜，手速越快越好！', 30, tipsY + 65, { font: '11px sans-serif', color: '#666' })
}

// 连连看游戏
function renderLinkGame(ctx, screenWidth, screenHeight) {
  // 游戏信息栏
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  drawRoundRect(ctx, 15, 130, screenWidth - 30, 45, 12)
  ctx.fill()

  drawText(ctx, `\u{1F3AF} 得分: ${GameStateLocal.linkGame.score}`, 30, 152, { font: 'bold 14px sans-serif', color: '#c9305a' })
  drawText(ctx, `\u{23F1} ${GameStateLocal.linkGame.timeLeft}s`, screenWidth - 60, 152, { align: 'right', font: 'bold 14px sans-serif', color: '#ef4444' })

  // 游戏面板
  const boardTop = 190
  const cellSize = 45
  const gap = 5
  const cols = 6
  const rows = 6
  const boardWidth = cols * (cellSize + gap) - gap
  const boardX = (screenWidth - boardWidth) / 2

  // 绘制背景
  ctx.fillStyle = '#fff9e6'
  drawRoundRect(ctx, boardX - 10, boardTop - 10, boardWidth + 20, rows * (cellSize + gap) - gap + 20, 12)
  ctx.fill()

  // 绘制方块
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = GameStateLocal.linkGame.board[row][col]
      const x = boardX + col * (cellSize + gap)
      const y = boardTop + row * (cellSize + gap)

      if (tile !== null) {
        // 选中状态
        if (GameStateLocal.linkGame.selected && 
            GameStateLocal.linkGame.selected.row === row && 
            GameStateLocal.linkGame.selected.col === col) {
          ctx.fillStyle = '#fce7eb'
          ctx.strokeStyle = '#c9305a'
          ctx.lineWidth = 3
        } else {
          ctx.fillStyle = '#fff'
          ctx.strokeStyle = '#e5e5e5'
          ctx.lineWidth = 1
        }
        
        drawRoundRect(ctx, x, y, cellSize, cellSize, 8)
        ctx.fill()
        ctx.stroke()

        drawText(ctx, tile, x + cellSize/2, y + cellSize/2, { align: 'center', font: '24px sans-serif' })
      }
    }
  }

  // 操作提示
  const hintY = boardTop + rows * (cellSize + gap) + 20
  if (GameStateLocal.linkGame.isPlaying) {
    ctx.fillStyle = '#22c55e'
    drawRoundRect(ctx, 30, hintY, screenWidth - 60, 40, 20)
    ctx.fill()
    drawText(ctx, '点击两个相同的图标进行消除', screenWidth/2, hintY + 20, { align: 'center', font: 'bold 13px sans-serif', color: '#fff' })
  } else {
    ctx.fillStyle = '#c9305a'
    drawRoundRect(ctx, 30, hintY, screenWidth - 60, 40, 20)
    ctx.fill()
    drawText(ctx, '点击开始游戏', screenWidth/2, hintY + 20, { align: 'center', font: 'bold 13px sans-serif', color: '#fff' })
  }

  // 结算提示
  if (GameStateLocal.linkGame.timeLeft <= 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, screenWidth, screenHeight)
    
    ctx.fillStyle = '#fff'
    drawRoundRect(ctx, 30, screenHeight/2 - 60, screenWidth - 60, 120, 15)
    ctx.fill()
    
    drawText(ctx, '\u{1F389}', screenWidth/2, screenHeight/2 - 30, { align: 'center', font: '36px sans-serif' })
    drawText(ctx, `时间到！得分: ${GameStateLocal.linkGame.score}`, screenWidth/2, screenHeight/2 + 10, { align: 'center', font: 'bold 16px sans-serif', color: '#333' })
    drawText(ctx, `获得 ${Math.floor(GameStateLocal.linkGame.score / 10)} 金币`, screenWidth/2, screenHeight/2 + 35, { align: 'center', font: '14px sans-serif', color: '#f59e0b' })
    
    ctx.fillStyle = '#c9305a'
    drawRoundRect(ctx, 30, screenHeight/2 + 70, screenWidth - 60, 45, 22)
    ctx.fill()
    drawText(ctx, '返回', screenWidth/2, screenHeight/2 + 92, { align: 'center', font: 'bold 14px sans-serif', color: '#fff' })
  }
}

// 拔河游戏
function renderTugOfWar(ctx, screenWidth, screenHeight) {
  // 游戏信息栏
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  drawRoundRect(ctx, 15, 130, screenWidth - 30, 45, 12)
  ctx.fill()

  drawText(ctx, `第 ${GameStateLocal.tugOfWar.round} 局`, screenWidth/2, 152, { align: 'center', font: 'bold 14px sans-serif', color: '#333' })

  // 分数显示
  ctx.fillStyle = '#dbeafe'
  drawRoundRect(ctx, 20, 190, (screenWidth - 60) / 2 - 5, 50, 10)
  ctx.fill()
  drawText(ctx, '\u{1F464}', 45, 215, { align: 'center', font: '24px sans-serif' })
  drawText(ctx, `我\n${GameStateLocal.tugOfWar.playerScore}`, 100, 215, { align: 'center', font: 'bold 14px sans-serif', color: '#3b82f6' })

  ctx.fillStyle = '#fee2e2'
  drawRoundRect(ctx, screenWidth/2 + 10, 190, (screenWidth - 60) / 2 - 5, 50, 10)
  ctx.fill()
  drawText(ctx, '\u{1F479}', screenWidth - 55, 215, { align: 'center', font: '24px sans-serif' })
  drawText(ctx, `对手\n${GameStateLocal.tugOfWar.opponentScore}`, screenWidth - 100, 215, { align: 'center', font: 'bold 14px sans-serif', color: '#ef4444' })

  // 拔河绳区域
  const ropeY = 280
  ctx.fillStyle = '#fff'
  drawRoundRect(ctx, 15, ropeY, screenWidth - 30, 80, 12)
  ctx.fill()

  // 背景线
  ctx.strokeStyle = '#f0f0f0'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 5])
  ctx.beginPath()
  ctx.moveTo(screenWidth/2, ropeY + 10)
  ctx.lineTo(screenWidth/2, ropeY + 70)
  ctx.stroke()
  ctx.setLineDash([])

  // 拔河绳
  const ropeX = 30 + (screenWidth - 60) * (GameStateLocal.tugOfWar.progress / 100)
  ctx.fillStyle = '#8b4513'
  drawRoundRect(ctx, ropeX - 15, ropeY + 30, 30, 20, 10)
  ctx.fill()

  // 蔬菜图标
  drawText(ctx, '\u{1F345}', ropeX, ropeY + 40, { align: 'center', font: '18px sans-serif' })

  // 进度条
  ctx.fillStyle = '#e5e5e5'
  drawRoundRect(ctx, 30, ropeY + 85, screenWidth - 60, 8, 4)
  ctx.fill()
  
  if (GameStateLocal.tugOfWar.progress > 50) {
    ctx.fillStyle = '#22c55e'
    drawRoundRect(ctx, 30 + (screenWidth - 60) * 0.5, ropeY + 85, (screenWidth - 60) * (GameStateLocal.tugOfWar.progress - 50) / 100, 8, 4)
    ctx.fill()
  } else {
    ctx.fillStyle = '#ef4444'
    drawRoundRect(ctx, 30 + (screenWidth - 60) * GameStateLocal.tugOfWar.progress / 100, ropeY + 85, (screenWidth - 60) * (50 - GameStateLocal.tugOfWar.progress) / 100, 8, 4)
    ctx.fill()
  }

  // 操作提示
  const hintY = ropeY + 110
  if (GameStateLocal.tugOfWar.isPlaying) {
    ctx.fillStyle = '#22c55e'
    drawRoundRect(ctx, 30, hintY, screenWidth - 60, 50, 25)
    ctx.fill()
    drawText(ctx, '疯狂点击屏幕抢蔬菜！', screenWidth/2, hintY + 25, { align: 'center', font: 'bold 16px sans-serif', color: '#fff' })
  } else {
    ctx.fillStyle = '#c9305a'
    drawRoundRect(ctx, 30, hintY, screenWidth - 60, 50, 25)
    ctx.fill()
    drawText(ctx, '点击开始游戏', screenWidth/2, hintY + 25, { align: 'center', font: 'bold 16px sans-serif', color: '#fff' })
  }

  // 结算提示
  if (GameStateLocal.tugOfWar.progress <= 0 || GameStateLocal.tugOfWar.progress >= 100) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, screenWidth, screenHeight)
    
    ctx.fillStyle = '#fff'
    drawRoundRect(ctx, 30, screenHeight/2 - 70, screenWidth - 60, 140, 15)
    ctx.fill()
    
    if (GameStateLocal.tugOfWar.progress >= 100) {
      drawText(ctx, '\u{1F389}', screenWidth/2, screenHeight/2 - 40, { align: 'center', font: '40px sans-serif' })
      drawText(ctx, '本局胜利！', screenWidth/2, screenHeight/2, { align: 'center', font: 'bold 20px sans-serif', color: '#22c55e' })
    } else {
      drawText(ctx, '\u{1F614}', screenWidth/2, screenHeight/2 - 40, { align: 'center', font: '40px sans-serif' })
      drawText(ctx, '本局失败！', screenWidth/2, screenHeight/2, { align: 'center', font: 'bold 20px sans-serif', color: '#ef4444' })
    }
    
    drawText(ctx, `比分: ${GameStateLocal.tugOfWar.playerScore} - ${GameStateLocal.tugOfWar.opponentScore}`, screenWidth/2, screenHeight/2 + 30, { align: 'center', font: '14px sans-serif', color: '#666' })
    
    if (GameStateLocal.tugOfWar.playerScore >= 2 || GameStateLocal.tugOfWar.opponentScore >= 2) {
      const isWin = GameStateLocal.tugOfWar.playerScore >= 2
      drawText(ctx, isWin ? '🎉 最终胜利！' : '😢 最终失败', screenWidth/2, screenHeight/2 + 55, { align: 'center', font: 'bold 16px sans-serif', color: isWin ? '#22c55e' : '#ef4444' })
      drawText(ctx, isWin ? `获得 ${GameStateLocal.tugOfWar.playerScore * 30} 金币` : '获得 10 金币', screenWidth/2, screenHeight/2 + 75, { align: 'center', font: '14px sans-serif', color: '#f59e0b' })
    }
    
    ctx.fillStyle = '#c9305a'
    drawRoundRect(ctx, 30, screenHeight/2 + 90, screenWidth - 60, 45, 22)
    ctx.fill()
    
    const finalBtnText = (GameStateLocal.tugOfWar.playerScore >= 2 || GameStateLocal.tugOfWar.opponentScore >= 2) ? '返回' : '下一局'
    drawText(ctx, finalBtnText, screenWidth/2, screenHeight/2 + 112, { align: 'center', font: 'bold 14px sans-serif', color: '#fff' })
  }
}

// 初始化连连看游戏
function initLinkGame() {
  const cols = 6
  const rows = 6
  const totalTiles = cols * rows
  const pairCount = totalTiles / 2
  
  // 创建配对的方块
  const tiles = []
  for (let i = 0; i < pairCount; i++) {
    const type = LINK_TILE_TYPES[i % LINK_TILE_TYPES.length]
    tiles.push(type, type)
  }
  
  // 打乱顺序
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  
  // 创建二维数组
  const board = []
  let index = 0
  for (let row = 0; row < rows; row++) {
    board[row] = []
    for (let col = 0; col < cols; col++) {
      board[row][col] = tiles[index++]
    }
  }
  
  GameStateLocal.linkGame.board = board
  GameStateLocal.linkGame.selected = null
  GameStateLocal.linkGame.score = 0
  GameStateLocal.linkGame.timeLeft = 60
  GameStateLocal.linkGame.isPlaying = false
  
  // 启动计时器
  setTimeout(() => {
    startLinkGameTimer()
  }, 500)
}

// 连连看计时器
function startLinkGameTimer() {
  if (GameStateLocal.currentGame !== 'linkgame') return
  
  GameStateLocal.linkGame.isPlaying = true
  
  const timer = setInterval(() => {
    if (GameStateLocal.currentGame !== 'linkgame') {
      clearInterval(timer)
      return
    }
    
    GameStateLocal.linkGame.timeLeft--
    
    if (GameStateLocal.linkGame.timeLeft <= 0) {
      clearInterval(timer)
      // 发放奖励
      GameState.gold += Math.floor(GameStateLocal.linkGame.score / 10)
      AudioManager.playCoin()
    }
  }, 1000)
}

// 检查连连看是否可连接
function canLink(row1, col1, row2, col2, board) {
  if (row1 === row2 && col1 === col2) return false
  if (board[row1][col1] !== board[row2][col2]) return false
  
  const rows = board.length
  const cols = board[0].length
  
  // 检查直线连接
  if (row1 === row2) {
    const minCol = Math.min(col1, col2)
    const maxCol = Math.max(col1, col2)
    let canPass = true
    for (let col = minCol + 1; col < maxCol; col++) {
      if (board[row1][col] !== null) {
        canPass = false
        break
      }
    }
    if (canPass) return true
  }
  
  if (col1 === col2) {
    const minRow = Math.min(row1, row2)
    const maxRow = Math.max(row1, row2)
    let canPass = true
    for (let row = minRow + 1; row < maxRow; row++) {
      if (board[row][col1] !== null) {
        canPass = false
        break
      }
    }
    if (canPass) return true
  }
  
  // 检查一个拐点连接
  if (board[row1][col2] === null) {
    let canPass1 = true
    const minCol = Math.min(col1, col2)
    const maxCol = Math.max(col1, col2)
    for (let col = minCol + 1; col < maxCol; col++) {
      if (board[row1][col] !== null) {
        canPass1 = false
        break
      }
    }
    
    let canPass2 = true
    const minRow = Math.min(row1, row2)
    const maxRow = Math.max(row1, row2)
    for (let row = minRow + 1; row < maxRow; row++) {
      if (board[row][col2] !== null) {
        canPass2 = false
        break
      }
    }
    
    if (canPass1 && canPass2) return true
  }
  
  if (board[row2][col1] === null) {
    let canPass1 = true
    const minRow = Math.min(row1, row2)
    const maxRow = Math.max(row1, row2)
    for (let row = minRow + 1; row < maxRow; row++) {
      if (board[row][col1] !== null) {
        canPass1 = false
        break
      }
    }
    
    let canPass2 = true
    const minCol = Math.min(col1, col2)
    const maxCol = Math.max(col1, col2)
    for (let col = minCol + 1; col < maxCol; col++) {
      if (board[row2][col] !== null) {
        canPass2 = false
        break
      }
    }
    
    if (canPass1 && canPass2) return true
  }
  
  return false
}

// 初始化拔河游戏
function initTugOfWar() {
  GameStateLocal.tugOfWar.progress = 50
  GameStateLocal.tugOfWar.isPlaying = false
}

// 处理触摸事件
function handleBattleTouch(x, y) {
  // 返回按钮
  if (distance(x, y, 35, 85) <= 18) {
    GameState.currentScene = GameStateLocal.prevScene
    AudioManager.playClick()
    return
  }

  if (GameStateLocal.currentGame === 'menu') {
    // 连连看
    if (x >= 15 && x <= screenWidth - 15 && y >= 180 && y <= 300) {
      GameStateLocal.currentGame = 'linkgame'
      initLinkGame()
      AudioManager.playClick()
      return
    }
    
    // 拔河
    if (x >= 15 && x <= screenWidth - 15 && y >= 330 && y <= 450) {
      GameStateLocal.currentGame = 'tugofwar'
      initTugOfWar()
      AudioManager.playClick()
      return
    }
  } else if (GameStateLocal.currentGame === 'linkgame') {
    // 结算界面返回
    if (GameStateLocal.linkGame.timeLeft <= 0) {
      if (x >= 30 && x <= screenWidth - 30 && y >= screenHeight/2 + 70 && y <= screenHeight/2 + 115) {
        GameStateLocal.currentGame = 'menu'
        AudioManager.playClick()
        return
      }
    }
    
    if (!GameStateLocal.linkGame.isPlaying) {
      // 开始游戏
      const hintY = 190 + 6 * (45 + 5) + 20
      if (x >= 30 && x <= screenWidth - 30 && y >= hintY && y <= hintY + 40) {
        GameStateLocal.linkGame.isPlaying = true
        AudioManager.playClick()
        return
      }
    } else {
      // 点击方块
      const boardTop = 190
      const cellSize = 45
      const gap = 5
      const cols = 6
      const boardWidth = cols * (cellSize + gap) - gap
      const boardX = (screenWidth - boardWidth) / 2

      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
          const tileX = boardX + col * (cellSize + gap)
          const tileY = boardTop + row * (cellSize + gap)
          
          if (x >= tileX && x <= tileX + cellSize && y >= tileY && y <= tileY + cellSize) {
            const tile = GameStateLocal.linkGame.board[row][col]
            
            if (tile !== null) {
              if (!GameStateLocal.linkGame.selected) {
                // 第一次选择
                GameStateLocal.linkGame.selected = { row, col }
                AudioManager.playClick()
              } else {
                // 第二次选择
                const { row: prevRow, col: prevCol } = GameStateLocal.linkGame.selected
                
                if (row === prevRow && col === prevCol) {
                  // 取消选择
                  GameStateLocal.linkGame.selected = null
                } else if (canLink(prevRow, prevCol, row, col, GameStateLocal.linkGame.board)) {
                  // 消除
                  GameStateLocal.linkGame.board[prevRow][prevCol] = null
                  GameStateLocal.linkGame.board[row][col] = null
                  GameStateLocal.linkGame.score += 10
                  GameStateLocal.linkGame.selected = null
                  AudioManager.playMagic()
                } else {
                  // 选择新方块
                  GameStateLocal.linkGame.selected = { row, col }
                }
              }
            }
            return
          }
        }
      }
    }
  } else if (GameStateLocal.currentGame === 'tugofwar') {
    // 结算界面
    if (GameStateLocal.tugOfWar.progress <= 0 || GameStateLocal.tugOfWar.progress >= 100) {
      if (x >= 30 && x <= screenWidth - 30 && y >= screenHeight/2 + 90 && y <= screenHeight/2 + 135) {
        if (GameStateLocal.tugOfWar.playerScore >= 2 || GameStateLocal.tugOfWar.opponentScore >= 2) {
          // 最终结算
          if (GameStateLocal.tugOfWar.playerScore >= 2) {
            GameState.gold += GameStateLocal.tugOfWar.playerScore * 30
          } else {
            GameState.gold += 10
          }
          AudioManager.playCoin()
          GameStateLocal.currentGame = 'menu'
          GameStateLocal.tugOfWar.playerScore = 0
          GameStateLocal.tugOfWar.opponentScore = 0
          GameStateLocal.tugOfWar.round = 1
        } else {
          // 下一局
          GameStateLocal.tugOfWar.round++
          initTugOfWar()
        }
        AudioManager.playClick()
        return
      }
    }
    
    if (!GameStateLocal.tugOfWar.isPlaying) {
      // 开始游戏
      const hintY = 280 + 110
      if (x >= 30 && x <= screenWidth - 30 && y >= hintY && y <= hintY + 50) {
        startTugOfWar()
        AudioManager.playClick()
        return
      }
    } else {
      // 拔河操作 - 点击增加进度
      GameStateLocal.tugOfWar.progress = Math.min(100, GameStateLocal.tugOfWar.progress + 3)
      AudioManager.playClick()
    }
  }
}

// 开始拔河游戏
function startTugOfWar() {
  GameStateLocal.tugOfWar.isPlaying = true
  
  // 对手AI
  const aiInterval = setInterval(() => {
    if (GameStateLocal.currentGame !== 'tugofwar' || 
        GameStateLocal.tugOfWar.progress <= 0 || 
        GameStateLocal.tugOfWar.progress >= 100) {
      clearInterval(aiInterval)
      return
    }
    
    // 随机增加对手进度
    GameStateLocal.tugOfWar.progress = Math.max(0, GameStateLocal.tugOfWar.progress - (Math.random() * 2 + 1))
  }, 100)
  
  // 检查胜负
  const checkInterval = setInterval(() => {
    if (GameStateLocal.currentGame !== 'tugofwar') {
      clearInterval(checkInterval)
      return
    }
    
    if (GameStateLocal.tugOfWar.progress <= 0) {
      clearInterval(checkInterval)
      clearInterval(aiInterval)
      GameStateLocal.tugOfWar.opponentScore++
      GameStateLocal.tugOfWar.isPlaying = false
    } else if (GameStateLocal.tugOfWar.progress >= 100) {
      clearInterval(checkInterval)
      clearInterval(aiInterval)
      GameStateLocal.tugOfWar.playerScore++
      GameStateLocal.tugOfWar.isPlaying = false
    }
  }, 50)
}

// 辅助函数：计算距离
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

module.exports = {
  renderBattlePage,
  handleBattleTouch,
  initGame
}