const { drawScreen, layout, paper } = require('./js/poster')
const { MIN_SEATS, createRound, sealDish, beginTurn, pickDish } = require('./js/round')
const { createSound } = require('./js/sound')

// 微信把第一个 createCanvas 返回的画布显示在屏幕上，后续画布均为离屏画布。
const canvas = wx.createCanvas()
const ctx = canvas.getContext('2d')
const sound = createSound(wx)
let view
let screen = 'home'
let round = null
let visible = true
let pendingFrame = null
let lastFrame = null
let posterTime = 0
let count = 4
let navTouch = null
const down = new Set()
const nextFrame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : fn => setTimeout(fn, 33)
const dropFrame = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout

function resize() {
  const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
  const w = info.windowWidth
  const h = info.windowHeight
  const ratio = Math.min(info.pixelRatio || 1, 3)
  const safe = info.safeArea || { left: 0, right: w, top: 0, bottom: h }
  const menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
  // 小游戏模拟器首次打开可能返回空胶囊对象。预留一行按钮高度，避免 NaN 传入绘图和触摸坐标。
  const statusTop = Math.max(safe.top || 0, info.statusBarHeight || 0)
  const menuBottom = menu && menu.bottom
  const top = (Number.isFinite(menuBottom) && menuBottom > statusTop ? menuBottom : statusTop + 40) + 6
  const bottom = Math.min(h, safe.bottom || h) - 5
  const left = Math.max(0, safe.left || 0)
  const right = Math.min(w, safe.right || w)
  // 矮屏整体缩放，高屏给插画更多空间；平板保持竖版海报的构图。
  const scale = Math.min((right - left) / 360, (bottom - top) / 600)
  const height = Math.min((bottom - top) / scale, 750)
  view = {
    w, h, ratio, scale, height,
    left: left + (right - left - 360 * scale) / 2,
    top: top + (bottom - top - height * scale) / 2
  }
  canvas.width = Math.round(w * ratio)
  canvas.height = Math.round(h * ratio)
}

function draw() {
  ctx.save()
  ctx.scale(view.ratio, view.ratio)
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, view.w, view.h)
  ctx.translate(view.left, view.top)
  ctx.scale(view.scale, view.scale)
  drawScreen(ctx, view.height, screen, round, posterTime, count)
  ctx.restore()
}

function schedule() {
  if (visible && pendingFrame === null) pendingFrame = nextFrame(frame)
}

function frame() {
  pendingFrame = null
  if (!visible) return
  const now = Date.now()
  const elapsed = lastFrame === null ? 0 : Math.max(0, (now - lastFrame) / 1000)
  lastFrame = now
  posterTime += elapsed
  draw()
  // 只有首页的转盘会动。点菜由触摸推进，传手机时无需持续重绘。
  if (screen === 'home') schedule()
}

function boxFor(touch) {
  const x = (touch.clientX - view.left) / view.scale
  const y = (touch.clientY - view.top) / view.scale
  const boxes = layout(view.height, count)
  const inside = b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
  if (screen === 'home') {
    const i = boxes.counts.findIndex(inside)
    if (i !== -1) return { action: 'count', value: MIN_SEATS + i }
  }
  if (screen === 'play') {
    if (round.phase === 'pass' && inside(boxes.main)) return { action: 'begin' }
    if (round.phase === 'setup' || round.phase === 'pick') {
      const i = boxes.dishes.findIndex(inside)
      if (i !== -1 && !round.picked[i]) return { action: 'dish', value: i }
    }
  }
  if (screen !== 'play' && inside(boxes.main)) return { action: 'start' }
  if ((screen === 'result' || (screen === 'play' && round.phase === 'setup')) && inside(boxes.back)) {
    return { action: 'back' }
  }
  return null
}

function startRound() {
  round = createRound(count)
  screen = 'play'
  lastFrame = null
  sound.stop()
}

wx.onTouchStart(event => {
  if (!visible) return
  const touches = event.changedTouches && event.changedTouches.length ? event.changedTouches : event.touches
  // 一桌共用一台手机，只接收一次完整的点按，避免两根手指同时替两位玩家点菜。
  for (const touch of Array.from(touches || [])) {
    const id = touch.identifier
    if (down.has(id)) continue
    down.add(id)
    const target = boxFor(touch)
    if (target && !navTouch) navTouch = { id, target, screen, round, phase: round && round.phase }
  }
})

function finishTouch(event, cancelled) {
  const changed = Array.from(event.changedTouches || [])
  if (cancelled && !changed.length) {
    down.clear()
    navTouch = null
  }
  for (const touch of changed) {
    down.delete(touch.identifier)
    if (!navTouch || navTouch.id !== touch.identifier) continue
    const start = navTouch
    navTouch = null
    if (cancelled || start.screen !== screen || start.round !== round || start.phase !== (round && round.phase)) continue
    const end = boxFor(touch)
    if (!end || end.action !== start.target.action || end.value !== start.target.value) continue
    if (end.action === 'count') count = end.value
    if (end.action === 'start') startRound()
    if (end.action === 'begin') beginTurn(round)
    if (end.action === 'dish') {
      if (round.phase === 'setup') {
        if (sealDish(round, end.value)) sound.play('seal')
      } else if (pickDish(round, end.value)) {
        if (round.phase === 'result') screen = 'result'
        sound.play(screen === 'result' ? 'payer' : 'safe')
      }
    }
    if (end.action === 'back') {
      sound.stop()
      screen = 'home'
      round = null
      lastFrame = null
    }
    schedule()
  }
}

wx.onTouchEnd(event => finishTouch(event, false))
wx.onTouchCancel(event => finishTouch(event, true))
wx.onHide(() => {
  // 切后台可能不派发 touchEnd。保留封存的菜和当前轮次，只清除尚未完成的手势。
  visible = false
  navTouch = null
  down.clear()
  sound.stop()
  if (pendingFrame !== null) dropFrame(pendingFrame)
  pendingFrame = null
  lastFrame = null
})
wx.onShow(() => {
  visible = true
  lastFrame = null
  schedule()
})
if (wx.onWindowResize) wx.onWindowResize(() => { resize(); draw() })
if (wx.setPreferredFramesPerSecond) wx.setPreferredFramesPerSecond(30)
resize()
draw()
schedule()
