let timer;
let timeLeft = 1500;
let isRunning = false;
let isWork = true;
let cycle = 0;
let startTime = null;

const timerDisplay = document.getElementById("timer");
const taskInput = document.getElementById("taskInput");

function updateDisplay() {
  let min = Math.floor(timeLeft / 60);
  let sec = timeLeft % 60;
  timerDisplay.textContent =
    `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function start() {
  if (!taskInput.value) {
    alert("Debes escribir una tarea");
    return;
  }

  if (isRunning) return;

  isRunning = true;
  taskInput.disabled = true;

  if (!startTime) startTime = new Date();

  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      next();
    }
  }, 1000);
}

function pause() {
  clearInterval(timer);
  isRunning = false;
}

function stop() {
  clearInterval(timer);
  isRunning = false;

  saveHistory();

  reset();
}

function next() {
  clearInterval(timer);
  isRunning = false;

  notify();

  if (isWork) {
    cycle++;
    if (cycle % 4 === 0) {
      timeLeft = getLongBreak() * 60;
    } else {
      timeLeft = 300;
    }
  } else {
    timeLeft = 1500;
  }

  isWork = !isWork;
  updateDisplay();
}

function reset() {
  timeLeft = 1500;
  cycle = 0;
  isWork = true;
  startTime = null;
  taskInput.disabled = false;
  updateDisplay();
}

function getLongBreak() {
  const select = document.getElementById("longBreak");
  localStorage.setItem("longBreak", select.value);
  return parseInt(select.value);
}

function loadConfig() {
  const saved = localStorage.getItem("longBreak");
  if (saved) {
    document.getElementById("longBreak").value = saved;
  }
}

function notify() {
  if (document.hidden) {
    new Notification("Pomodoro", {
      body: "Cambio de bloque"
    });
  } else {
    alert("Cambio de bloque");
  }
}

function saveHistory() {
  if (!startTime) return;

  const history = JSON.parse(localStorage.getItem("history")) || [];

  const endTime = new Date();

  history.unshift({
    task: taskInput.value,
    start: startTime,
    end: endTime,
    duration: Math.floor((endTime - startTime) / 1000)
  });

  localStorage.setItem("history", JSON.stringify(history));
}

function toggleHistory() {
  const div = document.getElementById("history");
  div.classList.toggle("hidden");

  const history = JSON.parse(localStorage.getItem("history")) || [];

  div.innerHTML = history.map(h => `
    <div>
      <strong>${h.task}</strong><br>
      ${new Date(h.start).toLocaleString()} - ${new Date(h.end).toLocaleString()}
    </div><hr>
  `).join("");
}

// Persistencia del tiempo (clave para segundo plano)
window.addEventListener("beforeunload", () => {
  localStorage.setItem("pomodoroState", JSON.stringify({
    timeLeft,
    isWork,
    cycle,
    startTime
  }));
});

function loadState() {
  const state = JSON.parse(localStorage.getItem("pomodoroState"));
  if (state) {
    timeLeft = state.timeLeft;
    isWork = state.isWork;
    cycle = state.cycle;
    startTime = state.startTime ? new Date(state.startTime) : null;
    updateDisplay();
  }
}

// Inicializar
loadConfig();
loadState();
updateDisplay();
