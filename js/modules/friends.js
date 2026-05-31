// 节气花园 - 好友系统模块
// 好友申请、列表、访问花园

const { callWithFallback } = require('./fallback')

const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
}

const MAX_FRIENDS = 100
const MAX_PENDING_REQUESTS = 50

const ACHIEVEMENT_FRIENDS = {
  first: { id: 'friend_first', name: '社交达人', description: '添加了第一个好友', icon: '🤝' },
  ten: { id: 'friend_10', name: '交友广泛', description: '添加了10个好友', icon: '👥' },
  fifty: { id: 'friend_50', name: '人脉王', description: '添加了50个好友', icon: '🌟' }
}

class FriendsManager {
  constructor() {
    this.currentUserId = null
    this.friends = []
    this.pendingRequests = []
    this.listeners = {}
  }

  setCurrentUser(openid) {
    this.currentUserId = openid
  }

  async loadFriends() {
    if (!this.currentUserId) return { success: false, message: '未登录' }

    try {
      const result = await callWithFallback({
        name: 'getFriends',
        data: { userId: this.currentUserId }
      })

      if (result.success) {
        this.friends = result.friends || []
        this.pendingRequests = result.pendingRequests || []
        this.notifyListeners('friendsUpdated', { friends: this.friends })
        return { success: true, friends: this.friends }
      }

      return { success: false, message: result.message || '加载失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async sendFriendRequest(targetOpenid) {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    if (targetOpenid === this.currentUserId) {
      return { success: false, message: '不能添加自己为好友' }
    }

    if (this.friends.length >= MAX_FRIENDS) {
      return { success: false, message: `好友数量已达上限(${MAX_FRIENDS})` }
    }

    const existingRequest = this.pendingRequests.find(
      r => r.from === targetOpenid || r.to === targetOpenid
    )
    if (existingRequest) {
      return { success: false, message: '已发送过请求或已是好友' }
    }

    try {
      const result = await callWithFallback({
        name: 'sendFriendRequest',
        data: {
          from: this.currentUserId,
          to: targetOpenid
        }
      })

      if (result.success) {
        this.pendingRequests.push({
          id: result.requestId,
          from: this.currentUserId,
          to: targetOpenid,
          status: FRIEND_REQUEST_STATUS.PENDING,
          createTime: Date.now()
        })
        this.notifyListeners('requestSent', { targetOpenid })
        return { success: true, requestId: result.requestId }
      }

      return { success: false, message: result.message || '发送失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async acceptFriendRequest(requestId) {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    try {
      const result = await callWithFallback({
        name: 'acceptFriendRequest',
        data: {
          requestId,
          userId: this.currentUserId
        }
      })

      if (result.success) {
        const request = this.pendingRequests.find(r => r.id === requestId)
        if (request) {
          request.status = FRIEND_REQUEST_STATUS.ACCEPTED
        }
        await this.loadFriends()
        this.notifyListeners('requestAccepted', { requestId })
        return { success: true }
      }

      return { success: false, message: result.message || '操作失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async rejectFriendRequest(requestId) {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    try {
      const result = await callWithFallback({
        name: 'rejectFriendRequest',
        data: {
          requestId,
          userId: this.currentUserId
        }
      })

      if (result.success) {
        const index = this.pendingRequests.findIndex(r => r.id === requestId)
        if (index >= 0) {
          this.pendingRequests.splice(index, 1)
        }
        this.notifyListeners('requestRejected', { requestId })
        return { success: true }
      }

      return { success: false, message: result.message || '操作失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async removeFriend(friendOpenid) {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    try {
      const result = await callWithFallback({
        name: 'removeFriend',
        data: {
          userId: this.currentUserId,
          friendId: friendOpenid
        }
      })

      if (result.success) {
        const index = this.friends.findIndex(f => f.openid === friendOpenid)
        if (index >= 0) {
          this.friends.splice(index, 1)
        }
        this.notifyListeners('friendRemoved', { friendOpenid })
        return { success: true }
      }

      return { success: false, message: result.message || '删除失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async visitFriendGarden(friendOpenid) {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    try {
      const result = await callWithFallback({
        name: 'getFriendGarden',
        data: {
          userId: this.currentUserId,
          friendId: friendOpenid
        }
      })

      if (result.success) {
        this.notifyListeners('gardenVisited', { friendOpenid, data: result.data })
        return {
          success: true,
          garden: result.data.garden,
          pet: result.data.pet,
          owner: result.data.owner
        }
      }

      return { success: false, message: result.message || '访问失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async searchUsers(keyword, limit = 20) {
    if (!this.currentUserId) {
      return { success: false, message: '未登录' }
    }

    if (!keyword || keyword.length < 2) {
      return { success: false, message: '搜索关键词至少2个字符' }
    }

    try {
      const result = await callWithFallback({
        name: 'searchUsers',
        data: {
          keyword,
          limit,
          excludeId: this.currentUserId
        }
      })

      if (result.success) {
        return { success: true, users: result.users }
      }

      return { success: false, message: result.message || '搜索失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  isFriend(openid) {
    return this.friends.some(f => f.openid === openid)
  }

  getFriends() {
    return this.friends
  }

  getPendingRequests() {
    return this.pendingRequests.filter(
      r => r.to === this.currentUserId && r.status === FRIEND_REQUEST_STATUS.PENDING
    )
  }

  getPendingRequestsCount() {
    return this.getPendingRequests().length
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
          console.error('[FriendsManager] Listener error:', e)
        }
      })
    }
  }
}

const friendsManager = new FriendsManager()

function renderFriendsList(ctx, screenWidth, screenHeight, options = {}) {
  const {
    friends = [],
    onVisit,
    onRemove,
    onChat,
    scrollY = 0
  } = options

  const itemHeight = 70
  const startY = 130
  const visibleCount = Math.ceil((screenHeight - startY - 100) / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollY / itemHeight))
  const endIndex = Math.min(friends.length, startIndex + visibleCount)

  friends.slice(startIndex, endIndex).forEach((friend, i) => {
    const y = startY + (i * itemHeight) - scrollY
    const isOnline = friend.lastActive && (Date.now() - friend.lastActive) < 300000

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    roundRect(ctx, 15, y, screenWidth - 30, itemHeight - 10, 12)
    ctx.fill()

    ctx.fillStyle = friend.avatarUrl ? '#fce7eb' : '#e5e7eb'
    ctx.beginPath()
    ctx.arc(45, y + itemHeight / 2 - 5, 22, 0, Math.PI * 2)
    ctx.fill()

    if (friend.avatarUrl) {
      const avatarImg = wx.createImage()
      avatarImg.src = friend.avatarUrl
    } else {
      ctx.font = '24px sans-serif'
      ctx.fillText('👤', 45, y + itemHeight / 2)
    }

    ctx.fillStyle = '#333'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(friend.nickName || '匿名用户', 80, y + 22)

    ctx.font = '12px sans-serif'
    ctx.fillStyle = isOnline ? '#22c55e' : '#999'
    ctx.fillText(isOnline ? '在线' : '离线', 80, y + 40)

    if (isOnline) {
      ctx.fillStyle = '#22c55e'
      ctx.beginPath()
      ctx.arc(95, y + 37, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    const btnX = screenWidth - 100
    ctx.fillStyle = '#c9305a'
    roundRect(ctx, btnX, y + 15, 70, 28, 14)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('访问', btnX + 35, y + 34)
  })

  return {
    itemHeight,
    totalHeight: friends.length * itemHeight,
    startIndex,
    endIndex
  }
}

function renderFriendRequestDialog(ctx, screenWidth, screenHeight, request) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  const dialogWidth = screenWidth - 60
  const dialogHeight = 200
  const dialogX = 30
  const dialogY = (screenHeight - dialogHeight) / 2

  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)'
  roundRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, 20)
  ctx.fill()

  ctx.fillStyle = '#333'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('好友请求', screenWidth / 2, dialogY + 40)

  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#666'
  ctx.fillText(`${request.fromName || '某用户'} 请求添加你为好友`, screenWidth / 2, dialogY + 80)

  const btnWidth = 100
  const btnHeight = 40
  const btnY = dialogY + 120

  ctx.fillStyle = '#22c55e'
  roundRect(ctx, screenWidth / 2 - btnWidth - 20, btnY, btnWidth, btnHeight, 20)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '14px sans-serif'
  ctx.fillText('接受', screenWidth / 2 - btnWidth / 2 - 20, btnY + 26)

  ctx.fillStyle = '#999'
  roundRect(ctx, screenWidth / 2 + 20, btnY, btnWidth, btnHeight, 20)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.fillText('拒绝', screenWidth / 2 + btnWidth / 2 + 20, btnY + 26)

  return {
    acceptBtn: { x: screenWidth / 2 - btnWidth - 20, y: btnY, width: btnWidth, height: btnHeight },
    rejectBtn: { x: screenWidth / 2 + 20, y: btnY, width: btnWidth, height: btnHeight }
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

module.exports = {
  friendsManager,
  FRIEND_REQUEST_STATUS,
  MAX_FRIENDS,
  ACHIEVEMENT_FRIENDS,
  renderFriendsList,
  renderFriendRequestDialog
}