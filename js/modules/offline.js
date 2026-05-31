// 节气花园 - 离线收益机制模块
// 上线时计算离线时段作物成长

const OFFLINE_STORAGE_KEY = 'last_online_time'
const MAX_OFFLINE_HOURS = 24
const GROWTH_RATE_MULTIPLIER = 0.5

class OfflineManager {
  constructor() {
    this.lastOnlineTime = null
    this.offlineRewards = null
  }

  recordOnlineTime() {
    const now = Date.now()
    try {
      wx.setStorageSync(OFFLINE_STORAGE_KEY, now)
    } catch (e) {
      console.error('[OfflineManager] Failed to record online time:', e)
    }
    this.lastOnlineTime = now
    return now
  }

  getLastOnlineTime() {
    if (this.lastOnlineTime === null) {
      try {
        this.lastOnlineTime = wx.getStorageSync(OFFLINE_STORAGE_KEY) || 0
      } catch (e) {
        this.lastOnlineTime = 0
      }
    }
    return this.lastOnlineTime
  }

  calculateOfflineDuration() {
    const lastTime = this.getLastOnlineTime()
    if (!lastTime) return 0

    const now = Date.now()
    const durationMs = now - lastTime
    const durationHours = durationMs / (1000 * 60 * 60)

    return Math.min(durationHours, MAX_OFFLINE_HOURS)
  }

  calculateOfflineRewards(gardenData) {
    const offlineHours = this.calculateOfflineDuration()
    if (offlineHours < 0.5) {
      this.offlineRewards = null
      return null
    }

    const rewards = {
      offlineHours: Math.floor(offlineHours),
      cropsGrown: [],
      totalGrowth: 0,
      wateredCrops: [],
      possibleHarvest: []
    }

    if (!gardenData || !gardenData.plots) {
      this.offlineRewards = rewards
      return rewards
    }

    for (let row = 0; row < gardenData.plots.length; row++) {
      for (let col = 0; col < gardenData.plots[row].length; col++) {
        const plot = gardenData.plots[row][col]

        if (plot.plant && plot.stage === 'growing') {
          const growTimeHours = plot.growTime || 72
          const growthPerHour = 100 / growTimeHours
          const offlineGrowth = growthPerHour * offlineHours * GROWTH_RATE_MULTIPLIER

          plot.progress = Math.min((plot.progress || 0) + offlineGrowth, 100)

          rewards.cropsGrown.push({
            row,
            col,
            name: plot.plant.name,
            growthAdded: offlineGrowth,
            currentProgress: plot.progress
          })
          rewards.totalGrowth += offlineGrowth

          if (plot.progress >= 100 && plot.stage !== 'harvestable') {
            plot.stage = 'harvestable'
            rewards.possibleHarvest.push({
              row,
              col,
              name: plot.plant.name
            })
          }
        }

        if (plot.plant && plot.stage !== 'empty' && plot.stage !== 'withered') {
          const timeSinceWater = plot.lastWaterTime
            ? (Date.now() - new Date(plot.lastWaterTime).getTime()) / (1000 * 60 * 60)
            : offlineHours

          if (timeSinceWater > 6) {
            const healthLoss = Math.min(offlineHours * 2, 30)
            plot.health = Math.max((plot.health || 100) - healthLoss, 0)

            rewards.wateredCrops.push({
              row,
              col,
              name: plot.plant.name,
              healthLost: healthLoss,
              currentHealth: plot.health
            })
          }
        }
      }
    }

    rewards.goldEarned = rewards.possibleHarvest.length * 10
    rewards.petEnergyUsed = Math.min(offlineHours * 2, 20)

    this.offlineRewards = rewards
    return rewards
  }

  getOfflineRewards() {
    return this.offlineRewards
  }

  applyOfflineRewards(gardenData, petData) {
    const rewards = this.offlineRewards
    if (!rewards) return { gardenData, petData }

    if (rewards.goldEarned && gardenData.gold !== undefined) {
      gardenData.gold = (gardenData.gold || 0) + rewards.goldEarned
    }

    if (petData && rewards.petEnergyUsed) {
      petData.energy = Math.max((petData.energy || 100) - rewards.petEnergyUsed, 0)
    }

    return { gardenData, petData }
  }

  formatOfflineReport(rewards) {
    if (!rewards || rewards.offlineHours < 0.5) {
      return {
        title: '欢迎回来！',
        lines: ['您离线时间太短，没有收益哦~'],
        summary: ''
      }
    }

    const lines = []

    lines.push(`您离开了 ${rewards.offlineHours} 小时`)

    if (rewards.cropsGrown.length > 0) {
      lines.push(`${rewards.cropsGrown.length} 棵作物获得了成长`)
    }

    if (rewards.possibleHarvest.length > 0) {
      lines.push(`${rewards.possibleHarvest.length} 棵作物可以收获了！`)
    }

    if (rewards.wateredCrops.length > 0) {
      lines.push(`${rewards.wateredCrops.length} 棵作物有点渴了，快去浇水吧`)
    }

    if (rewards.goldEarned > 0) {
      lines.push(`获得了 ${rewards.goldEarned} 金币离线奖励`)
    }

    const summary = rewards.possibleHarvest.length > 0
      ? '快去看看您的花园吧！'
      : rewards.wateredCrops.length > 0
        ? '记得给作物浇水哦~'
        : '作物们都在健康成长~'

    return {
      title: '离线收益报告',
      lines,
      summary
    }
  }

  clearOfflineData() {
    try {
      wx.removeStorageSync(OFFLINE_STORAGE_KEY)
    } catch (e) {
      console.error('[OfflineManager] Failed to clear offline data:', e)
    }
    this.lastOnlineTime = null
    this.offlineRewards = null
  }
}

const offlineManager = new OfflineManager()

function initOnLaunch(gardenData, petData) {
  offlineManager.recordOnlineTime()
  offlineManager.calculateOfflineRewards(gardenData)

  const rewards = offlineManager.getOfflineRewards()
  if (rewards) {
    const { gardenData: updatedGarden, petData: updatedPet } =
      offlineManager.applyOfflineRewards(gardenData, petData)
    return { gardenData: updatedGarden, petData: updatedPet, rewards }
  }

  return { gardenData, petData, rewards: null }
}

function getOfflineReport() {
  const rewards = offlineManager.getOfflineRewards()
  return offlineManager.formatOfflineReport(rewards)
}

module.exports = {
  offlineManager,
  initOnLaunch,
  getOfflineReport,
  MAX_OFFLINE_HOURS,
  GROWTH_RATE_MULTIPLIER
}