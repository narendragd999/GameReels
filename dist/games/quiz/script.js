const questions = [
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5"],
    answer: "4"
  },
  {
    question: "Capital of France?",
    options: ["Paris", "London", "Berlin"],
    answer: "Paris"
  },
  {
    question: "Color of sky?",
    options: ["Blue", "Green", "Red"],
    answer: "Blue"
  }
];

let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let remainingTime = 0;

window.parent.postMessage({ type: 'READY' }, '*');

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'START') {
    remainingTime = message.durationMs / 1000;
    startQuiz();
  } else if (message.type === 'STOP') {
    endQuiz();
  }
});

function startQuiz() {
  showQuestion();
  timerInterval = setInterval(() => {
    remainingTime--;
    document.getElementById('timer').textContent = `Time left: ${remainingTime}s`;
    if (remainingTime <= 0) {
      endQuiz();
    }
  }, 1000);
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }
  const q = questions[currentQuestionIndex];
  document.getElementById('question').textContent = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(opt === q.answer);
    optionsDiv.appendChild(btn);
  });
}

function handleAnswer(correct) {
  if (correct) {
    score += 10;
    window.parent.postMessage({ type: 'SCORE', value: 10 }, '*');
  }
  document.getElementById('score').textContent = `Score: ${score}`;
  currentQuestionIndex++;
  showQuestion();
}

function endQuiz() {
  clearInterval(timerInterval);
  document.getElementById('question').textContent = 'Game Over!';
  document.getElementById('options').innerHTML = '';
  window.parent.postMessage({ type: 'END' }, '*');
} 
