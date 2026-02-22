/**
 * 工業級象棋邏輯引擎 (Industrial Chess Engine)
 * 負責所有走法驗證與狀態維護
 */

export const COLORS = { RED: 'red', BLACK: 'black' };
export const TYPES = {
    KING: '帥', ADVISOR: '仕', ELEPHANT: '相', HORSE: '傌', CHARIOT: '俥', CANNON: '砲', SOLDIER: '兵',
    B_KING: '將', B_ADVISOR: '士', B_ELEPHANT: '象', B_HORSE: '馬', B_CHARIOT: '車', B_CANNON: '炮', B_SOLDIER: '卒'
};

export class ChessEngine {
    constructor() {
        this.board = Array(10).fill(null).map(() => Array(9).fill(null));
        this.turn = COLORS.RED;
        this.history = [];
        this.captured = { red: [], black: [] };
        this.init();
    }

    init() {
        const layout = [
            [0, 0, TYPES.B_CHARIOT, COLORS.BLACK], [0, 8, TYPES.B_CHARIOT, COLORS.BLACK],
            [0, 1, TYPES.B_HORSE, COLORS.BLACK], [0, 7, TYPES.B_HORSE, COLORS.BLACK],
            [0, 2, TYPES.B_ELEPHANT, COLORS.BLACK], [0, 6, TYPES.B_ELEPHANT, COLORS.BLACK],
            [0, 3, TYPES.B_ADVISOR, COLORS.BLACK], [0, 5, TYPES.B_ADVISOR, COLORS.BLACK],
            [0, 4, TYPES.B_KING, COLORS.BLACK],
            [2, 1, TYPES.B_CANNON, COLORS.BLACK], [2, 7, TYPES.B_CANNON, COLORS.BLACK],
            [3, 0, TYPES.B_SOLDIER, COLORS.BLACK], [3, 2, TYPES.B_SOLDIER, COLORS.BLACK], [3, 4, TYPES.B_SOLDIER, COLORS.BLACK], [3, 6, TYPES.B_SOLDIER, COLORS.BLACK], [3, 8, TYPES.B_SOLDIER, COLORS.BLACK],

            [9, 0, TYPES.CHARIOT, COLORS.RED], [9, 8, TYPES.CHARIOT, COLORS.RED],
            [9, 1, TYPES.HORSE, COLORS.RED], [9, 7, TYPES.HORSE, COLORS.RED],
            [9, 2, TYPES.ELEPHANT, COLORS.RED], [9, 6, TYPES.ELEPHANT, COLORS.RED],
            [9, 3, TYPES.ADVISOR, COLORS.RED], [9, 5, TYPES.ADVISOR, COLORS.RED],
            [9, 4, TYPES.KING, COLORS.RED],
            [7, 1, TYPES.CANNON, COLORS.RED], [7, 7, TYPES.CANNON, COLORS.RED],
            [6, 0, TYPES.SOLDIER, COLORS.RED], [6, 2, TYPES.SOLDIER, COLORS.RED], [6, 4, TYPES.SOLDIER, COLORS.RED], [6, 6, TYPES.SOLDIER, COLORS.RED], [6, 8, TYPES.SOLDIER, COLORS.RED],
        ];
        layout.forEach(([y, x, t, c]) => this.board[y][x] = { type: t, color: c });
    }

    getMoves(x, y) {
        const moves = [];
        const piece = this.board[y][x];
        if (!piece) return [];

        for (let ny = 0; ny < 10; ny++) {
            for (let nx = 0; nx < 9; nx++) {
                if (this.isValidMove(x, y, nx, ny)) moves.push({ x: nx, y: ny });
            }
        }
        return moves;
    }

    isValidMove(sx, sy, tx, ty) {
        const piece = this.board[sy][sx];
        const target = this.board[ty][tx];
        if (target && target.color === piece.color) return false;

        const dx = Math.abs(tx - sx);
        const dy = Math.abs(ty - sy);

        switch (piece.type) {
            case TYPES.KING: case TYPES.B_KING:
                // 1. 普通走法：九宮格內走一步
                const isNormalMove = dx + dy === 1 && tx >= 3 && tx <= 5 && (piece.color === COLORS.RED ? ty >= 7 : ty <= 2);
                if (isNormalMove) return true;

                // 2. 特殊走法：飛將 (兩將對面)
                if (sx === tx && target && (target.type === TYPES.KING || target.type === TYPES.B_KING)) {
                    return this.countBetween(sx, sy, tx, ty) === 0;
                }
                return false;

            case TYPES.ADVISOR: case TYPES.B_ADVISOR:
                return dx === 1 && dy === 1 && tx >= 3 && tx <= 5 && (piece.color === COLORS.RED ? ty >= 7 : ty <= 2);
            case TYPES.ELEPHANT: case TYPES.B_ELEPHANT:
                return dx === 2 && dy === 2 && (piece.color === COLORS.RED ? ty >= 5 : ty <= 4) && !this.board[(sy + ty) / 2][(sx + tx) / 2];
            case TYPES.HORSE: case TYPES.B_HORSE:
                if (dx === 1 && dy === 2) return !this.board[sy + (ty - sy) / 2][sx];
                if (dx === 2 && dy === 1) return !this.board[sy][sx + (tx - sx) / 2];
                return false;
            case TYPES.CHARIOT: case TYPES.B_CHARIOT:
                return (sx === tx || sy === ty) && this.countBetween(sx, sy, tx, ty) === 0;
            case TYPES.CANNON: case TYPES.B_CANNON:
                const count = this.countBetween(sx, sy, tx, ty);
                return (sx === tx || sy === ty) && (target ? count === 1 : count === 0);
            case TYPES.SOLDIER: case TYPES.B_SOLDIER:
                const forward = piece.color === COLORS.RED ? -1 : 1;
                const crossed = piece.color === COLORS.RED ? sy <= 4 : sy >= 5;
                if (tx === sx && ty - sy === forward) return true;
                if (crossed && dy === 0 && dx === 1) return true;
                return false;
        }
        return false;
    }

    countBetween(sx, sy, tx, ty) {
        let count = 0;
        if (sx === tx) {
            for (let i = Math.min(sy, ty) + 1; i < Math.max(sy, ty); i++) if (this.board[i][sx]) count++;
        } else {
            for (let i = Math.min(sx, tx) + 1; i < Math.max(sx, tx); i++) if (this.board[sy][i]) count++;
        }
        return count;
    }

    move(sx, sy, tx, ty) {
        const moved = this.board[sy][sx];
        const captured = this.board[ty][tx];
        const notation = this.generateNotation(sx, sy, tx, ty, moved);

        const moveEntry = { sx, sy, tx, ty, moved, captured, notation };
        this.history.push(moveEntry);

        this.board[ty][tx] = moved;
        this.board[sy][sx] = null;
        this.turn = this.turn === COLORS.RED ? COLORS.BLACK : COLORS.RED;
        return moveEntry;
    }

    undo() {
        if (this.history.length === 0) return null;
        const last = this.history.pop();
        this.board[last.sy][last.sx] = last.moved;
        this.board[last.ty][last.tx] = last.captured;
        this.turn = last.moved.color;
        return last;
    }

    generateNotation(sx, sy, tx, ty, p) {
        const cn = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const en = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const isRed = p.color === COLORS.RED;
        const n = isRed ? cn : en;

        // 座標轉換 (繁體中文習慣)
        const sx_n = isRed ? (8 - sx) : sx;
        const tx_n = isRed ? (8 - tx) : tx;

        // 處理「前/後」邏輯：同一直線上是否有相同棋子
        let prefix = p.type;
        const samePieces = [];
        for (let y = 0; y < 10; y++) {
            const op = this.board[y][sx];
            if (op && op.type === p.type && op.color === p.color) {
                samePieces.push({ y });
            }
        }

        if (samePieces.length > 1) {
            // 排序：紅方 y 愈大 (下方) 愈前? 不對，紅方前面是 y 較小的地方
            // 象棋規則：紅方靠近對手的是「前」，y 較小。
            samePieces.sort((a, b) => a.y - b.y);
            const index = samePieces.findIndex(item => item.y === sy);
            if (p.color === COLORS.RED) {
                // 紅方 y 愈小愈前
                prefix = (index === 0 ? '前' : '後') + p.type;
            } else {
                // 黑方 y 愈大愈前 (黑方視覺)
                prefix = (index === samePieces.length - 1 ? '前' : '後') + p.type;
            }
            // 如果只有兩枚且偵測到前後，則不顯示原本的橫線序
            // 例如：前炮平五，而非 前炮二平五 (除非是兵卒，可能會有中炮等更多複雜情況，此處先實做基礎前後)
        }

        let action = sy === ty ? "平" : (isRed ? (ty < sy ? "進" : "退") : (ty > sy ? "進" : "退"));
        let dist = Math.abs(ty - sy);

        let endVal = action === "平" ? n[tx_n] : n[dist - 1];
        if ("馬傌象相士仕".includes(p.type)) endVal = n[tx_n];

        // 如果有前後前綴，第二個字通常省略橫線序 (除非是兵卒)
        const firstPart = samePieces.length > 1 ? prefix : `${p.type}${n[sx_n]}`;
        return `${firstPart}${action}${endVal}`;
    }
}
