/**
 * 工業級 UI 渲染器
 * 負責棋盤、棋子與提示的 DOM 管理
 */

export class Renderer {
    constructor(boardElement, piecesLayer, onPieceClick, onHintClick) {
        this.boardElement = boardElement;
        this.piecesLayer = piecesLayer;
        this.onPieceClick = onPieceClick;
        this.onHintClick = onHintClick;
    }

    render(board, selected, hints, lastMove, isFlipped = false) {
        this.piecesLayer.innerHTML = '';

        // Toggle board flip class
        this.boardElement.classList.toggle('flipped', isFlipped);

        // 1. Last Move Marker
        if (lastMove) {
            this.createMarker(lastMove.sx, lastMove.sy, 'rgba(255,255,255,0.2)');
            this.createMarker(lastMove.tx, lastMove.ty, 'rgba(227, 192, 141, 0.8)');
        }

        // 2. Hints
        hints.forEach(h => {
            const el = document.createElement('div');
            el.className = 'move-hint';
            el.style.left = (h.x / 8 * 100) + '%';
            el.style.top = (h.y / 9 * 100) + '%';
            // 增加提示的可視度
            el.innerHTML = '<div class="hint-dot" style="box-shadow: 0 0 10px var(--accent);"></div>';
            el.onclick = (e) => { e.stopPropagation(); this.onHintClick(h.x, h.y); };
            this.piecesLayer.appendChild(el);
        });

        // 3. Pieces
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const piece = board[y][x];
                if (piece) {
                    const el = document.createElement('div');
                    el.className = `piece ${piece.color} ${selected && selected.x === x && selected.y === y ? 'selected' : ''}`;
                    el.style.left = (x / 8 * 100) + '%';
                    el.style.top = (y / 9 * 100) + '%';
                    el.innerHTML = `<div class="piece-inner">${piece.type}</div>`;
                    el.onclick = (e) => { e.stopPropagation(); this.onPieceClick(x, y); };
                    this.piecesLayer.appendChild(el);
                }
            }
        }
    }

    createMarker(x, y, color) {
        const el = document.createElement('div');
        el.className = 'last-move-marker';
        el.style.position = 'absolute';
        el.style.width = '11.5%'; el.style.height = '10.2%';
        el.style.left = (x / 8 * 100) + '%';
        el.style.top = (y / 9 * 100) + '%';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.border = `2px solid ${color}`;
        el.style.borderRadius = '5px';
        el.style.pointerEvents = 'none';
        this.piecesLayer.appendChild(el);
    }
}
