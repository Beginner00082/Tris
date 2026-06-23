const board = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const difficultySel = document.getElementById('difficulty');

let cells = Array(9).fill('');
let gameActive = true;
let playerTurn = true;

const winCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// Crea griglia istantanea
for(let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.index = i;
  cell.addEventListener('click', () => playerMove(i), {passive: true});
  board.appendChild(cell);
}

function playerMove(i) {
  if(!gameActive ||!playerTurn || cells[i]!== '') return;

  makeMove(i, 'blu');
  if(checkGame()) return;

  playerTurn = false;
  status.textContent = 'Bot pensa...';

  // Delay minimo per fluidità, 0 su impossibile
  const delay = difficultySel.value === 'impossibile'? 0 : 200;
  setTimeout(botMove, delay);
}

function botMove() {
  const diff = difficultySel.value;
  let move;

  if(diff === 'facile') {
    move = randomMove();
  } else if(diff === 'medio') {
    move = Math.random() < 0.5? bestMove() : randomMove();
  } else if(diff === 'difficile') {
    move = Math.random() < 0.85? bestMove() : randomMove();
  } else {
    move = minimaxMove(); // Impossibile: gioca perfetto
  }

  makeMove(move, 'rosso');
  checkGame();
  playerTurn = true;
  if(gameActive) status.textContent = 'Tocca a te - Blu ⚡';
}

function randomMove() {
  const empty = cells.map((v,i) => v === ''? i : null).filter(v => v!== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function bestMove() {
  // Blocca o vince se può
  for(let combo of winCombos) {
    let [a,b,c] = combo;
    if(cells[a] === 'rosso' && cells[b] === 'rosso' && cells[c] === '') return c;
    if(cells[a] === 'rosso' && cells[c] === 'rosso' && cells[b] === '') return b;
    if(cells[b] === 'rosso' && cells[c] === 'rosso' && cells[a] === '') return a;
  }
  for(let combo of winCombos) {
    let [a,b,c] = combo;
    if(cells[a] === 'blu' && cells[b] === 'blu' && cells[c] === '') return c;
    if(cells[a] === 'blu' && cells[c] === 'blu' && cells[b] === '') return b;
    if(cells[b] === 'blu' && cells[c] === 'blu' && cells[a] === '') return a;
  }
  // Altrimenti centro > angoli > lati
  if(cells[4] === '') return 4;
  const corners = [0,2,6,8].filter(i => cells[i] === '');
  if(corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return randomMove();
}

function minimaxMove() {
  let bestScore = -Infinity;
  let move;
  for(let i = 0; i < 9; i++) {
    if(cells[i] === '') {
      cells[i] = 'rosso';
      let score = minimax(cells, 0, false);
      cells[i] = '';
      if(score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing) {
  const result = evaluate(board);
  if(result!== null) return result;

  if(isMaximizing) {
    let bestScore = -Infinity;
    for(let i = 0; i < 9; i++) {
      if(board[i] === '') {
        board[i] = 'rosso';
        let score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for(let i = 0; i < 9; i++) {
      if(board[i] === '') {
        board[i] = 'blu';
        let score = minimax(board, depth + 1, true);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function evaluate(board) {
  for(let combo of winCombos) {
    let [a,b,c] = combo;
    if(board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] === 'rosso'? 10 : -10;
    }
  }
  return board.includes('')? null : 0;
}

function makeMove(i, type) {
  cells[i] = type;
  const cell = board.children[i];
  cell.classList.add(type, 'taken');
  cell.textContent = type === 'blu'? 'X' : 'O';
}

function checkGame() {
  for(let combo of winCombos) {
    let [a,b,c] = combo;
    if(cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      gameActive = false;
      [a,b,c].forEach(i => board.children[i].style.boxShadow = `0 0 40px ${cells[a] === 'blu'? 'var(--blu)' : 'var(--rosso)'}`);
      status.textContent = cells[a] === 'blu'? 'Hai vinto! 🔵' : 'Ha vinto il Bot! 🔴';
      return true;
    }
  }
  if(!cells.includes('')) {
    gameActive = false;
    status.textContent = 'Pareggio! 🤝';
    return true;
  }
  return false;
}

resetBtn.addEventListener('click', () => {
  cells = Array(9).fill('');
  gameActive = true;
  playerTurn = true;
  status.textContent = 'Tocca a te - Blu ⚡';
  Array.from(board.children).forEach(cell => {
    cell.className = 'cell';
    cell.textContent = '';
    cell.style.boxShadow = '';
  });
});

difficultySel.addEventListener('change', () => resetBtn.click());
