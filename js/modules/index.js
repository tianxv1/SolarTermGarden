// 节气花园 - 模块统一入口
// 集中导出所有业务模块，方便统一引入

const globals = require('./globals')
const store = require('./store')
const AudioManager = require('./audioManager')
const ImageLoader = require('./imageLoader')
const GardenData = require('./gardenData')
const dailyTasks = require('./dailyTasks')
const battle = require('./battle')
const community = require('./community')
const disease = require('./disease')
const garden = require('./garden')
const handbook = require('./handbook')
const petChat = require('./petChat')
const profile = require('./profile')
const seedShop = require('./seedShop')
const splash = require('./splash')
const fallback = require('./fallback')
const dataSync = require('./dataSync')
const tutorial = require('./tutorial')
const offline = require('./offline')
const security = require('./security')
const performance = require('./performance')
const i18n = require('./i18n')
const friends = require('./friends')
const achievement = require('./achievement')
const leaderboard = require('./leaderboard')
const tooltip = require('./tooltip')
const seasonalEvent = require('./seasonalEvent')
const feedback = require('./feedback')
const analytics = require('./analytics')
const sceneManager = require('./sceneManager')

module.exports = {
  globals,
  store,
  AudioManager,
  ImageLoader,
  GardenData,
  dailyTasks,
  battle,
  community,
  disease,
  garden,
  handbook,
  petChat,
  profile,
  seedShop,
  splash,
  fallback,
  dataSync,
  tutorial,
  offline,
  security,
  performance,
  i18n,
  friends,
  achievement,
  leaderboard,
  tooltip,
  seasonalEvent,
  feedback,
  analytics,
  sceneManager,
  getGameState: globals.getGameState,
  getGlobal: globals.getGlobal,
  getGlobals: globals.getGlobals,
  ensureGameState: globals.ensureGameState
}