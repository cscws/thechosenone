// 所有图形使用同一套 360 单位的桌面坐标，屏幕密度和触点坐标由调用方管理。
const ink = '#352A24'
const rice = '#FFF3D8'
const porcelain = '#448A88'
const cinnabar = '#CB533A'
const vermilion = '#E77550'
const mustard = '#DCAA4A'
const skin = '#EFB681'
const motifs = new Map()

// 图案只在第一次绘制时解析。这里只用微信 2D Canvas 的基础路径 API。
function shape(ctx, spec, fill, stroke = ink, weight = 1.7) {
  if (!motifs.has(spec)) {
    const ops = spec.match(/[MLQCZ][^MLQCZ]*/g).map(op => [
      op[0], ...op.slice(1).trim().split(/\s+/).filter(Boolean).map(Number)
    ])
    motifs.set(spec, ops)
  }
  ctx.beginPath()
  for (const op of motifs.get(spec)) {
    if (op[0] === 'M') ctx.moveTo(op[1], op[2])
    else if (op[0] === 'L') ctx.lineTo(op[1], op[2])
    else if (op[0] === 'Q') ctx.quadraticCurveTo(op[1], op[2], op[3], op[4])
    else if (op[0] === 'C') ctx.bezierCurveTo(op[1], op[2], op[3], op[4], op[5], op[6])
    else ctx.closePath()
  }
  finish(ctx, fill, stroke, weight)
}

function finish(ctx, fill, stroke, weight) {
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.lineWidth = weight; ctx.strokeStyle = stroke; ctx.stroke() }
}

function oval(ctx, x, y, rx, ry, fill, stroke = ink, weight = 1.7) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(rx, ry)
  ctx.beginPath()
  ctx.arc(0, 0, 1, 0, Math.PI * 2)
  ctx.restore()
  finish(ctx, fill, stroke, weight)
}

function segment(ctx, x1, y1, x2, y2, color = ink, weight = 1) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  finish(ctx, null, color, weight)
}

function dish(ctx, color, r = 28) {
  oval(ctx, 1, 4, r, r * 0.46, '#668F7E', null)
  oval(ctx, 0, 1.6, r, r * 0.47, '#BFD2B8')
  oval(ctx, 0, -0.3, r, r * 0.46, rice)
  oval(ctx, 0, -0.5, r - 3, r * 0.46 - 2, null, color, 1)
}

function drawFish(ctx) {
  dish(ctx, porcelain, 36)
  oval(ctx, 0, 0, 28, 9, '#C58C50', null)
  // 尾鳍、鱼腹和交叉刀纹保持分色，以便缩小后仍能辨认。
  shape(ctx, 'M-14 -1Q-21 -6 -27 -8L-24 -1L-27 5Q-20 5 -14 1Z', vermilion)
  shape(ctx, 'M-18 0Q-7 -13 13 -7Q21 -6 24 -1Q20 6 9 7Q-8 9 -18 0Z', '#DFA65B')
  shape(ctx, 'M12 -7Q8 -1 12 5M-8 -5L-3 2M-1 -6L4 1M5 -5L9 0', null, '#7D5139', 1)
  oval(ctx, 17, -3, 1.5, 1.5, ink, null)
  shape(ctx, 'M-10 -4Q-3 2 5 -2M-3 -7Q2 -4 8 -4M-5 4L1 2', null, '#377458', 1.8)
  shape(ctx, 'M-2 -7L3 -10M1 -6L8 -9', null, '#B83830', 1.4)
}

function drawBao(ctx) {
  oval(ctx, 1, 4, 24, 11, '#588479', null)
  shape(ctx, 'M-23 -2Q-1 -13 23 -2L22 5Q1 18 -22 6Z', '#C49456')
  oval(ctx, 0, -2, 23, 10, '#E3B86F')
  oval(ctx, 0, -2, 19.5, 7.4, '#926741', ink, 1)
  for (const [x, y] of [[-9, -3], [8, -4], [1, 2]]) {
    ctx.save()
    ctx.translate(x, y)
    shape(ctx, 'M-7 1Q-7 -3 -2 -6L1 -7Q8 -5 8 1Q6 5 0 5Q-6 5 -7 1Z', rice, ink, 1)
    shape(ctx, 'M-2 -5L0 -2L1 -5L4 -3', null, '#B88C65', 0.9)
    ctx.restore()
  }
  shape(ctx, 'M-20 5Q-1 13 19 5M-15 7L-14 10M14 7L13 10', null, '#785538', 1)
}

function drawGreens(ctx) {
  dish(ctx, porcelain, 24)
  for (const [x, y, tilt] of [[-10, 1, -0.45], [-2, -3, -0.15], [8, -1, 0.4], [4, 3, 0.8]]) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(tilt)
    shape(ctx, 'M-2 5Q-8 -1 -6 -5Q-4 -8 -2 -5Q1 -11 4 -7Q7 -5 4 -2Q6 -2 5 0Q3 4 -2 5Z', '#578652', ink, 0.9)
    segment(ctx, -3, 7, 1, 0, '#C4C171', 2.3)
    ctx.restore()
  }
}

function drawShrimp(ctx) {
  dish(ctx, '#BF7354', 23)
  for (const [x, y, tilt] of [[-7, -1, -0.4], [6, 0, 0.2], [-1, 3, 0.9]]) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(tilt)
    shape(ctx, 'M-6 2Q-9 -6 -2 -7Q6 -8 7 -3Q7 3 2 4L5 6L-1 6L0 2Q4 1 3 -2Q2 -5 -1 -4Q-3 -4 -3 0Z', vermilion, ink, 1)
    shape(ctx, 'M-4 -4L-2 -2M0 -7L0 -4M4 -5L2 -3', null, '#954537', 0.7)
    ctx.restore()
  }
}

function drawCloth(ctx) {
  oval(ctx, 183, 246, 142, 24, '#D9C8AB', null)
  shape(ctx, 'M22 142Q180 44 338 142L341 193Q341 202 333 208Q327 230 312 224Q302 247 284 242Q269 261 250 253Q225 273 206 263Q182 274 160 265Q134 272 114 260Q90 265 72 247Q50 249 43 230Q24 229 23 210Q14 205 19 194Z', '#A84635', ink, 2.8)
  shape(ctx, 'M24 143Q184 47 338 143L338 187Q330 208 317 211Q306 232 288 227Q270 249 250 241Q227 258 207 250Q182 260 159 252Q132 262 113 247Q87 250 75 234Q51 238 45 218Q30 220 24 202Z', cinnabar, ink, 2)
  shape(ctx, 'M31 186Q43 200 46 216M64 203Q74 220 76 233M100 215Q111 230 113 245M146 223Q158 244 159 251M210 224Q207 240 207 249M264 214Q252 230 250 239M307 198Q294 211 288 226M333 178L318 209', null, '#813A30', 1.8)
  shape(ctx, 'M36 191L41 206M86 215L91 222M121 228L127 239M172 234L177 243M226 229L220 240M279 213L274 221M314 192L306 204', null, '#E88759', 1.6)
  for (const [x, y, tilt] of [[62, 221, 0.40], [96, 235, 0.25], [140, 245, 0.14],
    [185, 247, 0], [231, 243, -0.16], [272, 231, -0.28], [304, 215, -0.42]]) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(tilt)
    // 桌裙上的织锦回纹是一次套色；留出褶皱和纹样之间的底色。
    shape(ctx, 'M-10 -1L-6 -1L-6 -4L-2 -4L-2 0L2 0L2 -4L6 -4L6 -1L10 -1', null, '#E29764', 1)
    ctx.restore()
  }
  oval(ctx, 180, 143, 160, 92, '#ED9360', ink, 2.5)
  oval(ctx, 180, 141, 155, 86.5, '#D66847', null)
  oval(ctx, 180, 141, 150, 83.5, null, '#EEAA76', 1)
  // 边沿的小菱花固定在桌布上，与会旋转的玻璃托盘分开绘制。
  for (let i = 0; i < 28; i += 1) {
    const a = i * Math.PI / 14
    const x = 180 + 145 * Math.cos(a), y = 141 + 80 * Math.sin(a)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.atan2(80 * Math.cos(a), -145 * Math.sin(a)))
    shape(ctx, 'M-2.4 0L0 -1.3L2.4 0L0 1.3Z', '#F6C28C', null)
    ctx.restore()
  }
  oval(ctx, 180, 149, 119, 70, '#A24D39', null)
  oval(ctx, 180, 145, 119, 69.5, '#75A497', ink, 2)
  oval(ctx, 180, 142, 119, 68.5, '#B5C9B3', ink, 2)
  oval(ctx, 180, 142, 113, 63, null, '#E9E8C7', 1.4)
  oval(ctx, 180, 142, 55, 30, null, '#97B7A4', 1)
  shape(ctx, 'M78 124Q81 113 94 103M260 181Q271 177 278 168', null, '#F5EED3', 2)
}

function drawCup(ctx, x, y, scale) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  oval(ctx, 1, 6, 11, 4, '#A35A40', null)
  shape(ctx, 'M-9 -4L-7 5Q-2 11 5 6L8 -4Z', rice, ink, 1.4)
  oval(ctx, -0.5, -4, 8.6, 3.4, '#A6693B', ink, 1.3)
  shape(ctx, 'M-6 1Q-4 2 -2 1Q0 0 2 1Q3 2 5 1', null, porcelain, 1.1)
  ctx.restore()
}

function drawSettings(ctx) {
  for (const [x, y, size] of [[109, 76, 0.8], [277, 87, 0.95], [68, 185, 0.9]]) {
    drawCup(ctx, x, y, size)
  }
  // 两双筷子错开角度，让桌心的小票露出来。
  for (const [x, y, tilt] of [[79, 104, -0.75], [289, 163, 0.24]]) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(tilt)
    segment(ctx, 0, 0, 2, 34, ink, 2.6)
    segment(ctx, 3.8, 0, 6.5, 34, ink, 2.6)
    segment(ctx, 0, 0, 0.4, 6, mustard, 1.8)
    segment(ctx, 3.8, 0, 4.3, 6, mustard, 1.8)
    ctx.restore()
  }
}

function drawBill(ctx, angle, time) {
  ctx.save()
  // 小票立在转盘中央，底端是支点；摇摆幅度受限，字和印章始终朝向玩家。
  ctx.translate(180 + 8 * Math.sin(angle), 170)
  oval(ctx, 3, 0, 29, 6, '#809889', null)
  ctx.rotate(-0.1 + 0.07 * Math.sin(angle) + 0.045 * Math.sin(time * 1.8))
  shape(ctx, 'M-17 -63L18 -61L27 -2L-18 0Z', '#CAAC7C', ink, 1.5)
  shape(ctx, 'M-22 -67Q-21 -70 -17 -70L18 -70Q21 -70 22 -66L24 -1L20 -4L16 0L12 -4L8 0L4 -4L0 0L-4 -4L-8 0L-12 -4L-16 0L-20 -3L-23 0Z', '#FFF4D6', ink, 2)
  shape(ctx, 'M-20 -66L20 -66M-17 -46L17 -46', null, '#BE533B', 1)
  ctx.fillStyle = '#AD372B'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('账单', 0, -56)
  // 只画菜项的长短横线，缩小后仍能一眼认出是小票。
  shape(ctx, 'M-16 -39L-5 -39M7 -39L16 -39M-16 -34L-1 -34M8 -34L16 -34M-16 -29L-8 -29M7 -29L16 -29M-16 -22L16 -22', null, '#A68B69', 1.1)
  ctx.translate(6, -12)
  ctx.rotate(-0.15)
  shape(ctx, 'M-8 -5L8 -5L8 5L-8 5Z', null, '#B83C2B', 1.3)
  shape(ctx, 'M-5 -2L-1 -2M-4 0L-4 3M-2 0L-2 3M1 -2L5 -2M1 0L5 0M3 -2L3 3', null, '#B83C2B', 0.9)
  ctx.restore()
}

function drawDodgingHand(ctx, side, time, angle) {
  ctx.save()
  // 转盘靠近哪一边，那只手就往袖子里缩；另一边单独摆手，动作错开。
  const flinch = 0.5 + 0.5 * Math.sin(time * 1.8 + side + Math.sin(angle) * side)
  const wrist = 35 - 18 * flinch
  ctx.translate(side < 0 ? wrist : 360 - wrist, side < 0 ? 153 : 130)
  ctx.scale(side < 0 ? 1 : -1, 1)
  ctx.rotate(-0.12 - 0.12 * flinch)
  shape(ctx, 'M-71 -11L0 -9L4 12L-68 20Z', side < 0 ? '#5C9D8E' : mustard, ink, 2.4)
  shape(ctx, 'M-10 -9L1 -10L5 12L-6 14Z', rice, ink, 1.7)
  shape(ctx, 'M-30 -5L-24 0M-20 9L-17 5M-39 -7L-33 13', null, '#F5D6A0', 1.3)
  ctx.rotate(-0.10 + 0.12 * Math.sin(time * 3 + side))
  // 露出掌心，张开五指，拇指单独朝桌心摆出谢绝手势。
  shape(ctx, 'M0 -8Q3 -12 2 -18L0 -27Q-1 -31 2 -32Q5 -33 7 -28L10 -20L8 -36Q8 -40 12 -40Q15 -40 16 -36L18 -24L18 -39Q18 -43 22 -43Q25 -43 25 -39L26 -23L28 -33Q29 -37 32 -36Q35 -35 34 -31L32 -16Q32 -12 30 -7L36 -10Q40 -12 42 -9Q43 -6 39 -3L29 5Q20 13 11 10L4 12Z', skin, ink, 1.9)
  shape(ctx, 'M10 -15Q16 -12 23 -15M12 4Q17 -4 26 -6M9 -24L12 -23M19 -30L22 -30M28 -26L31 -26', null, '#AA7050', 1)
  // 掌心旁的短动线与衣袖同向，动作静止的一帧也能读出「别找我」。
  shape(ctx, 'M38 -24L44 -28M41 -18L48 -19', null, cinnabar, 1.8)
  ctx.restore()
}

const recipes = [drawFish, drawBao, drawShrimp, drawGreens]

function steam(ctx, dish, time) {
  ctx.save()
  ctx.translate(dish.x - 5, dish.y - 14)
  // 蒸汽按时间轻摆；不在逐帧的动态数据上生成新路径缓存。
  const sway = Math.sin(time * 2) * 2
  ctx.beginPath()
  ctx.moveTo(0, -1)
  ctx.bezierCurveTo(4, -5, -3 + sway, -8, 1 + sway, -12)
  ctx.moveTo(7, -4)
  ctx.quadraticCurveTo(5 + sway, -8, 8 + sway, -10)
  finish(ctx, null, '#F8E7BE', 1.3)
  ctx.restore()
}

function drawTable(ctx, x, y, width, scene) {
  if (!(width > 0)) return
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(width / 360, width / 360)
  ctx.beginPath()
  ctx.rect(0, 0, 360, 313.2)
  ctx.clip()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  drawCloth(ctx)
  drawSettings(ctx)
  // 菜跟随转盘做椭圆运动；先画远端盘子，保证转到近端时遮挡关系正确。
  const dishes = recipes.map((draw, i) => {
    const a = (scene.angle || 0) + 0.4 + i * Math.PI / 2
    return { draw, x: 180 + 76 * Math.cos(a), y: 142 + 41 * Math.sin(a) }
  }).sort((a, b) => a.y - b.y)
  for (const item of dishes) {
    ctx.save()
    ctx.translate(item.x, item.y)
    item.draw(ctx)
    ctx.restore()
    if (item.draw === drawBao || item.draw === drawFish) steam(ctx, item, scene.time || 0)
  }
  const angle = scene.angle || 0
  const time = scene.time || 0
  drawBill(ctx, angle, time)
  drawDodgingHand(ctx, -1, time, angle)
  drawDodgingHand(ctx, 1, time, angle)
  ctx.restore()
}

module.exports = { drawTable }
