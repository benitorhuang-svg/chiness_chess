/**
 * 工業級 AI 引擎 - PRO 升級版
 * 1. 採用 Minimax 與 Alpha-Beta 剪枝
 * 2. 引入 PST (Piece-Square Tables) 位元權重評估
 * 3. 優化搜尋效率 (使用 Undo 取代 Clone)
 * 4. 加入走法排序 (提高剪枝率)
 */

import { COLORS, TYPES } from './chess-engine.js';

export class AIEngine {
    constructor(engine) {
        this.engine = engine;

        // 基礎棋子價值
        this.BASE_VALUES = {
            [TYPES.KING]: 10000, [TYPES.B_KING]: 10000,
            [TYPES.CHARIOT]: 1000, [TYPES.B_CHARIOT]: 1000,
            [TYPES.CANNON]: 450, [TYPES.B_CANNON]: 450,
            [TYPES.HORSE]: 400, [TYPES.B_HORSE]: 400,
            [TYPES.ELEPHANT]: 200, [TYPES.B_ELEPHANT]: 200,
            [TYPES.ADVISOR]: 200, [TYPES.B_ADVISOR]: 200,
            [TYPES.SOLDIER]: 100, [TYPES.B_SOLDIER]: 100
        };

        // 兵/卒 位元權重 (過河後變強)
        this.PST_SOLDIER = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [10, 20, 30, 40, 40, 40, 30, 20, 10],
            [20, 40, 60, 80, 80, 80, 60, 40, 20],
            [30, 60, 90, 120, 120, 120, 90, 60, 30],
            [40, 80, 110, 140, 150, 140, 110, 80, 40],
            [50, 90, 120, 150, 160, 150, 120, 90, 50]
        ];

        // 馬位元權重 (鼓勵中心化噴發)
        this.PST_HORSE = [
            [20, 20, 20, 20, 20, 20, 20, 20, 20],
            [20, 40, 40, 40, 40, 40, 40, 40, 20],
            [20, 40, 60, 60, 60, 60, 60, 40, 20],
            [20, 40, 60, 80, 80, 80, 60, 40, 20],
            [20, 40, 60, 80, 80, 80, 60, 40, 20],
            [20, 40, 60, 80, 80, 80, 60, 40, 20],
            [20, 40, 60, 80, 80, 80, 60, 40, 20],
            [20, 40, 60, 60, 60, 60, 60, 40, 20],
            [20, 40, 40, 40, 40, 40, 40, 40, 20],
            [20, 20, 20, 20, 20, 20, 20, 20, 20]
        ];
    }

    getBestMove(depth = 3) {
        const turn = this.engine.turn;
        let moves = this.getAllValidMoves(turn);
        if (moves.length === 0) return null;

        // 簡單排序：吃子優先 (Static Ordering)
        moves.sort((a, b) => {
            const valA = this.getCaptureValue(a.tx, a.ty);
            const valB = this.getCaptureValue(b.tx, b.ty);
            return valB - valA;
        });

        let bestMove = null;
        let bestValue = turn === COLORS.RED ? -Infinity : Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        for (const move of moves) {
            this.engine.move(move.sx, move.sy, move.tx, move.ty);
            const boardValue = this.minimax(depth - 1, alpha, beta, turn === COLORS.BLACK);
            this.engine.undo();

            if (turn === COLORS.RED) {
                if (boardValue > bestValue) {
                    bestValue = boardValue;
                    bestMove = move;
                }
                alpha = Math.max(alpha, boardValue);
            } else {
                if (boardValue < bestValue) {
                    bestValue = boardValue;
                    bestMove = move;
                }
                beta = Math.min(beta, boardValue);
            }
        }
        return bestMove;
    }

    minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0) return this.evaluateBoard();

        const turn = isMaximizing ? COLORS.RED : COLORS.BLACK;
        const moves = this.getAllValidMoves(turn);

        // 如果沒有走法，則判輸 (被將死)
        if (moves.length === 0) return isMaximizing ? -90000 : 90000;

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                this.engine.move(move.sx, move.sy, move.tx, move.ty);
                const evalVal = this.minimax(depth - 1, alpha, beta, false);
                this.engine.undo();
                maxEval = Math.max(maxEval, evalVal);
                alpha = Math.max(alpha, evalVal);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                this.engine.move(move.sx, move.sy, move.tx, move.ty);
                const evalVal = this.minimax(depth - 1, alpha, beta, true);
                this.engine.undo();
                minEval = Math.min(minEval, evalVal);
                beta = Math.min(beta, evalVal);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    evaluateBoard() {
        let score = 0;
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const piece = this.engine.board[y][x];
                if (!piece) continue;

                let val = this.BASE_VALUES[piece.type] || 0;

                // 加成：位置權重
                if (piece.type === TYPES.SOLDIER || piece.type === TYPES.B_SOLDIER) {
                    // 紅兵 y 小為上(前)，黑卒 y 大為下(前)
                    const py = piece.color === COLORS.RED ? (9 - y) : y;
                    val += this.PST_SOLDIER[py][x];
                } else if (piece.type === TYPES.HORSE || piece.type === TYPES.B_HORSE) {
                    val += this.PST_HORSE[y][x];
                }

                score += (piece.color === COLORS.RED ? val : -val);
            }
        }
        return score;
    }

    getAllValidMoves(color) {
        const moves = [];
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const p = this.engine.board[y][x];
                if (p && p.color === color) {
                    const targets = this.engine.getMoves(x, y);
                    targets.forEach(t => moves.push({ sx: x, sy: y, tx: t.x, ty: t.y }));
                }
            }
        }
        return moves;
    }

    getCaptureValue(x, y) {
        const target = this.engine.board[y][x];
        if (!target) return 0;
        return this.BASE_VALUES[target.type] || 0;
    }
}
