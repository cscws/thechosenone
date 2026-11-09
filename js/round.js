const MIN_SEATS = 2
const MAX_SEATS = 6
const FIRST_REVEAL = 1.25
const REVEAL_INTERVAL = 0.8
const RECEIPT_DELAY = 0.7

function createRound(count = 4) {
  if (!Number.isInteger(count) || count < MIN_SEATS || count > MAX_SEATS) {
    throw new RangeError('同桌人数须为 2 到 6 人')
  }
  return {
    count, phase: 'join', joined: Array(count).fill(false),
    order: [], escaped: [], highlight: -1, payer: -1, time: 0
  }
}

function joinSeat(round, index, random = Math.random) {
  // 每个桌号整局只登记一次；抽签期间再碰任意席位也不会重新洗牌。
  if (round.phase !== 'join' || !Number.isInteger(index) ||
      index < 0 || index >= round.count || round.joined[index]) return false
  round.joined[index] = true
  if (round.joined.every(Boolean)) {
    // Fisher–Yates 将最后一席留给买单人，抽签与入座顺序及动画帧率无关。
    const order = round.joined.map((_, seat) => seat)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      const seat = order[i]
      order[i] = order[j]
      order[j] = seat
    }
    round.order = order
    round.phase = 'draw'
    round.highlight = 0
  }
  return true
}

function updateRound(round, dt) {
  if (round.phase !== 'draw' || !Number.isFinite(dt) || dt <= 0) return
  const lastReveal = FIRST_REVEAL + (round.count - 2) * REVEAL_INTERVAL
  const duration = lastReveal + RECEIPT_DELAY
  round.time = Math.min(duration, round.time + dt)

  // 按累计时间揭晓，低帧率或长帧也能一次补齐已免单的所有席位。
  while (round.escaped.length < round.count - 1 &&
      round.time >= FIRST_REVEAL + round.escaped.length * REVEAL_INTERVAL) {
    round.escaped.push(round.order[round.escaped.length])
  }
  if (round.time >= duration) {
    round.payer = round.order[round.count - 1]
    round.highlight = round.payer
    round.phase = 'result'
    return
  }

  // 聚光灯只轮流扫过仍在桌上的人；用桌号轮转，避免提前透露洗牌顺序。
  const remaining = round.order.filter(seat => !round.escaped.includes(seat)).sort((a, b) => a - b)
  round.highlight = remaining[Math.floor(round.time / 0.14) % remaining.length]
}

module.exports = { MIN_SEATS, MAX_SEATS, createRound, joinSeat, updateRound }
