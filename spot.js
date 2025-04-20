
const app = document.getElementById("app-root");
const urlParams = new URLSearchParams(window.location.search);
const spot = urlParams.get("spot") || "A";
const requiredTouchesMap = { A: 10, B: 9, C: 8, D: 2, E: 1 };
const requiredTouches = requiredTouchesMap[spot] || 10;
const storageKey = "stamp_spot_" + spot;

app.innerHTML = `
  <header>スタンプラリー</header>
  <div id="spot-label">スポット${spot}</div>
  <div class="container" id="container">
    <div class="progress-bar-container"><div class="progress-bar" id="progressBar"></div></div>
    <div class="cleared-label" id="cleared">
      <img src="stamp_obtained.png" alt="取得済みスタンプ" />
    </div>
  </div>
  <div class="flash-overlay" id="flashEffect"></div>
  <footer id="footer-message">枠内にスタンプを押してください</footer>
  <button class="back-button" onclick="window.location.href='index.html'">← 戻る</button>
`;

const clearedLabel = document.getElementById("cleared");
const footerMessage = document.getElementById("footer-message");
const progressBar = document.getElementById("progressBar");
const container = document.getElementById("container");

let timer = null;
const duration = 2000;
const interval = 50;
let alreadyCleared = false;

// 効果音
const stampSound = new Audio("https://soundeffect-lab.info/sound/anime/mp3/hanko1.mp3");
const sparkleSound = new Audio("https://soundeffect-lab.info/sound/anime/mp3/sparkle.mp3");

function playParticles() {
  const flash = document.getElementById("flashEffect");
  flash.style.animation = "none";
  void flash.offsetWidth;
  flash.style.animation = "flashOut 1.5s ease-out";

  for (let i = 0; i < 70; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    const angle = Math.random() * 2 * Math.PI;
    const angleDeg = Math.floor(Math.random() * 360);
    const radius = 120 + Math.random() * 80;
    particle.style.setProperty("--x", `${Math.cos(angle) * radius}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * radius}px`);
    particle.style.setProperty("--angle", `${angleDeg}deg`);
    particle.style.left = "50%";
    particle.style.top = "50%";
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 2000);
  }
}

function startProgress() {
  let elapsed = 0;
  progressBar.style.width = "0%";

  const vib = setInterval(() => {
    if (navigator.vibrate) navigator.vibrate(100);
  }, 200);

  timer = setInterval(() => {
    elapsed += interval;
    progressBar.style.width = (elapsed / duration) * 100 + "%";

    if (elapsed >= duration) {
      clearInterval(timer);
      clearInterval(vib);
      progressBar.style.width = "0%";
      clearedLabel.style.display = "flex";
      footerMessage.textContent = "スタンプを獲得しました！";
      localStorage.setItem(storageKey, "true");
      alreadyCleared = true;
      stampSound.play().catch(() => {});
      setTimeout(() => sparkleSound.play().catch(() => {}), 300);
      playParticles();
    }
  }, interval);
}

container.addEventListener("touchstart", (e) => {
  if (alreadyCleared || timer) return;
  if (e.touches.length >= requiredTouches) {
    stampSound.play().catch(() => {});
    sparkleSound.play().catch(() => {});
    startProgress();
  }
});

container.addEventListener("touchend", () => {
  clearInterval(timer);
  timer = null;
  progressBar.style.width = "0%";
});

if (localStorage.getItem(storageKey)) {
  clearedLabel.style.display = "flex";
  footerMessage.textContent = "スタンプは取得済みです";
  alreadyCleared = true;
}
