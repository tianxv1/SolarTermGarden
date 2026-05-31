const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  
  try {
    // 获取所有用户
    const usersResult = await db.collection('users').get()
    const users = usersResult.data
    
    const results = []
    const batchSize = 10 // 每批处理10个用户，避免超时
    
    // 分批处理用户
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      // 并行处理一批用户
      const batchPromises = batch.map(async (user) => {
        return await processUser(user, db, _)
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }
    
    return {
      success: true,
      processed: results.length,
      details: results
    }
    
  } catch (error) {
    console.error('乌鸦袭击处理失败', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 处理单个用户
async function processUser(user, db, _) {
  const result = {
    userId: user._id,
    attackOccurred: false,
    protected: false,
    cropsLost: 0
  }
  
  try {
    // 30%概率发生乌鸦袭击
    if (Math.random() > 0.3) {
      return result
    }
    
    result.attackOccurred = true
    
    // 获取用户作物
    const cropsResult = await db.collection('crops').where({
      _openid: user._openid
    }).get()
    
    if (cropsResult.data.length === 0) {
      return result
    }
    
    const crops = cropsResult.data
    
    // 获取用户宠物
    const petResult = await db.collection('pets').where({
      _openid: user._openid
    }).get()
    
    let protectSuccessRate = 0
    let pet = null
    
    if (petResult.data.length > 0) {
      pet = petResult.data[0]
      protectSuccessRate = calculateProtectRate(pet)
    }
    
    // 判断是否成功保护
    const random = Math.random() * 100
    result.protected = random < protectSuccessRate
    
    if (result.protected) {
      // 保护成功
      const newEnergy = Math.max(pet.energy - 10, 0)
      const newIntimacy = Math.min(pet.intimacy + 2, 100)
      
      await db.collection('pets').doc(pet._id).update({
        data: {
          energy: newEnergy,
          intimacy: newIntimacy
        }
      })
      
      // 记录保护日志
      await db.collection('guardLogs').add({
        data: {
          userId: user._id,
          petId: pet._id,
          result: 'success',
          createTime: db.serverDate()
        }
      })
      
    } else {
      // 保护失败，损失作物
      const lostCount = Math.floor(Math.random() * 3) + 1 // 损失1-3个作物
      const cropsToRemove = crops.slice(0, Math.min(lostCount, crops.length))
      
      // 删除作物
      for (const crop of cropsToRemove) {
        await db.collection('crops').doc(crop._id).remove()
      }
      
      result.cropsLost = cropsToRemove.length
      
      // 记录损失日志
      await db.collection('guardLogs').add({
        data: {
          userId: user._id,
          petId: pet ? pet._id : null,
          result: 'failed',
          cropsLost: cropsToRemove.map(c => c.name),
          createTime: db.serverDate()
        }
      })
      
      // 发送通知给用户
      await sendNotification(user._openid, result.cropsLost)
    }
    
    return result
    
  } catch (error) {
    console.error(`处理用户 ${user._id} 失败`, error)
    result.error = error.message
    return result
  }
}

// 计算保护成功率
function calculateProtectRate(pet) {
  const baseRates = {
    cat: 50,
    dog: 60,
    owl: 70
  }
  
  const baseRate = baseRates[pet.type] || 50
  const intimacyBonus = pet.intimacy * (pet.type === 'cat' ? 0.2 : pet.type === 'dog' ? 0.3 : 0.4)
  const levelBonus = pet.level * (pet.type === 'cat' ? 5 : pet.type === 'dog' ? 6 : 7)
  
  // 精力值影响（低于30时成功率减半）
  const energyFactor = pet.energy < 30 ? 0.5 : 1
  
  const totalRate = (baseRate + intimacyBonus + levelBonus) * energyFactor
  return Math.min(totalRate, 100)
}

// 发送通知
async function sendNotification(openid, lostCount) {
  try {
    await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: 'YOUR_TEMPLATE_ID', // 替换为你的订阅消息模板ID
      data: {
        thing1: { value: '乌鸦袭击' },
        thing2: { value: `你的花园遭到乌鸦袭击，损失了${lostCount}棵作物！` },
        time3: { value: new Date().toLocaleString() }
      }
    })
  } catch (error) {
    console.error('发送通知失败', error)
  }
}
