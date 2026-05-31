// 节气花园 - 小游戏主入口
const CONFIG = require('./js/config.js')

wx.cloud.init({
  env: CONFIG.cloud.envId,
  traceUser: CONFIG.cloud.traceUser
})

// 游戏全局数据
const globalData = {
  userInfo: null,
  currentSolarTerm: getCurrentSolarTerm(),
  systemInfo: wx.getSystemInfoSync()
}

// 获取当前节气
function getCurrentSolarTerm() {
  const solarTerms = [
    { name: '立春', month: 2, day: 4 },
    { name: '雨水', month: 2, day: 19 },
    { name: '惊蛰', month: 3, day: 5 },
    { name: '春分', month: 3, day: 21 },
    { name: '清明', month: 4, day: 5 },
    { name: '谷雨', month: 4, day: 20 },
    { name: '立夏', month: 5, day: 5 },
    { name: '小满', month: 5, day: 21 },
    { name: '芒种', month: 6, day: 6 },
    { name: '夏至', month: 6, day: 21 },
    { name: '小暑', month: 7, day: 7 },
    { name: '大暑', month: 7, day: 22 },
    { name: '立秋', month: 8, day: 7 },
    { name: '处暑', month: 8, day: 23 },
    { name: '白露', month: 9, day: 7 },
    { name: '秋分', month: 9, day: 23 },
    { name: '寒露', month: 10, day: 8 },
    { name: '霜降', month: 10, day: 23 },
    { name: '立冬', month: 11, day: 7 },
    { name: '小雪', month: 11, day: 22 },
    { name: '大雪', month: 12, day: 7 },
    { name: '冬至', month: 12, day: 22 },
    { name: '小寒', month: 1, day: 6 },
    { name: '大寒', month: 1, day: 20 }
  ]
  
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  
  for (let i = solarTerms.length - 1; i >= 0; i--) {
    const term = solarTerms[i]
    if (month > term.month || (month === term.month && day >= term.day)) {
      return term.name
    }
  }
  return '立春'
}

// 导出全局数据
GameGlobal.globalData = globalData
GameGlobal.getCurrentSolarTerm = getCurrentSolarTerm

// 游戏启动
try {
  require('./js/main.js')
} catch (e) {
  console.log('Main module not found, using default page navigation')
}
