const { drawTable } = require('./table')

// 色彩来自酒楼老菜单。画面与触摸命中共用 360 单位宽的排版坐标。
const ink = '#312c26'
const paper = '#f8efd9'
const red = '#ad3026'
const teal = '#29695d'
const muted = '#706451'
const sans = '"PingFang SC", "Microsoft YaHei", sans-serif'
const serif = '"Songti SC", "Noto Serif CJK SC", serif'

function label(c, value, x, y, size, color = ink, align = 'left', weight = 'normal', family = sans) {
  c.font = weight + ' ' + size + 'px ' + family
  c.textAlign = align
  c.textBaseline = 'middle'
  c.fillStyle = color
  c.fillText(value, x, y)
}

function line(c, x1, y1, x2, y2, color, width = 1) {
  c.beginPath()
  c.moveTo(x1, y1)
  c.lineTo(x2, y2)
  c.strokeStyle = color
  c.lineWidth = width
  c.stroke()
}

function rect(c, x, y, w, h, color) {
  c.fillStyle = color
  c.fillRect(x, y, w, h)
}

function path(c, points, fill, stroke, width = 1) {
  c.beginPath()
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y))
  c.closePath()
  if (fill) { c.fillStyle = fill; c.fill() }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke() }
}

// 用同一条路径绘制招牌和小票上的餐碗印记，避免真机字体替换图标。
function bowl(c, x, y, size, color) {
  c.save()
  c.translate(x, y)
  c.scale(size / 24, size / 24)
  line(c, 10, 8, 18, 1, color, 1.8)
  line(c, 13, 8, 23, 2, color, 1.8)
  c.fillStyle = color
  c.beginPath()
  c.moveTo(1, 10)
  c.lineTo(23, 10)
  c.bezierCurveTo(21, 23, 3, 23, 1, 10)
  c.fill()
  rect(c, 8, 20, 8, 1.8, color)
  c.restore()
}

function dash(c, x1, x2, y, color) {
  for (let x = x1; x < x2; x += 7) rect(c, x, y, Math.min(4, x2 - x), 1, color)
}

function header(c, text) {
  bowl(c, 17, 1, 23, red)
  label(c, '金满楼酒家', 48, 13, 15, ink, 'left', 'bold', serif)
  label(c, text, 344, 13, 12, muted, 'right')
  line(c, 16, 31, 344, 31, ink, 1.4)
  line(c, 16, 34, 344, 34, ink, 0.65)
}

function button(c, box, title, down = false) {
  const { x, y, w, h } = box
  const offset = down ? 3 : 0
  rect(c, x + 3, y + 4, w, h, ink)
  rect(c, x, y + offset, w, h, ink)
  rect(c, x + 1.5, y + offset + 1.5, w - 3, h - 3, down ? '#8c2921' : red)
  c.strokeStyle = '#e69873'
  c.lineWidth = 0.7
  c.strokeRect(x + 5, y + offset + 5, w - 10, h - 10)
  label(c, title, x + w / 2, y + offset + h / 2, 21, '#fff5dc', 'center', 'bold')
  const ax = x + w - 29
  const ay = y + offset + h / 2
  line(c, ax - 6, ay, ax + 6, ay, '#fff5dc', 1.7)
  line(c, ax + 1, ay - 5, ax + 6, ay, '#fff5dc', 1.7)
  line(c, ax + 1, ay + 5, ax + 6, ay, '#fff5dc', 1.7)
}

function ornament(c, x, y, dir) {
  for (let i = 0; i < 3; i++) {
    line(c, x, y + (i - 1) * 4, x + dir * (i === 1 ? 19 : 13), y + (i - 1) * 4, red, 1.2)
  }
}

const seatInk = ['#ae392c', '#276550', '#86582b', '#375e86', '#8a4b64', '#5e6743']
const excuses = ['突然要接个电话。', '说车还在路中间。', '说楼下有人找。', '去洗手间找上一位了。', '想起汤还炖在家里。', '说去帮服务员找零钱。']

function layout(height, count = 4) {
  // 上下保留标题、说明和返回区，奇数桌的最后一席居中；触摸直接使用这些碟子的外框。
  const rowCount = Math.ceil(count / 2)
  const step = Math.min(119, (height - 252) / rowCount)
  const firstY = (144 + height - 101 - rowCount * step) / 2
  const seats = Array.from({ length: count }, (_, i) => ({
    x: count % 2 && i === count - 1 ? 109 : (i % 2 ? 188 : 30),
    y: firstY + Math.floor(i / 2) * step, w: 142, h: step - 6
  }))
  const counts = Array.from({ length: 5 }, (_, i) => ({
    x: 23 + i * 64, y: height - 141, w: 58, h: 41
  }))
  return {
    main: { x: 22, y: height - 82, w: 316, h: 50 },
    back: { x: 88, y: height - 30, w: 184, h: 30 },
    tableY: 105 + (height - 600) * 0.49, counts, seats
  }
}

function home(c, h, boxes, time, count) {
  header(c, '同桌抽签')
  const d = (h - 600) * 0.18
  c.save()
  c.translate(180, 83 + d)
  c.rotate(-0.035)
  // 深浅两层墨叠印。分开安排题字，让五个字在最窄屏幕上仍有边距。
  label(c, '这顿', -24, 3, 45, '#d8bd90', 'right', 'bold', serif)
  label(c, '谁买单', -24, 3, 45, '#d8bd90', 'left', 'bold', serif)
  label(c, '这顿', -26, 0, 45, ink, 'right', 'bold', serif)
  label(c, '谁买单', -26, 0, 45, red, 'left', 'bold', serif)
  ornament(c, -130, 0, -1)
  ornament(c, 127, 0, 1)
  c.restore()
  label(c, '都说去洗手间，总得留一个。', 180, 125 + d, 15, muted, 'center')
  drawTable(c, 0, boxes.tableY, 360, { time, angle: 0.13 * Math.sin(time * 0.75) })
  line(c, 22, h - 173, 100, h - 173, '#b5a180')
  line(c, 260, h - 173, 338, h - 173, '#b5a180')
  label(c, '这桌几位？', 180, h - 173, 17, ink, 'center', 'bold')
  boxes.counts.forEach((b, i) => {
    const current = i + 2 === count
    rect(c, b.x, b.y, b.w, b.h, current ? teal : '#e7d9bd')
    if (current) {
      c.strokeStyle = '#b1c4a5'
      c.lineWidth = 0.7
      c.strokeRect(b.x + 3, b.y + 3, b.w - 6, b.h - 6)
    }
    label(c, (i + 2) + '人', b.x + b.w / 2, b.y + b.h / 2, 16, current ? paper : ink, 'center', 'bold')
  })
  button(c, boxes.main, '开一桌')
  label(c, '共用一部手机，每桌抽出一位买单人。', 180, h - 13, 12, muted, 'center')
}

// 指印只是按键反馈图案。席号负责识别玩家，颜色辅助区分同桌的各席。
function fingerprint(c, x, y, size, color) {
  c.save()
  c.translate(x, y)
  c.scale(size, size)
  c.rotate(-0.24)
  c.strokeStyle = color
  c.lineWidth = 1.6
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(-10, 1)
  c.bezierCurveTo(-10, -14, 12, -15, 12, 1)
  c.bezierCurveTo(12, 7, 9, 11, 7, 13)
  c.moveTo(-7, 6)
  c.bezierCurveTo(-4, 2, -8, -8, 2, -8)
  c.bezierCurveTo(12, -7, 9, 5, 5, 10)
  c.moveTo(-4, 10)
  c.bezierCurveTo(1, 4, -4, -4, 2, -4)
  c.bezierCurveTo(8, -3, 4, 6, 2, 8)
  c.moveTo(-1, 13)
  c.bezierCurveTo(2, 10, 3, 7, 3, 4)
  c.moveTo(0, 3)
  c.lineTo(1, 0)
  c.stroke()
  c.restore()
}

function oval(c, x, y, rx, ry, fill, stroke, weight = 1) {
  c.save()
  c.translate(x, y)
  c.scale(rx, ry)
  c.beginPath()
  c.arc(0, 0, 1, 0, Math.PI * 2)
  c.restore()
  if (fill) { c.fillStyle = fill; c.fill() }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = weight; c.stroke() }
}

function drawSeat(c, box, i, round) {
  const x = box.x + box.w / 2
  const y = box.y + box.h / 2
  const rx = box.w * 0.475
  const ry = Math.min(47, box.h * 0.43)
  const escaped = round.escaped.includes(i)
  const active = round.phase === 'draw' && round.highlight === i && !escaped
  const joined = round.joined[i]
  const tone = escaped ? '#807865' : seatInk[i]
  oval(c, x + 2, y + 4, rx, ry, '#cbb895')
  oval(c, x, y, rx, ry, escaped ? '#e4dcc7' : '#fff8e8', active ? red : ink, active ? 3 : 1.4)
  oval(c, x, y, rx - 4, ry - 4, null, active ? red : tone, active ? 2 : 1)
  oval(c, x, y, rx - 10, ry - 8, null, '#c7bda4', 0.8)
  if (escaped) {
    label(c, (i + 1) + '号位', x, y - 9, 16, muted, 'center', 'bold')
    line(c, x - 23, y - 7, x + 23, y - 11, muted, 1.3)
    label(c, '免单', x, y + 13, 18, teal, 'center', 'bold', serif)
  } else {
    if (joined) fingerprint(c, x - 26, y - 7, 0.73, tone)
    label(c, (i + 1) + '号位', x + (joined ? 11 : 0), y - 8, 18, tone, 'center', 'bold')
    const status = round.phase === 'join' ? (joined ? '已入座' : '点一下入座') : (active ? '账单在这里' : '等开签')
    label(c, status, x, y + 15, 12, active ? red : muted, 'center', active ? 'bold' : 'normal')
  }
}

function playing(c, h, boxes, round) {
  const joining = round.phase === 'join'
  const total = round.count
  const joined = round.joined.filter(Boolean).length
  header(c, total + ' 人桌')
  label(c, joining ? '各位请入座' : '账单传到谁手里？', 21, 77, joining ? 30 : 26, ink, 'left', 'bold', serif)
  label(c, joining ? joined + ' / ' + total : '剩 ' + (total - round.escaped.length) + ' 席', 339, 77, 17, teal, 'right', 'bold')
  label(c, joining ? '每人点一张空碟，记住自己的座号。' : '拿到免单签的先走，留到最后的人请客。', 22, 116, 15, muted)
  dash(c, 21, 339, 140, '#b29c7e')
  boxes.seats.forEach((box, i) => drawSeat(c, box, i, round))
  const foot = h - 77
  dash(c, 21, 339, foot - 22, '#b29c7e')
  if (joining) {
    label(c, '还差 ' + (total - joined) + ' 位，人齐就开签。', 180, foot, 16, teal, 'center', 'bold')
    label(c, '返回选人数', 180, boxes.back.y + boxes.back.h / 2, 14, teal, 'center', 'bold')
  } else {
    const last = round.escaped[round.escaped.length - 1]
    label(c, last === undefined ? '服务员拿着账单过来了……' : (last + 1) + ' 号位' + excuses[last], 180, foot, 16, teal, 'center', 'bold')
  }
}

function receipt(c, h, boxes, round) {
  header(c, '本桌已开签')
  const top = 64 + (h - 600) * 0.40
  const left = 27
  const width = 306
  const bottom = top + 377
  // 连续锯齿做成撕下的小票；结果只认已经锁定的席号，重绘不会产生新结果。
  const points = [[left, top], [left + width, top], [left + width, bottom]]
  for (let i = 0; i < 17; i++) {
    points.push([left + width - i * 18 - 9, bottom - 7], [left + width - (i + 1) * 18, bottom])
  }
  path(c, points.map(([x, y]) => [x + 4, y + 5]), '#cfbb97')
  path(c, points, '#fff8e7', '#ab9677', 1)
  bowl(c, 166, top + 19, 28, red)
  label(c, '买单小票', 180, top + 70, 30, ink, 'center', 'bold', serif)
  dash(c, 47, 313, top + 102, '#ac9675')
  label(c, '本桌买单人', 180, top + 133, 14, muted, 'center')
  const seat = round.payer + 1
  fingerprint(c, 180, top + 174, 1.35, seatInk[round.payer])
  label(c, seat + ' 号位', 180, top + 238, 48, red, 'center', 'bold', serif)
  dash(c, 47, 313, top + 286, '#ac9675')
  label(c, '其余 ' + (round.count - 1) + ' 位', 49, top + 321, 16, muted)
  label(c, '均已免单', 311, top + 321, 18, teal, 'right', 'bold')
  button(c, boxes.main, '再来一桌')
  label(c, '回到酒家', 180, boxes.back.y + boxes.back.h / 2, 14, teal, 'center', 'bold')
}

function drawScreen(c, height, screen, round, time, count = 4) {
  const size = round ? round.count : count
  const boxes = layout(height, size)
  if (screen === 'home') home(c, height, boxes, time, count)
  else if (screen === 'play') playing(c, height, boxes, round)
  else receipt(c, height, boxes, round)
}

module.exports = { drawScreen, layout, paper }
