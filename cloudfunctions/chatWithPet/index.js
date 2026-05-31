const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { petInfo, gardenInfo, userMessage, history } = event

  try {
    // 构建系统提示词
    const petTypeNames = {
      cat: '猫咪',
      dog: '狗狗',
      owl: '猫头鹰'
    }

    const personalities = {
      cat: '活泼可爱，喜欢撒娇，偶尔会调皮捣蛋，喜欢用"喵"作为语气词',
      dog: '忠诚勇敢，热情友好，总是充满活力，喜欢用"汪"作为语气词',
      owl: '智慧沉稳，观察敏锐，喜欢思考，说话有条理'
    }

    const systemPrompt = `你是一只${petTypeNames[petInfo.type]}，名字叫${petInfo.name}，生活在主人的节气花园里。
当前节气是${gardenInfo.solarTerm}，花园里有${gardenInfo.cropCount}棵作物。
你的性格特点：${personalities[petInfo.type]}。
你的状态：饱腹度${petInfo.hunger}%，精力值${petInfo.energy}%，亲密度${petInfo.intimacy}%，等级${petInfo.level}。

回答要求：
1. 回答简短有爱，不超过50个字
2. 根据当前节气、花园状况和主人心情回应
3. 可以提到花园里的东西，比如"主人，今天${gardenInfo.solarTerm}啦，花园里的花开得好美呀～"
4. 偶尔使用emoji表情
5. 保持宠物的性格特点，用第一人称说话
6. 如果主人问天气，可以结合节气给出建议
7. 如果主人问花园，可以报告作物生长情况
8. 如果主人问你是否饿了，根据饱腹度回答`

    // 构建消息历史
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ]

    // 调用AI模型
    const model = cloud.extend.AI.createModel('deepseek')
    
    const result = await model.streamText({
      data: {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.8,
        max_tokens: 100
      }
    })

    // 收集完整回复
    let fullContent = ''
    for await (const chunk of result.dataStream) {
      if (chunk.content) {
        fullContent += chunk.content
      }
    }

    return {
      success: true,
      content: fullContent || '喵~ 我在听呢，主人再说一遍好吗？'
    }

  } catch (error) {
    console.error('AI调用失败', error)
    
    // 返回默认回复
    const defaultReplies = {
      cat: ['喵~ 主人说得对！', '喵喵~ 我明白了！', '喵呜~ 好有趣呀！'],
      dog: ['汪汪！主人说得对！', '汪汪汪！我明白了！', '呜~ 好有趣呀！'],
      owl: ['咕咕~ 主人说得对！', '咕~ 我明白了！', '咕咕咕~ 好有趣呀！']
    }
    
    const replies = defaultReplies[petInfo.type] || defaultReplies.cat
    const randomReply = replies[Math.floor(Math.random() * replies.length)]
    
    return {
      success: false,
      content: randomReply,
      error: error.message
    }
  }
}
