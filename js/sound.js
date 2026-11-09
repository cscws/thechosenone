const clips = {
  join: 'audio/scan.wav',
  payer: 'audio/paid.wav',
  escape: 'audio/free.wav'
}

function createSound(wx) {
  const players = Object.create(null)
  let active = ''

  function stop() {
    if (!active) return
    try {
      players[active].stop()
    } catch (error) {
      // 后台切换时系统可能已回收音频句柄，下次播放重新创建。
      delete players[active]
    }
    active = ''
  }

  function play(name) {
    if (!Object.prototype.hasOwnProperty.call(clips, name) ||
        !wx || typeof wx.createInnerAudioContext !== 'function') return
    stop()
    try {
      // 复用每段音效的实例；揭晓买单人时，收银机的两声响会接过免单提示音。
      let player = players[name]
      if (!player) {
        player = wx.createInnerAudioContext()
        player.obeyMuteSwitch = true
        player.volume = 0.75
        player.src = clips[name]
        players[name] = player
      }
      active = name
      player.play()
    } catch (error) {
      // 音频设备不可用时，抽签动画和结算照常进行。
      delete players[name]
      active = ''
    }
  }

  return { play, stop }
}

module.exports = { createSound }
