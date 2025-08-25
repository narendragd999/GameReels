const cardsData = [
  { id: 1, value: '1' }, { id: 2, value: '1' },
  { id: 3, value: '2' }, { id: 4, value: '2' },
  { id: 5, value: '3' }, { id: 6, value: '3' },
  { id: 7, value: '4' }, { id: 8, value: '4' }
];

let score = 0;
let flippedCards = [];
let matchedPairs = 0;
let timerInterval = null;
let remainingTime = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

window.parent.postMessage({ type: 'READY' }, '*');

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'START') {
    remainingTime = message.durationMs / 1000;
    startGame();
  } else if (message.type === 'STOP') {
    endGame();
  }
});

function startGame() {
  const shuffledCards = shuffle([...cardsData]);
  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';
  shuffledCards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.value = card.value;
    cardElement.dataset.id = card.id.toString();
    cardElement.addEventListener('click', () => handleCardClick(cardElement));
    grid.appendChild(cardElement);
  });
  timerInterval = setInterval(() => {
    remainingTime--;
    document.getElementById('timer').textContent = `Time left: ${remainingTime}s`;
    if (remainingTime <= 0) {
      endGame();
    }
  }, 1000);
}

function handleCardClick(cardElement) {
  if (flippedCards.length < 2 && !cardElement.classList.contains('flipped') && !cardElement.classList.contains('matched')) {
    cardElement.classList.add('flipped');
    cardElement.textContent = cardElement.dataset.value;
    flippedCards.push(cardElement);
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;
      if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        score += 10;
        matchedPairs++;
        window.parent.postMessage({ type: 'SCORE', value: 10 }, '*');
        document.getElementById('score').textContent = `Score: ${score}`;
        flippedCards = [];
        if (matchedPairs === cardsData.length / 2) {
          endGame();
        }
      } else {
        setTimeout(() => {
          card1.classList.remove('flipped');
          card2.classList.remove('flipped');
          card1.textContent = '';
          card2.textContent = '';
          flippedCards = [];
        }, 500);
      }
    }
  }
}

function endGame() {
  clearInterval(timerInterval);
  document.getElementById('card-grid').innerHTML = '';
  document.getElementById('timer').textContent = 'Game Over!';
  window.parent.postMessage({ type: 'END' }, '*');
}