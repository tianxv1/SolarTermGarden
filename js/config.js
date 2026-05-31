// 节气花园配置文件
// 集中管理云环境ID、API密钥等配置信息

const CONFIG = {
  cloud: {
    envId: 'cloud1-2gtojs503d49f26c',
    traceUser: true
  },
  ai: {
    model: 'deepseek',
    maxHistoryLength: 20,
    responseTimeout: 10000
  },
  game: {
    defaultGold: 100,
    maxPets: 3,
    cropGrowTimeMultiplier: 1,
    eventProbability: 0.1
  },
  database: {
    collections: {
      users: 'users',
      pets: 'pets',
      crops: 'crops',
      plants: 'plants',
      diseases: 'diseases',
      posts: 'posts',
      comments: 'comments',
      chatHistory: 'chatHistory',
      battles: 'battles',
      solarTerms: 'solarTerms',
      favorites: 'favorites',
      likes: 'likes',
      guardLogs: 'guardLogs'
    }
  }
}

module.exports = CONFIG