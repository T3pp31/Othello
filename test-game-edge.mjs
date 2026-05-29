/**
 * Additional edge-case tests for Game.switchTurn / AI evaluation inputs
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const gameSrc = readFileSync(join(__dirname, 'js/game.js'), 'utf8');
const aiSrc = readFileSync(join(__dirname, 'js/ai.js'), 'utf8');

const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(
  gameSrc + aiSrc + `
    this.Game = Game;
    this.AI = AI;
    this.BLACK = BLACK;
    this.WHITE = WHITE;
    this.EMPTY = EMPTY;
  `,
  sandbox
);

const { Game, AI, BLACK, WHITE } = sandbox;

function playGameToEnd(g) {
  let safety = 0;
  while (!g.gameOver && safety++ < 500) {
    const p = g.currentPlayer;
    const moves = g.getValidMoves(p);
    if (moves.length > 0) {
      const [r, c] = moves[0];
      g.makeMove(r, c, p);
      g.switchTurn();
    } else {
      g.switchTurn();
    }
  }
}

// Full game simulation
const g = new Game();
playGameToEnd(g);
const score = g.getScore();
const winner = g.getWinner();
console.log('Full game simulation:');
console.log('  gameOver:', g.gameOver);
console.log('  score:', score);
console.log('  winner:', winner === BLACK ? 'BLACK' : winner === WHITE ? 'WHITE' : 'DRAW');
console.log('  total discs:', score.black + score.white);

// passCount >= 2 without makeMove between
const g2 = new Game();
g2.passCount = 1;
g2.currentPlayer = BLACK;
// Force black to have a move but after switch white cannot — use real position
g2.makeMove(2, 3, BLACK); // black played
g2.switchTurn(); // white to play
// Manually set passCount to 1 without reset (simulate bug)
g2.passCount = 1;
const before = g2.passCount;
const r = g2.switchTurn(); // white's turn - if white has moves, passCount resets to 0
console.log('\npassCount manipulation after one move:');
console.log('  switchTurn result:', r, 'passCount:', g2.passCount, '(was artificially', before + ')');

// AI returns move when moves exist
const ai = new AI();
const g3 = new Game();
const move = ai.getBestMove(g3, 'normal');
console.log('\nAI getBestMove on opening:', move);

// Early terminal: both no moves, few discs
const g4 = new Game();
g4.board = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,2,1,0,0,0,0],
  [0,0,1,2,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
];
g4.currentPlayer = BLACK;
const bm = g4.getValidMoves(BLACK);
const wm = g4.getValidMoves(WHITE);
console.log('\nSparse board moves black/white:', bm.length, wm.length);
