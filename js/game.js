// Othello Game Logic
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const BOARD_SIZE = 8;

const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

class Game {
    constructor() {
        this.board = [];
        this.currentPlayer = BLACK;
        this.gameOver = false;
        this.passCount = 0;
        this.moveHistory = [];
        this.init();
    }

    init() {
        this.board = Array.from({ length: BOARD_SIZE }, () =>
            Array(BOARD_SIZE).fill(EMPTY)
        );
        const mid = BOARD_SIZE / 2;
        this.board[mid - 1][mid - 1] = WHITE;
        this.board[mid - 1][mid] = BLACK;
        this.board[mid][mid - 1] = BLACK;
        this.board[mid][mid] = WHITE;
        this.currentPlayer = BLACK;
        this.gameOver = false;
        this.passCount = 0;
        this.moveHistory = [];
    }

    clone() {
        const copy = new Game();
        copy.board = this.board.map(row => [...row]);
        copy.currentPlayer = this.currentPlayer;
        copy.gameOver = this.gameOver;
        copy.passCount = this.passCount;
        return copy;
    }

    isInBounds(row, col) {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    opponent(player) {
        return player === BLACK ? WHITE : BLACK;
    }

    getFlippableDiscs(row, col, player) {
        if (this.board[row][col] !== EMPTY) return [];

        const opp = this.opponent(player);
        const allFlips = [];

        for (const [dr, dc] of DIRECTIONS) {
            const flips = [];
            let r = row + dr;
            let c = col + dc;

            while (this.isInBounds(r, c) && this.board[r][c] === opp) {
                flips.push([r, c]);
                r += dr;
                c += dc;
            }

            if (flips.length > 0 && this.isInBounds(r, c) && this.board[r][c] === player) {
                allFlips.push(...flips);
            }
        }

        return allFlips;
    }

    isValidMove(row, col, player) {
        if (!this.isInBounds(row, col) || this.board[row][col] !== EMPTY) return false;
        return this.getFlippableDiscs(row, col, player).length > 0;
    }

    getValidMoves(player) {
        const moves = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (this.isValidMove(r, c, player)) {
                    moves.push([r, c]);
                }
            }
        }
        return moves;
    }

    makeMove(row, col, player) {
        if (!this.isValidMove(row, col, player)) return null;

        const flipped = this.getFlippableDiscs(row, col, player);
        this.board[row][col] = player;
        for (const [r, c] of flipped) {
            this.board[r][c] = player;
        }

        this.moveHistory.push({ row, col, player, flipped });
        this.passCount = 0;

        return flipped;
    }

    switchTurn() {
        this.currentPlayer = this.opponent(this.currentPlayer);

        if (this.getValidMoves(this.currentPlayer).length === 0) {
            this.passCount++;
            if (this.passCount >= 2) {
                this.gameOver = true;
                return 'gameover';
            }
            this.currentPlayer = this.opponent(this.currentPlayer);
            if (this.getValidMoves(this.currentPlayer).length === 0) {
                this.gameOver = true;
                return 'gameover';
            }
            return 'pass';
        }

        this.passCount = 0;
        return 'ok';
    }

    getScore() {
        let black = 0;
        let white = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (this.board[r][c] === BLACK) black++;
                else if (this.board[r][c] === WHITE) white++;
            }
        }
        return { black, white };
    }

    getWinner() {
        const score = this.getScore();
        if (score.black > score.white) return BLACK;
        if (score.white > score.black) return WHITE;
        return null; // draw
    }

    isBoardFull() {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (this.board[r][c] === EMPTY) return false;
            }
        }
        return true;
    }
}
