// 可以从这里调整游戏规则。
const GAME_DURATION = 30;
const BASKET_SPEED = 390;
const STORAGE_KEY = "moon-festival-best-score";

// 把喜欢的句子加进这个列表，页面就会随机抽到它。
const wishes = [
  "愿你抬头见月，低头有路，身边总有惦念的人。",
  "今晚的月亮很圆，好运也想和你团圆。",
  "愿你奔向远方时有光，回到家时有热汤。",
  "把烦恼交给晚风，把甜留给今晚的月饼。",
  "愿你的每一个愿望，都有人认真听见。",
  "愿生活像月饼：打开有惊喜，尝一口是甜的。",
  "山海虽远，思念同频；月光所照，皆是团圆。",
  "今夜宜赏月，宜吃甜，宜和喜欢的人说说话。",
  "愿此时的你，拥有一轮圆月，也拥有圆满心情。",
  "祝你把日子过成喜欢的形状，像月亮一样自在发光。"
];

const stage = document.querySelector("#game-stage");
const fallingLayer = document.querySelector("#falling-layer");
const basket = document.querySelector("#basket");
const overlay = document.querySelector("#game-overlay");
const overlayTitle = document.querySelector("#overlay-title");
const overlayMessage = document.querySelector("#overlay-message");
const startButton = document.querySelector("#start-button");
const scoreDisplay = document.querySelector("#score");
const bestDisplay = document.querySelector("#best-score");
const timeDisplay = document.querySelector("#time-left");
const announcement = document.querySelector("#game-announcement");
const wishText = document.querySelector("#wish-text");
const wishNumber = document.querySelector("#wish-number");
const copyStatus = document.querySelector("#copy-status");

let bestScore = 0;
try { bestScore = Number(localStorage.getItem(STORAGE_KEY)) || 0; } catch (_) { /* 浏览器禁止存储时仍可游戏 */ }
bestDisplay.textContent = bestScore;
timeDisplay.textContent = GAME_DURATION;

let running = false;
let score = 0;
let items = [];
let basketX = 0;
let direction = 0;
let pressedLeft = false;
let pressedRight = false;
let animationId = 0;
let startTime = 0;
let lastFrame = 0;
let spawnElapsed = 0;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function moveBasket(x) {
  basketX = clamp(x, 46, Math.max(46, stage.clientWidth - 46));
  basket.style.left = `${basketX}px`;
}

function clearItems() {
  items.forEach(item => item.element.remove());
  items = [];
  fallingLayer.replaceChildren();
  stage.querySelectorAll(".float-score").forEach(element => element.remove());
}

function spawnItem() {
  const roll = Math.random();
  const type = roll < .14 ? "cloud" : roll < .32 ? "golden" : "mooncake";
  const size = type === "cloud" ? 52 : 43;
  const width = stage.clientWidth;
  const x = 15 + Math.random() * Math.max(1, width - size - 30);
  const element = document.createElement("div");
  element.className = `falling-item ${type}`;
  element.textContent = type === "cloud" ? "☁" : type === "golden" ? "月" : "福";
  fallingLayer.appendChild(element);
  const item = { element, type, size, x, y: -size, speed: 125 + Math.random() * 95 + (GAME_DURATION - Number(timeDisplay.textContent)) * 2.5, rotation: Math.random() * 18 - 9 };
  items.push(item);
  renderItem(item);
}

function renderItem(item) {
  item.element.style.transform = `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg)`;
}

function showScoreChange(points) {
  const label = document.createElement("span");
  label.className = `float-score${points < 0 ? " negative" : ""}`;
  label.textContent = points > 0 ? `+${points}` : String(points);
  label.style.left = `${basketX - 17}px`;
  label.style.top = `${stage.clientHeight - 118}px`;
  stage.appendChild(label);
  label.addEventListener("animationend", () => label.remove(), { once: true });
  setTimeout(() => label.remove(), 850);
  basket.classList.remove("catch");
  void basket.offsetWidth;
  basket.classList.add("catch");
}

function catchItem(item) {
  const points = item.type === "cloud" ? -10 : item.type === "golden" ? 20 : 10;
  score = Math.max(0, score + points);
  scoreDisplay.textContent = score;
  showScoreChange(points);
  if (score > bestScore) {
    bestScore = score;
    bestDisplay.textContent = bestScore;
    try { localStorage.setItem(STORAGE_KEY, String(bestScore)); } catch (_) { /* 可忽略存储失败 */ }
  }
}

function finishGame() {
  running = false;
  cancelAnimationFrame(animationId);
  clearItems();
  overlayTitle.textContent = score >= 200 ? "月亮说：你真会接！" : score >= 90 ? "今晚好运满满" : "月亮还在等你";
  overlayMessage.textContent = `你接住了 ${score} 分的好运。${score >= 90 ? "这份甜，记得分给身边的人。" : "再玩一次，下一块金月饼就是你的！"}`;
  startButton.innerHTML = '再玩一次 <span aria-hidden="true">↗</span>';
  overlay.hidden = false;
  announcement.textContent = `游戏结束，得分 ${score} 分。`;
  startButton.focus({ preventScroll: true });
}

function frame(timestamp) {
  if (!running) return;
  const delta = Math.min((timestamp - lastFrame) / 1000, .05);
  lastFrame = timestamp;
  const remaining = Math.max(0, GAME_DURATION - (timestamp - startTime) / 1000);
  timeDisplay.textContent = Math.ceil(remaining);
  if (remaining <= 0) { finishGame(); return; }

  if (direction !== 0) moveBasket(basketX + direction * BASKET_SPEED * delta);
  spawnElapsed += delta;
  const spawnInterval = Math.max(.37, .7 - (GAME_DURATION - remaining) * .008);
  if (spawnElapsed >= spawnInterval) { spawnElapsed = 0; spawnItem(); }

  const basketTop = stage.clientHeight - 75;
  for (let index = items.length - 1; index >= 0; index--) {
    const item = items[index];
    item.y += item.speed * delta;
    renderItem(item);
    const overlapsBasket = item.y + item.size >= basketTop && item.y < basketTop + 22 && item.x + item.size > basketX - 40 && item.x < basketX + 40;
    if (overlapsBasket) {
      catchItem(item);
      item.element.remove();
      items.splice(index, 1);
    } else if (item.y > stage.clientHeight + 10) {
      item.element.remove();
      items.splice(index, 1);
    }
  }
  animationId = requestAnimationFrame(frame);
}

function startGame() {
  cancelAnimationFrame(animationId);
  clearItems();
  score = 0;
  scoreDisplay.textContent = "0";
  timeDisplay.textContent = GAME_DURATION;
  spawnElapsed = 0;
  pressedLeft = false;
  pressedRight = false;
  direction = 0;
  moveBasket(stage.clientWidth / 2);
  overlay.hidden = true;
  running = true;
  announcement.textContent = "游戏开始，左右移动篮子接月饼。";
  stage.focus({ preventScroll: true });
  startTime = performance.now();
  lastFrame = startTime;
  spawnItem();
  animationId = requestAnimationFrame(frame);
}

startButton.addEventListener("click", startGame);
stage.addEventListener("pointermove", event => {
  if (!running) return;
  const rect = stage.getBoundingClientRect();
  moveBasket(event.clientX - rect.left);
});
stage.addEventListener("pointerdown", event => {
  if (!running) return;
  stage.setPointerCapture(event.pointerId);
  const rect = stage.getBoundingClientRect();
  moveBasket(event.clientX - rect.left);
});

function updateDirection() { direction = Number(pressedRight) - Number(pressedLeft); }
window.addEventListener("keydown", event => {
  if (!running) return;
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") { pressedLeft = true; event.preventDefault(); }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") { pressedRight = true; event.preventDefault(); }
  updateDirection();
});
window.addEventListener("keyup", event => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") pressedLeft = false;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") pressedRight = false;
  updateDirection();
});
window.addEventListener("blur", () => { pressedLeft = false; pressedRight = false; updateDirection(); });
window.addEventListener("resize", () => moveBasket(basketX || stage.clientWidth / 2));
moveBasket(stage.clientWidth / 2);

let currentWish = 0;
document.querySelector("#new-wish").addEventListener("click", () => {
  let next = currentWish;
  while (next === currentWish) next = Math.floor(Math.random() * wishes.length);
  currentWish = next;
  wishNumber.textContent = String(next + 1).padStart(2, "0");
  wishText.textContent = wishes[next];
  copyStatus.textContent = "";
});

document.querySelector("#copy-wish").addEventListener("click", async () => {
  const message = `${wishText.textContent} 中秋快乐！`;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(message);
    } else {
      const temporary = document.createElement("textarea");
      temporary.value = message;
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.appendChild(temporary);
      temporary.select();
      const copied = document.execCommand("copy");
      temporary.remove();
      if (!copied) throw new Error("copy failed");
    }
    copyStatus.textContent = "已复制，快把祝福送出去吧。";
  } catch (_) {
    copyStatus.textContent = "复制失败，请手动选中这句祝福。";
  }
});
