const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { title, content, images, solarTerm } = event
  const { OPENID } = cloud.getWXContext()

  try {
    const db = cloud.database()

    // 获取用户信息
    const userRes = await db.collection('users').where({
      _openid: OPENID
    }).get()

    let userInfo = {
      nickName: '匿名用户',
      avatarUrl: '/images/default-avatar.png'
    }

    if (userRes.data.length > 0) {
      userInfo = userRes.data[0]
    }

    // 敏感词过滤（简单示例）
    const sensitiveWords = ['敏感词1', '敏感词2', '广告']
    const checkText = title + content
    for (const word of sensitiveWords) {
      if (checkText.includes(word)) {
        return {
          success: false,
          message: '内容包含敏感词，请修改后重试'
        }
      }
    }

    // 创建帖子
    const result = await db.collection('posts').add({
      data: {
        title,
        content,
        images: images || [],
        solarTerm,
        userId: OPENID,
        userName: userInfo.nickName,
        userAvatar: userInfo.avatarUrl,
        likes: 0,
        comments: 0,
        status: 'active',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      message: '发布成功',
      postId: result._id
    }

  } catch (error) {
    console.error('创建帖子失败', error)
    return {
      success: false,
      message: '发布失败：' + error.message
    }
  }
}
