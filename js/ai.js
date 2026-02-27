// Othello AI - Minimax with Alpha-Beta Pruning
class AI {
    constructor() {
        // Position weight table - corners are most valuable, adjacent to corners least
        this.WEIGHT_TABLE = [
            [120, -20,  20,   5,   5,  20, -20, 120],
            [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
            [ 20,  -5,  15,   3,   3,  15,  -5,  20],
            [  5,  -5,   3,   3,   3,   3,  -5,   5],
            [  5,  -5,   3,   3,   3,   3,  -5,   5],
            [ 20,  -5,  15,   3,   3,  15,  -5,  20],
            [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
            [120, -20,  20,   5,   5,  20, -20, 120]
        ];

        this.depthMap = {
            easy: 0,
            normal: 3,
            hard: 5
        };
    }

    getBestMove(game, difficulty) {
        const moves = game.getValidMoves(game.currentPlayer);
        if (moves.length === 0) return null;

        if (difficulty === 'easy') {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        const depth = this.depthMap[difficulty] || 3;
        let bestScore = -Infinity;
        let bestMove = moves[0];

        for (const [r, c] of moves) {
            const clone = game.clone();
            clone.makeMove(r, c, clone.currentPlayer);
            clone.switchTurn();

            const score = this.minimax(clone, depth - 1, -Infinity, Infinity, false, game.currentPlayer);

            if (score > bestScore) {
                bestScore = score;
                bestMove = [r, c];
            }
        }

        return bestMove;
    }

    minimax(game, depth, alpha, beta, isMaximizing, aiPlayer) {
        if (depth === 0 || game.gameOver) {
            return this.evaluate(game, aiPlayer);
        }

        const moves = game.getValidMoves(game.currentPlayer);

        if (moves.length === 0) {
            const clone = game.clone();
            const result = clone.switchTurn();
            if (result === 'gameover') {
                return this.evaluate(game, aiPlayer);
            }
            return this.minimax(clone, depth - 1, alpha, beta, !isMaximizing, aiPlayer);
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const [r, c] of moves) {
                const clone = game.clone();
                clone.makeMove(r, c, clone.currentPlayer);
                clone.switchTurn();
                const evalScore = this.minimax(clone, depth - 1, alpha, beta, false, aiPlayer);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const [r, c] of moves) {
                const clone = game.clone();
                clone.makeMove(r, c, clone.currentPlayer);
                clone.switchTurn();
                const evalScore = this.minimax(clone, depth - 1, alpha, beta, true, aiPlayer);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    evaluate(game, aiPlayer) {
        const opponent = game.opponent(aiPlayer);
        const score = game.getScore();
        const aiCount = aiPlayer === BLACK ? score.black : score.white;
        const oppCount = aiPlayer === BLACK ? score.white : score.black;
        const totalDiscs = aiCount + oppCount;

        // End game - disc count is everything
        if (game.gameOver || totalDiscs >= 58) {
            return (aiCount - oppCount) * 1000;
        }

        let positionScore = 0;
        let mobilityScore = 0;
        let cornerScore = 0;
        let stabilityScore = 0;

        // Position weights
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (game.board[r][c] === aiPlayer) {
                    positionScore += this.WEIGHT_TABLE[r][c];
                } else if (game.board[r][c] === opponent) {
                    positionScore -= this.WEIGHT_TABLE[r][c];
                }
            }
        }

        // Mobility (number of available moves)
        const aiMoves = game.getValidMoves(aiPlayer).length;
        const oppMoves = game.getValidMoves(opponent).length;
        if (aiMoves + oppMoves > 0) {
            mobilityScore = 100 * (aiMoves - oppMoves) / (aiMoves + oppMoves);
        }

        // Corners
        const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
        for (const [r, c] of corners) {
            if (game.board[r][c] === aiPlayer) cornerScore += 25;
            else if (game.board[r][c] === opponent) cornerScore -= 25;
        }

        // Frontier discs (discs adjacent to empty cells - fewer is better)
        let aiFrontier = 0;
        let oppFrontier = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (game.board[r][c] !== EMPTY) {
                    for (const [dr, dc] of DIRECTIONS) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (game.isInBounds(nr, nc) && game.board[nr][nc] === EMPTY) {
                            if (game.board[r][c] === aiPlayer) aiFrontier++;
                            else oppFrontier++;
                            break;
                        }
                    }
                }
            }
        }
        if (aiFrontier + oppFrontier > 0) {
            stabilityScore = -100 * (aiFrontier - oppFrontier) / (aiFrontier + oppFrontier);
        }

        // Weighted combination - adjust based on game phase
        if (totalDiscs < 20) {
            // Early game: mobility and position matter most
            return positionScore * 2 + mobilityScore * 3 + cornerScore * 4 + stabilityScore * 2;
        } else if (totalDiscs < 50) {
            // Mid game: balanced
            return positionScore * 1.5 + mobilityScore * 2 + cornerScore * 5 + stabilityScore * 2;
        } else {
            // Late game: disc count starts to matter
            return positionScore + mobilityScore + cornerScore * 5 + stabilityScore + (aiCount - oppCount) * 3;
        }
    }
}
