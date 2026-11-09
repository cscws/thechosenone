const { drawTable, drawMenuDish } = require('./table')
const { DISHES } = require('./round')

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

function layout(height) {
  // 定菜和正式点菜共用九宫格，换人后每一道菜仍在原来的位置。
  const cellH = Math.min(132, (height - 244) / 3)
  const firstY = (146 + height - 84 - (3 * cellH + 12)) / 2
  const dishes = Array.from({ length: 9 }, (_, i) => ({
    x: 18 + (i % 3) * 110, y: firstY + Math.floor(i / 3) * (cellH + 6),
    w: 104, h: cellH
  }))
  const counts = Array.from({ length: 5 }, (_, i) => ({
    x: 23 + i * 64, y: height - 141, w: 58, h: 41
  }))
  return {
    main: { x: 22, y: height - 82, w: 316, h: 50 },
    back: { x: 88, y: height - 30, w: 184, h: 30 },
    tableY: 105 + (height - 600) * 0.49, counts, dishes
  }
}

function home(c, h, boxes, time, count) {
  header(c, '九道菜局')
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
  label(c, '九道菜里藏一张账单，点到的人请客。', 180, 125 + d, 15, muted, 'center')
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
  label(c, '共用一部手机，先秘密定菜，再轮流点菜。', 180, h - 13, 12, muted, 'center')
}

function menuCard(c, box, i, used) {
  const { x, y, w, h } = box
  const cx = x + w / 2
  const cy = y + h / 2
  rect(c, x + 2, y + 2, w, h, used ? '#d7ccb7' : '#c4ad86')
  rect(c, x, y, w, h, used ? '#e6dfcb' : '#fff8e7')
  c.strokeStyle = used ? '#bbae98' : '#9a8061'
  c.lineWidth = 1
  c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
  c.save()
  if (used) c.globalAlpha = 0.40
  drawMenuDish(c, i, cx, cy - 9, 1.08)
  c.restore()
  label(c, DISHES[i], cx, cy + 28, 15, used ? muted : ink, 'center', 'bold', serif)
  if (used) {
    rect(c, x + w - 38, y + 5, 33, 16, '#d4c8af')
    label(c, '已点', x + w - 21, y + 13, 11, muted, 'center', 'bold')
  }
}

function menu(c, h, boxes, round) {
  const setup = round.phase === 'setup'
  const left = round.picked.filter(picked => !picked).length
  header(c, round.count + ' 人桌')
  label(c, setup ? '秘密定菜' : (round.current + 1) + ' 号位点菜', 19, 77, 29, ink, 'left', 'bold', serif)
  label(c, setup ? '店家设题' : '还剩 ' + left + ' 道', 339, 77, 15, teal, 'right', 'bold')
  label(c, setup ? '请其他人移开目光。点一道菜作为买单菜。' :
    '点一道还没点过的菜，点中买单菜就请客。', 19, 113, 14, muted)
  dash(c, 18, 341, 138, '#b49d7b')
  boxes.dishes.forEach((box, i) => menuCard(c, box, i, round.picked[i]))
  dash(c, 18, 341, h - 70, '#b49d7b')
  label(c, setup ? '选定后立即盖住菜单，按座次轮流点菜。' : '点菜就算落单，已经点过的菜不能再选。', 180, h - 48, 13, muted, 'center')
  if (setup) label(c, '返回选人数', 180, boxes.back.y + boxes.back.h / 2, 14, teal, 'center', 'bold')
}

function handoff(c, h, boxes, round) {
  header(c, round.count + ' 人桌')
  const top = Math.round((h - 275) / 2) - 15
  const left = 39
  rect(c, left + 4, top + 4, 282, 238, '#c5b18e')
  rect(c, left, top, 282, 238, teal)
  c.strokeStyle = '#d9c996'
  c.lineWidth = 1
  c.strokeRect(left + 7, top + 7, 268, 224)
  bowl(c, 164, top + 27, 32, '#f7ebc9')
  label(c, '请交给', 180, top + 79, 17, '#f7ebc9', 'center')
  label(c, (round.current + 1) + ' 号位', 180, top + 128, 43, paper, 'center', 'bold', serif)
  line(c, 74, top + 163, 286, top + 163, '#b8b98e')
  // 交接只展示已经公开的上一道菜；设题时选中的菜名只在最终小票揭晓。
  const note = round.lastDish < 0 ? '买单菜已封存' : DISHES[round.lastDish] + '，躲过一单！'
  label(c, note, 180, top + 197, 17, '#f7ebc9', 'center', 'bold')
  label(c, '拿到手机再打开菜单。', 180, h - 113, 14, muted, 'center')
  button(c, boxes.main, '我来点菜')
}

function receipt(c, h, boxes, round) {
  header(c, '本桌已结账')
  const top = 64 + (h - 600) * 0.40
  const left = 27
  const width = 306
  const bottom = top + 377
  // 小票直接显示本次点中的菜和点菜人，重绘时始终使用同一笔结果。
  const points = [[left, top], [left + width, top], [left + width, bottom]]
  for (let i = 0; i < 17; i++) {
    points.push([left + width - i * 18 - 9, bottom - 7], [left + width - (i + 1) * 18, bottom])
  }
  path(c, points.map(([x, y]) => [x + 4, y + 5]), '#cfbb97')
  path(c, points, '#fff8e7', '#ab9677', 1)
  bowl(c, 166, top + 19, 28, red)
  label(c, '买单小票', 180, top + 70, 30, ink, 'center', 'bold', serif)
  dash(c, 47, 313, top + 102, '#ac9675')
  label(c, '本桌买单人', 180, top + 129, 14, muted, 'center')
  label(c, (round.payer + 1) + ' 号位', 180, top + 181, 48, red, 'center', 'bold', serif)
  dash(c, 47, 313, top + 222, '#ac9675')
  drawMenuDish(c, round.lastDish, 180, top + 254, 1)
  label(c, '买单菜', 49, top + 292, 15, muted)
  label(c, DISHES[round.lastDish], 311, top + 292, 18, red, 'right', 'bold', serif)
  label(c, '其余 ' + (round.count - 1) + ' 位', 49, top + 329, 15, muted)
  label(c, '均已免单', 311, top + 329, 16, teal, 'right', 'bold')
  button(c, boxes.main, '再来一桌')
  label(c, '回到酒家', 180, boxes.back.y + boxes.back.h / 2, 14, teal, 'center', 'bold')
}

function drawScreen(c, height, screen, round, time, count = 4) {
  const boxes = layout(height)
  if (screen === 'home') home(c, height, boxes, time, count)
  else if (screen === 'result') receipt(c, height, boxes, round)
  else if (round.phase === 'pass') handoff(c, height, boxes, round)
  else menu(c, height, boxes, round)
}

module.exports = { drawScreen, layout, paper }
