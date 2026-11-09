const MIN_SEATS = 2
const MAX_SEATS = 6
const DISHES = Object.freeze([
  '清蒸鲈鱼', '小笼包', '白灼虾', '蒜蓉青菜', '红烧肉', '煎饺', '糖醋排骨', '蛋炒饭', '番茄炒蛋'
])

function createRound(count = 4) {
  if (!Number.isInteger(count) || count < MIN_SEATS || count > MAX_SEATS) {
    throw new RangeError('同桌人数须为 2 到 6 人')
  }
  return {
    count, phase: 'setup', secret: -1, current: 0, payer: -1,
    picked: Array(DISHES.length).fill(false), lastDish: -1
  }
}

function validDish(index) {
  return Number.isInteger(index) && index >= 0 && index < DISHES.length
}

function sealDish(round, index) {
  if (round.phase !== 'setup' || !validDish(index)) return false
  // 指定后立即收起菜单，传给第一位玩家；整桌的买单菜从此固定。
  round.secret = index
  round.phase = 'pass'
  return true
}

function beginTurn(round) {
  if (round.phase !== 'pass') return false
  round.phase = 'pick'
  return true
}

function pickDish(round, index) {
  if (round.phase !== 'pick' || !validDish(index) || round.picked[index]) return false
  round.picked[index] = true
  round.lastDish = index
  if (index === round.secret) {
    round.payer = round.current
    round.phase = 'result'
  } else {
    // 九道菜比座位多。末位点完安全菜后把手机传回首位，已点的菜继续保留。
    round.current = (round.current + 1) % round.count
    round.phase = 'pass'
  }
  return true
}

module.exports = { MIN_SEATS, MAX_SEATS, DISHES, createRound, sealDish, beginTurn, pickDish }
