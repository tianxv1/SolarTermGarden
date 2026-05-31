// 节气花园 - 音效管理模块

// 使用安全的全局变量获取方式
const { getGameState, getGlobal } = require('./globals')

// 音效管理器
const AudioManager = {
  // 音效状态
  enabled: true,
  musicEnabled: true,
  volume: 0.7,
  musicVolume: 0.5,
  
  // 音频对象
  bgMusic: null,
  soundEffects: {},
  
  // 音频文件路径
  audioFiles: {
    bgMusic: 'assets/audio/bgm.mp3',
    click: 'assets/audio/click.mp3',
    coin: 'assets/audio/coin.mp3',
    water: 'assets/audio/water.mp3',
    magic: 'assets/audio/magic.mp3',
    crow: 'assets/audio/crow.mp3',
    cat: 'assets/audio/cat.mp3',
    dog: 'assets/audio/dog.mp3',
    owl: 'assets/audio/owl.mp3'
  },
  
  // 初始化音效系统
  init() {
    try {
      // 检查是否在微信环境中
      const isWxEnv = typeof wx !== 'undefined' && typeof wx.createInnerAudioContext === 'function'
      
      if (!isWxEnv) {
        console.log('非微信环境，跳过音频初始化')
        return
      }
      
      // 初始化背景音乐
      this.bgMusic = wx.createInnerAudioContext()
      this.bgMusic.src = this.audioFiles.bgMusic
      this.bgMusic.loop = true
      this.bgMusic.volume = this.musicVolume
      
      // 监听背景音乐事件
      this.bgMusic.onEnded(() => {
        if (this.musicEnabled && this.bgMusic) {
          try {
            this.bgMusic.play()
          } catch (e) {}
        }
      })
      
      this.bgMusic.onError((res) => {
        console.warn('背景音乐加载失败(文件可能不存在):', res.errMsg)
      })
      
      // 预加载音效文件（带错误处理）
      this.preloadSoundEffects()
      
      // 从本地存储加载音效设置
      this.loadSettings()
      
    } catch (error) {
      console.warn('音效系统初始化失败:', error)
    }
  },
  
  // 预加载音效文件
  preloadSoundEffects() {
    const soundNames = ['click', 'coin', 'water', 'magic', 'crow', 'cat', 'dog', 'owl']
    
    soundNames.forEach(name => {
      try {
        const audio = wx.createInnerAudioContext()
        audio.src = this.audioFiles[name]
        audio.volume = this.volume
        this.soundEffects[name] = audio
        
        audio.onError((res) => {
          console.warn(`${name}音效加载失败(文件可能不存在):`, res.errMsg)
          this.soundEffects[name] = { 
            stop: function() {}, 
            play: function() {},
            volume: 0
          }
        })
      } catch (error) {
        console.warn(`加载${name}音效失败:`, error)
        this.soundEffects[name] = { 
          stop: function() {}, 
          play: function() {},
          volume: 0
        }
      }
    })
  },
  
  // 播放背景音乐
  playBackgroundMusic() {
    if (!this.musicEnabled || !this.bgMusic) return
    
    try {
      this.bgMusic.play()
    } catch (error) {
      console.warn('播放背景音乐失败:', error)
    }
  },
  
  // 停止背景音乐
  stopBackgroundMusic() {
    if (!this.bgMusic) return
    
    try {
      this.bgMusic.stop()
    } catch (error) {
      console.warn('停止背景音乐失败:', error)
    }
  },
  
  // 暂停背景音乐
  pauseBackgroundMusic() {
    if (!this.bgMusic) return
    
    try {
      this.bgMusic.pause()
    } catch (error) {
      console.warn('暂停背景音乐失败:', error)
    }
  },
  
  // 播放音效
  playSound(soundName) {
    if (!this.enabled || !this.soundEffects[soundName]) return
    
    try {
      const audio = this.soundEffects[soundName]
      if (typeof audio.stop === 'function') audio.stop()
      if (typeof audio.play === 'function') audio.play()
    } catch (error) {
      console.warn(`播放${soundName}音效失败:`, error)
    }
  },
  
  // 播放点击音效
  playClick() {
    this.playSound('click')
  },
  
  // 播放收获音效
  playCoin() {
    this.playSound('coin')
  },
  
  // 播放浇水音效
  playWater() {
    this.playSound('water')
  },
  
  // 播放施肥音效
  playMagic() {
    this.playSound('magic')
  },
  
  // 播放乌鸦音效
  playCrow() {
    this.playSound('crow')
  },
  
  // 播放宠物叫声
  playPetSound(petType) {
    const petSounds = {
      cat: 'cat',
      dog: 'dog',
      owl: 'owl'
    }
    
    const soundName = petSounds[petType] || 'cat'
    this.playSound(soundName)
  },
  
  // 设置音效开关
  setSoundEnabled(enabled) {
    this.enabled = enabled
    this.saveSettings()
  },
  
  // 设置背景音乐开关
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled
    
    if (enabled) {
      this.playBackgroundMusic()
    } else {
      this.pauseBackgroundMusic()
    }
    
    this.saveSettings()
  },
  
  // 设置音量
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    
    Object.values(this.soundEffects).forEach(audio => {
      if (typeof audio.volume === 'number') {
        audio.volume = this.volume
      }
    })
    
    this.saveSettings()
  },
  
  // 设置背景音乐音量
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    
    if (this.bgMusic && typeof this.bgMusic.volume === 'number') {
      this.bgMusic.volume = this.musicVolume
    }
    
    this.saveSettings()
  },
  
  // 保存设置到本地存储
  saveSettings() {
    try {
      if (typeof wx !== 'undefined' && typeof wx.setStorageSync === 'function') {
        wx.setStorageSync('audioSettings', {
          enabled: this.enabled,
          musicEnabled: this.musicEnabled,
          volume: this.volume,
          musicVolume: this.musicVolume
        })
      }
    } catch (error) {
      console.warn('保存音效设置失败:', error)
    }
  },
  
  // 从本地存储加载设置
  loadSettings() {
    try {
      if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') {
        const settings = wx.getStorageSync('audioSettings')
        
        if (settings) {
          this.enabled = settings.enabled !== undefined ? settings.enabled : true
          this.musicEnabled = settings.musicEnabled !== undefined ? settings.musicEnabled : true
          this.volume = settings.volume !== undefined ? settings.volume : 0.7
          this.musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.5
          
          if (this.bgMusic && typeof this.bgMusic.volume === 'number') {
            this.bgMusic.volume = this.musicVolume
          }
          
          Object.values(this.soundEffects).forEach(audio => {
            if (typeof audio.volume === 'number') {
              audio.volume = this.volume
            }
          })
        }
      }
    } catch (error) {
      console.warn('加载音效设置失败:', error)
    }
  },
  
  // 销毁音频对象
  destroy() {
    try {
      if (this.bgMusic) {
        this.bgMusic.destroy()
      }
      
      Object.values(this.soundEffects).forEach(audio => {
        if (typeof audio.destroy === 'function') {
          audio.destroy()
        }
      })
      
      this.bgMusic = null
      this.soundEffects = {}
    } catch (error) {
      console.warn('销毁音效系统失败:', error)
    }
  }
}

// 初始化音效系统
AudioManager.init()

module.exports = AudioManager