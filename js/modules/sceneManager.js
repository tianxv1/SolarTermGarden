// 节气花园 - 场景管理器
// 统一的场景切换和生命周期管理

const SCENES = {
  SPLASH: 'splash',
  TUTORIAL: 'tutorial',
  GARDEN: 'garden',
  SEED_SHOP: 'seedshop',
  PET_HOUSE: 'pet',
  HANDBOOK: 'handbook',
  DISEASE: 'disease',
  COMMUNITY: 'community',
  BATTLE: 'battle',
  PROFILE: 'profile',
  FRIENDS: 'friends',
  ACHIEVEMENT: 'achievement',
  LEADERBOARD: 'leaderboard',
  FEEDBACK: 'feedback',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings'
}

const SCENE_CONFIG = {
  splash: { hasBackBtn: false, hasTopMenu: false, hasBottomNav: false, animation: 'fade' },
  tutorial: { hasBackBtn: false, hasTopMenu: false, hasBottomNav: false, animation: 'slide' },
  garden: { hasBackBtn: false, hasTopMenu: true, hasBottomNav: true, animation: 'none' },
  seedshop: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  pet: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  handbook: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  disease: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  community: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  battle: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  profile: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  friends: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  achievement: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  leaderboard: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  feedback: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  analytics: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' },
  settings: { hasBackBtn: true, hasTopMenu: true, hasBottomNav: false, animation: 'slide' }
}

class SceneManager {
  constructor() {
    this.currentScene = SCENES.SPLASH
    this.previousScene = null
    this.sceneStack = []
    this.transitionProgress = 0
    this.isTransitioning = false
    this.transitionDuration = 300
    this.listeners = {}
    this.sceneData = {}
  }

  getCurrentScene() {
    return this.currentScene
  }

  getPreviousScene() {
    return this.previousScene
  }

  getSceneConfig(scene) {
    return SCENE_CONFIG[scene] || SCENE_CONFIG.garden
  }

  pushScene(scene, data = {}) {
    if (this.isTransitioning) return

    this.previousScene = this.currentScene
    this.sceneStack.push(this.currentScene)
    this.sceneData[scene] = data
    this.transitionTo(scene)
  }

  popScene() {
    if (this.isTransitioning || this.sceneStack.length === 0) return

    this.transitionTo(this.sceneStack.pop())
  }

  replaceScene(scene, data = {}) {
    if (this.isTransitioning) return

    this.previousScene = this.currentScene
    this.sceneData[scene] = data
    this.transitionTo(scene)
  }

  transitionTo(scene, options = {}) {
    const { animation = 'none', duration = 300 } = options
    const config = this.getSceneConfig(scene)

    if (config.animation !== 'none') {
      this.isTransitioning = true
      this.transitionProgress = 0
      this.transitionDuration = duration

      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        this.transitionProgress = Math.min(1, elapsed / this.transitionDuration)

        if (this.transitionProgress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.isTransitioning = false
        }
      }
      animate()
    }

    this.previousScene = this.currentScene
    this.currentScene = scene
    this.notifyListeners('sceneChanged', { scene, previousScene: this.previousScene })
  }

  goBack() {
    if (this.sceneStack.length > 0) {
      this.popScene()
    } else {
      this.transitionTo(SCENES.GARDEN)
    }
  }

  getSceneData(scene) {
    return this.sceneData[scene]
  }

  setSceneData(scene, data) {
    this.sceneData[scene] = { ...this.sceneData[scene], ...data }
  }

  isCurrentScene(scene) {
    return this.currentScene === scene
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(l => l !== listener)
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => {
        try {
          listener(data)
        } catch (e) {
          console.error('[SceneManager] Listener error:', e)
        }
      })
    }
  }
}

const sceneManager = new SceneManager()

function createSceneNavigator() {
  return {
    sceneManager,

    navigateTo(scene, data = {}) {
      sceneManager.pushScene(scene, data)
    },

    replace(scene, data = {}) {
      sceneManager.replaceScene(scene, data)
    },

    goBack() {
      sceneManager.goBack()
    },

    showAchievementPopup(achievement) {
      sceneManager.pushScene(SCENES.ACHIEVEMENT, { highlight: achievement.id, autoClose: true })
    },

    showLeaderboard(type = 'coins') {
      sceneManager.pushScene(SCENES.LEADERBOARD, { type })
    },

    showFriends() {
      sceneManager.pushScene(SCENES.FRIENDS)
    },

    showFeedback() {
      sceneManager.pushScene(SCENES.FEEDBACK)
    },

    showAnalytics() {
      sceneManager.pushScene(SCENES.ANALYTICS)
    },

    showSettings() {
      sceneManager.pushScene(SCENES.SETTINGS)
    }
  }
}

function renderSceneTransition(ctx, screenWidth, screenHeight, fromScene, toScene, progress) {
  if (progress >= 1) return

  const config = SCENE_CONFIG[toScene] || SCENE_CONFIG.garden

  if (config.animation === 'slide') {
    const offsetX = (1 - progress) * screenWidth

    ctx.save()
    ctx.globalAlpha = progress
    ctx.translate(offsetX, 0)
    ctx.restore()
  } else if (config.animation === 'fade') {
    ctx.save()
    ctx.globalAlpha = progress
    ctx.restore()
  }
}

module.exports = {
  SCENES,
  SCENE_CONFIG,
  SceneManager,
  sceneManager,
  createSceneNavigator
}