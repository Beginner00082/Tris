const board = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset');

let cells = ['', '', ''];
let gameActive = true;
let playerTurn = true; // true = tu blu, false = bot rosso

const winCombos = [
  [0,1,2], [3,4,5], [6,7,8], // righe
  [0,3,6], [1,4,7], [2,5,8], // colonne
  [0,4,8], [2,4,6] // diagonali
];

// Crea griglia
for(let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.index = i;
  cell.addEventListener('click', playerMove);
  board.appendChild(cell);
}

function playerMove(e) {
  const index = e.target.dataset.index;
  if(!gameActive ||!playerTurn || cells[index]!== '') return;

  makeMove(index, 'blu');
  if(checkGame()) return;

  playerTurn = false;
  status.textContent = 'Bot sta pensando...';
  setTimeout(botMove, 600);
}

function botMove() {
  let index = findBestMove();
  makeMove(index, 'rosso');
  checkGame();
  playerTurn = true;
  if(gameActive) status.textContent = 'Tocca a te - Blu ⚡';
}

function makeMove(index, type) {
  cells[index] = type;
  const cell = board.children[index];
  cell.classList.add(type, 'taken');
  cell.textContent = type === 'blu'? 'X' : 'O';
}

function findBestMove() {
  // Bot stupido ma decente: vince se può, blocca se deve, random altrimenti
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
  let empty = cells.map((v,i) => v === ''? i : null).filter(v => v!== null);
  return empty[Math.floor(Math.random() * empty.length)];
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
  cells = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  playerTurn = true;
  status.textContent = 'Tocca a te - Blu ⚡';
  Array.from(board.children).forEach(cell => {
    cell.className = 'cell';
    cell.textContent = '';
    cell.style.boxShadow = '';
  });
});
