const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { postId, content } = event
  const { OPENID } = cloud.getWXContext()

  try {
    const db = cloud.database()
    const _ = db.command

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

    // 创建评论
    const commentResult = await db.collection('comments').add({
      data: {
        postId,
        content,
        userId: OPENID,
        userName: userInfo.nickName,
        userAvatar: userInfo.avatarUrl,
        createTime: db.serverDate()
      }
    })

    // 更新帖子评论数
    await db.collection('posts').doc(postId).update({
      data: {
        comments: _.inc(1)
      }
    })

    return {
      success: true,
      message: '评论成功',
      commentId: commentResult._id
    }

  } catch (error) {
    console.error('添加评论失败', error)
    return {
      success: false,
      message: '评论失败：' + error.message
    }
  }
}
