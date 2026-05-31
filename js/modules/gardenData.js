// 花园数据
const { getGlobal } = require('./globals')

// 动态获取全局变量
function getScreenWidth() {
  return getGlobal('screenWidth', 375)
}

function getScreenHeight() {
  return getGlobal('screenHeight', 667)
}

const MAP_CONFIG = { SIZE: 4 }

const GardenData = {
  plots: [],
  pet: { x: -50, y: 350, speed: 0.5, footprints: [] },
  plotPositions: [],
  petals: [],
  plotAnimations: {},
  maturePlots: {}, // 成熟作物动画状态
  
  initPlots() {
    this.plots = []
    this.pet.footprints = []
    this.petals = []
    this.plotAnimations = {}
    this.maturePlots = {}
    
    for (let row = 0; row < MAP_CONFIG.SIZE; row++) {
      const rowPlots = []
      for (let col = 0; col < MAP_CONFIG.SIZE; col++) {
        rowPlots.push({
          plant: null,
          stage: 'empty',
          progress: 0,
          timeLeft: 0,
          row: row,
          col: col
        })
      }
      this.plots.push(rowPlots)
    }
    
    this.initPetals()
  },
  
  initPetals() {
    const screenWidth = getScreenWidth()
    const screenHeight = getScreenHeight()
    this.petals = []
    for (let i = 0; i < 20; i++) {
      this.petals.push({
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight - screenHeight,
        size: Math.random() * 10 + 8,
        speed: Math.random() * 1.2 + 0.4,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2 - 1,
        opacity: Math.random() * 0.3 + 0.2,
        color: ['#f4a9ba', '#ec7895', '#f9d0d9', '#fce7eb', '#fda4af'][Math.floor(Math.random() * 5)]
      })
    }
  },
  
  updatePetals() {
    const screenWidth = getScreenWidth()
    const screenHeight = getScreenHeight()
    this.petals.forEach(petal => {
      petal.y += petal.speed
      petal.rotation += petal.rotationSpeed
      
      if (petal.y > screenHeight + 20) {
        petal.y = -20
        petal.x = Math.random() * screenWidth
      }
    })
  },
  
  drawPetals(ctx) {
    this.petals.forEach(petal => {
      ctx.save()
      ctx.translate(petal.x, petal.y)
      ctx.rotate(petal.rotation * Math.PI / 180)
      ctx.globalAlpha = petal.opacity
      
      ctx.fillStyle = petal.color
      ctx.beginPath()
      ctx.ellipse(0, 0, petal.size / 2, petal.size / 3, 0, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })
  },
  
  addFootprint(x, y) {
    this.pet.footprints.push({
      x: x,
      y: y,
      opacity: 0.6,
      size: 12
    })
    
    if (this.pet.footprints.length > 20) {
      this.pet.footprints.shift()
    }
  },
  
  updateFootprints() {
    this.pet.footprints.forEach(footprint => {
      footprint.opacity -= 0.01
      footprint.size *= 0.99
    })
    
    this.pet.footprints = this.pet.footprints.filter(fp => fp.opacity > 0)
  },
  
  drawFootprints(ctx) {
    this.pet.footprints.forEach(footprint => {
      ctx.save()
      ctx.globalAlpha = footprint.opacity
      ctx.fillStyle = '#8b7355'
      ctx.beginPath()
      ctx.arc(footprint.x, footprint.y, footprint.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
  },
  
  startPlotAnimation(row, col) {
    const key = `${row}-${col}`
    this.plotAnimations[key] = {
      scale: 0.95,
      startTime: Date.now()
    }
  },
  
  updatePlotAnimations() {
    Object.keys(this.plotAnimations).forEach(key => {
      const anim = this.plotAnimations[key]
      const elapsed = Date.now() - anim.startTime
      
      if (elapsed < 100) {
        anim.scale = 0.95 + (elapsed / 100) * 0.05
      } else {
        delete this.plotAnimations[key]
      }
    })
  },
  
  updateMaturePlots() {
    this.plots.forEach((row, rowIndex) => {
      row.forEach((plot, colIndex) => {
        if (plot.plant && plot.stage === 'mature') {
          const key = `${rowIndex}-${colIndex}`
          if (!this.maturePlots[key]) {
            this.maturePlots[key] = {
              startTime: Date.now(),
              visible: true
            }
          }
        } else {
          const key = `${rowIndex}-${colIndex}`
          if (this.maturePlots[key]) {
            delete this.maturePlots[key]
          }
        }
      })
    })
  },
  
  updatePlots() {
    this.plots.forEach((row) => {
      row.forEach((plot) => {
        if (plot.plant && plot.stage !== 'mature') {
          // 减少剩余时间
          plot.timeLeft = Math.max(0, plot.timeLeft - 1)
          
          // 计算进度（使用种植时设置的总时间）
          const totalTime = 60 // 1分钟
          plot.progress = Math.min(100, Math.floor((totalTime - plot.timeLeft) / totalTime * 100))
          
          // 根据进度更新阶段
          if (plot.progress >= 100) {
            plot.stage = 'mature'
          } else if (plot.progress >= 75) {
            plot.stage = 'growing'
          } else if (plot.progress >= 25) {
            plot.stage = 'seedling'
          }
        }
      })
    })
  }
}

module.exports = GardenData