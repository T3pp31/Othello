// Othello UI Controller with i18n
const i18n = {
    ja: {
        title: 'オセロ',
        black: '黒',
        white: '白',
        blackTurn: '黒の番です',
        whiteTurn: '白の番です',
        cpuThinking: 'CPU思考中...',
        pass: '{player}はパスです',
        mode: 'モード',
        vsCPU: 'CPU対戦',
        vsPlayer: '2人対戦',
        difficulty: '難易度',
        easy: '弱い',
        normal: '普通',
        hard: '強い',
        yourColor: 'あなたの色',
        newGame: '新しいゲーム',
        blackWins: '黒の勝ち！',
        whiteWins: '白の勝ち！',
        draw: '引き分け！',
        youWin: 'あなたの勝ち！',
        youLose: 'あなたの負け...',
        resultScore: '黒 {black} - {white} 白',
        langToggle: 'EN'
    },
    en: {
        title: 'Othello',
        black: 'Black',
        white: 'White',
        blackTurn: "Black's turn",
        whiteTurn: "White's turn",
        cpuThinking: 'CPU thinking...',
        pass: '{player} has no moves - pass!',
        mode: 'Mode',
        vsCPU: 'vs CPU',
        vsPlayer: '2 Players',
        difficulty: 'Difficulty',
        easy: 'Easy',
        normal: 'Normal',
        hard: 'Hard',
        yourColor: 'Your color',
        newGame: 'New Game',
        blackWins: 'Black wins!',
        whiteWins: 'White wins!',
        draw: 'Draw!',
        youWin: 'You win!',
        youLose: 'You lose...',
        resultScore: 'Black {black} - {white} White',
        langToggle: 'JP'
    }
};

class UI {
    constructor() {
        this.game = new Game();
        this.ai = new AI();
        this.lang = 'ja';
        this.mode = 'cpu';
        this.difficulty = 'normal';
        this.playerColor = BLACK;
        this.isProcessing = false;
        this.lastMove = null;

        this.boardEl = document.getElementById('board');
        this.blackCountEl = document.getElementById('black-count');
        this.whiteCountEl = document.getElementById('white-count');
        this.turnTextEl = document.getElementById('turn-text');
        this.messageEl = document.getElementById('message');
        this.modeSelect = document.getElementById('mode-select');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.difficultyGroup = document.getElementById('difficulty-group');
        this.playerColorSelect = document.getElementById('player-color-select');
        this.playerColorGroup = document.getElementById('player-color-group');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.langToggle = document.getElementById('lang-toggle');
        this.resultModal = document.getElementById('result-modal');
        this.resultTitle = document.getElementById('result-title');
        this.resultDetail = document.getElementById('result-detail');
        this.resultNewGame = document.getElementById('result-new-game');

        this.setupEventListeners();
        this.createBoard();
        this.updateAll();
    }

    t(key, params) {
        let text = i18n[this.lang][key] || key;
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                text = text.replace(`{${k}}`, v);
            }
        }
        return text;
    }

    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.resultNewGame.addEventListener('click', () => {
            this.resultModal.classList.add('hidden');
            this.newGame();
        });

        this.modeSelect.addEventListener('change', (e) => {
            this.mode = e.target.value;
            this.difficultyGroup.classList.toggle('hidden', this.mode !== 'cpu');
            this.playerColorGroup.classList.toggle('hidden', this.mode !== 'cpu');
            this.newGame();
        });

        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.newGame();
        });

        this.playerColorSelect.addEventListener('change', (e) => {
            this.playerColor = e.target.value === 'black' ? BLACK : WHITE;
            this.newGame();
        });

        this.langToggle.addEventListener('click', () => {
            this.lang = this.lang === 'ja' ? 'en' : 'ja';
            this.updateLanguage();
        });

        this.resultModal.addEventListener('click', (e) => {
            if (e.target === this.resultModal) {
                this.resultModal.classList.add('hidden');
            }
        });
    }

    createBoard() {
        this.boardEl.innerHTML = '';
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', () => this.handleCellClick(r, c));
                this.boardEl.appendChild(cell);
            }
        }
    }

    handleCellClick(row, col) {
        if (this.isProcessing || this.game.gameOver) return;

        if (this.mode === 'cpu' && this.game.currentPlayer !== this.playerColor) return;

        if (!this.game.isValidMove(row, col, this.game.currentPlayer)) return;

        this.makePlayerMove(row, col);
    }

    makePlayerMove(row, col) {
        this.isProcessing = true;
        const player = this.game.currentPlayer;
        const flipped = this.game.makeMove(row, col, player);
        if (!flipped) {
            this.isProcessing = false;
            return;
        }

        this.lastMove = [row, col];
        this.animateMove(row, col, player, flipped, () => {
            const result = this.game.switchTurn();
            this.isProcessing = false;
            this.updateAll();

            if (result === 'gameover') {
                this.showResult();
                return;
            }

            if (result === 'pass') {
                const passedPlayer = this.game.opponent(this.game.currentPlayer);
                const playerName = passedPlayer === BLACK ? this.t('black') : this.t('white');
                this.showMessage(this.t('pass', { player: playerName }));
            }

            if (this.mode === 'cpu' && this.game.currentPlayer !== this.playerColor && !this.game.gameOver) {
                this.doCPUMove();
            }
        });
    }

    doCPUMove() {
        this.isProcessing = true;
        this.turnTextEl.textContent = this.t('cpuThinking');

        setTimeout(() => {
            const move = this.ai.getBestMove(this.game, this.difficulty);
            if (!move) {
                this.isProcessing = false;
                return;
            }

            const [row, col] = move;
            const flipped = this.game.makeMove(row, col, this.game.currentPlayer);
            if (!flipped) {
                this.isProcessing = false;
                return;
            }

            const cpuPlayer = this.game.currentPlayer;
            this.lastMove = [row, col];
            this.animateMove(row, col, cpuPlayer, flipped, () => {
                const result = this.game.switchTurn();
                this.isProcessing = false;
                this.updateAll();

                if (result === 'gameover') {
                    this.showResult();
                    return;
                }

                if (result === 'pass') {
                    const passedPlayer = this.game.opponent(this.game.currentPlayer);
                    const playerName = passedPlayer === BLACK ? this.t('black') : this.t('white');
                    this.showMessage(this.t('pass', { player: playerName }));

                    if (this.game.currentPlayer !== this.playerColor && !this.game.gameOver) {
                        this.doCPUMove();
                    }
                }
            });
        }, 400);
    }

    animateMove(row, col, player, flipped, callback) {
        this.renderDisc(row, col, player, 'placing');

        setTimeout(() => {
            let flipDelay = 0;
            for (const [fr, fc] of flipped) {
                setTimeout(() => {
                    this.flipDisc(fr, fc, player);
                }, flipDelay);
                flipDelay += 60;
            }

            setTimeout(() => {
                this.updateScore();
                if (callback) callback();
            }, flipDelay + 400);
        }, 250);
    }

    renderDisc(row, col, player, animClass) {
        const cell = this.getCell(row, col);
        let disc = cell.querySelector('.disc');
        if (!disc) {
            disc = document.createElement('div');
            disc.className = 'disc';
            cell.appendChild(disc);
        }
        disc.className = `disc ${player === BLACK ? 'black' : 'white'}`;
        if (animClass) {
            disc.classList.add(animClass);
        }
    }

    flipDisc(row, col, newColor) {
        const cell = this.getCell(row, col);
        const disc = cell.querySelector('.disc');
        if (!disc) return;

        disc.classList.add('flipping');
        setTimeout(() => {
            disc.className = `disc ${newColor === BLACK ? 'black' : 'white'}`;
        }, 250);
    }

    getCell(row, col) {
        return this.boardEl.children[row * BOARD_SIZE + col];
    }

    renderBoard() {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cell = this.getCell(r, c);
                const disc = cell.querySelector('.disc');
                const value = this.game.board[r][c];

                cell.classList.remove('valid-move', 'last-move');

                if (value === EMPTY) {
                    if (disc) disc.remove();
                } else {
                    if (!disc) {
                        const newDisc = document.createElement('div');
                        newDisc.className = `disc ${value === BLACK ? 'black' : 'white'}`;
                        cell.appendChild(newDisc);
                    } else {
                        disc.className = `disc ${value === BLACK ? 'black' : 'white'}`;
                    }
                }
            }
        }

        // Show valid moves
        if (!this.game.gameOver && !this.isProcessing) {
            const validMoves = this.game.getValidMoves(this.game.currentPlayer);
            for (const [r, c] of validMoves) {
                if (this.mode === 'pvp' || this.game.currentPlayer === this.playerColor) {
                    this.getCell(r, c).classList.add('valid-move');
                }
            }
        }

        // Highlight last move
        if (this.lastMove) {
            this.getCell(this.lastMove[0], this.lastMove[1]).classList.add('last-move');
        }
    }

    updateScore() {
        const score = this.game.getScore();
        this.blackCountEl.textContent = score.black;
        this.whiteCountEl.textContent = score.white;
    }

    updateTurn() {
        if (this.game.gameOver) {
            this.turnTextEl.textContent = '';
            return;
        }
        this.turnTextEl.textContent = this.game.currentPlayer === BLACK
            ? this.t('blackTurn')
            : this.t('whiteTurn');
    }

    updateAll() {
        this.renderBoard();
        this.updateScore();
        this.updateTurn();
    }

    showMessage(msg) {
        this.messageEl.textContent = msg;
        setTimeout(() => {
            this.messageEl.textContent = '';
        }, 2000);
    }

    showResult() {
        const score = this.game.getScore();
        const winner = this.game.getWinner();

        let title;
        if (this.mode === 'cpu') {
            if (winner === null) {
                title = this.t('draw');
            } else if (winner === this.playerColor) {
                title = this.t('youWin');
            } else {
                title = this.t('youLose');
            }
        } else {
            if (winner === null) {
                title = this.t('draw');
            } else if (winner === BLACK) {
                title = this.t('blackWins');
            } else {
                title = this.t('whiteWins');
            }
        }

        this.resultTitle.textContent = title;
        this.resultDetail.textContent = this.t('resultScore', {
            black: score.black,
            white: score.white
        });

        setTimeout(() => {
            this.resultModal.classList.remove('hidden');
        }, 500);
    }

    newGame() {
        this.resultModal.classList.add('hidden');
        this.game = new Game();
        this.lastMove = null;
        this.isProcessing = false;
        this.messageEl.textContent = '';
        this.updateAll();

        // If CPU plays first (player chose white)
        if (this.mode === 'cpu' && this.playerColor === WHITE) {
            this.doCPUMove();
        }
    }

    updateLanguage() {
        this.langToggle.textContent = this.t('langToggle');

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (el.tagName === 'OPTION') {
                el.textContent = this.t(key);
            } else if (el.tagName === 'SELECT') {
                // skip selects
            } else {
                el.textContent = this.t(key);
            }
        });

        this.updateTurn();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new UI();
});
