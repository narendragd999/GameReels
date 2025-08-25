let count = 0;
let timerInterval = null;
let remainingTime = 0;

window.parent.postMessage({ type: 'READY' }, '*');

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'START') {
    remainingTime = message.durationMs / 1000;
    startClicker();
  } else if (message.type === 'STOP') {
    endClicker();
  }
});

function startClicker() {
  document.getElementById('click-btn').onclick = () => {
    count++;
    document.getElementById('count').textContent = `Clicks: ${count}`;
    window.parent.postMessage({ type: 'SCORE', value: 1 }, '*');
  };
  timerInterval = setInterval(() => {
    remainingTime--;
    document.getElementById('timer').textContent = `Time left: ${remainingTime}s`;
    if (remainingTime <= 0) {
      endClicker();
    }
  }, 1000);
}

function endClicker() {
  clearInterval(timerInterval);
  document.getElementById('click-btn').onclick = null;
  window.parent.postMessage({ type: 'END' }, '*');
} 
