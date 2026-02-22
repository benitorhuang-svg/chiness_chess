import { ChessEngine, COLORS } from './engine/chess-engine.js';
import { AIEngine } from './engine/ai-engine.js';
import { Renderer } from './ui/renderer.js';
import { NetworkService } from './services/network.js';

class App {
    constructor() {
        this.engine = new ChessEngine();
        this.ai = new AIEngine(this.engine);
        this.network = new NetworkService(
            (id) => this.handlePeerOpen(id),
            (data) => this.handleRemoteData(data),
            (conn) => this.handleConnection(conn)
        );

        this.renderer = new Renderer(
            document.getElementById('board-ui'),
            document.getElementById('pieces-layer'),
            (x, y) => this.handlePieceClick(x, y),
            (x, y) => this.handleMove(x, y)
        );

        this.selected = null;
        this.hints = [];
        this.myColor = null;
        this.gameStarted = false;
        this.elapsedSeconds = 0;
        this.aiEnabled = false;
        this.aiDepth = 2; // 預設入門
        this.gameOver = false; // 新增遊戲結束狀態

        this.init();
    }

    init() {
        // Tab system
        document.querySelectorAll('.tab-trigger').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Network Init
        const urlParams = new URLSearchParams(window.location.search);
        const room = urlParams.get('room');
        this.network.init();
        if (room) this.autoJoin(room);

        this.update();
        setInterval(() => this.tick(), 1000);

        // Bind UI Actions
        document.getElementById('btn-invite').onclick = () => this.showInviteModal();
        document.getElementById('btn-join-confirm').onclick = () => this.joinPeer();
        document.getElementById('modal-close').onclick = () => this.hideModal();
        document.getElementById('btn-undo').onclick = () => this.undo();
        document.getElementById('btn-reset').onclick = () => this.reset();

        document.getElementById('ai-toggle').onchange = (e) => {
            this.aiEnabled = e.target.checked;
            if (this.aiEnabled && this.engine.turn === COLORS.BLACK && !this.network.conn) {
                this.aiMove();
            }
        };

        // UI Difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.aiDepth = parseInt(btn.dataset.depth);
                this.showToast(`難易度已設定: ${btn.innerText}`);
            });
        });

        this.update();
        setInterval(() => this.tick(), 1000);
    }

    aiMove() {
        if (!this.aiEnabled || this.network.conn) return;

        setTimeout(() => {
            const bestMove = this.ai.getBestMove(this.aiDepth);
            if (bestMove) {
                const moveEntry = this.engine.move(bestMove.sx, bestMove.sy, bestMove.tx, bestMove.ty);
                this.update();
                this.checkWin(moveEntry);
            }
        }, 600);
    }

    checkWin(moveEntry) {
        if (moveEntry.captured && "將帥".includes(moveEntry.captured.type)) {
            this.gameOver = true;
            this.showToast(`比賽結束！${moveEntry.moved.color === COLORS.RED ? '紅方' : '黑方'} 贏了`);
        }
    }

    autoJoin(room) {
        this.showToast("偵測到房間連結，連線中...");
        setTimeout(() => {
            if (!this.myColor) this.myColor = COLORS.BLACK;
            this.network.connect(room);
        }, 1000);
    }

    undo(remote = false) {
        if (this.myColor && this.engine.turn !== this.myColor && !remote) return;
        const last = this.engine.undo();
        if (last && !remote) this.network.send({ type: 'undo' });
        this.update();
    }

    reset(remote = false) {
        if (remote || confirm("確定要重置棋盤嗎？")) {
            this.engine = new ChessEngine();
            this.gameStarted = false;
            this.gameOver = false;
            this.elapsedSeconds = 0;
            if (!remote) this.network.send({ type: 'reset' });
            this.update();
            this.showToast("棋盤已重置");
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-trigger').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
        document.querySelectorAll('.tab-view').forEach(v => v.classList.toggle('active', v.id === `tab-${tabId}`));
    }

    handlePieceClick(x, y) {
        if (this.gameOver) return; // 遊戲結束後禁止點擊
        if (this.myColor && this.engine.turn !== this.myColor) return;

        // 核心修復：如果已經有選取棋子，且點擊的是「可攻擊」的敵方棋子
        if (this.selected && this.hints.some(h => h.x === x && h.y === y)) {
            this.handleMove(x, y);
            return;
        }

        const piece = this.engine.board[y][x];
        if (piece && piece.color === this.engine.turn) {
            this.selected = { x, y };
            this.hints = this.engine.getMoves(x, y);
        } else {
            this.selected = null;
            this.hints = [];
        }
        this.update();
    }

    handleMove(tx, ty) {
        const sx = this.selected.x;
        const sy = this.selected.y;

        // 第一步棋啟動計時
        if (!this.gameStarted) this.gameStarted = true;

        const moveEntry = this.engine.move(sx, sy, tx, ty);
        this.network.send({ type: 'move', sx, sy, tx, ty });

        this.selected = null;
        this.hints = [];
        this.update();

        this.checkWin(moveEntry);

        // 如果是單機且 AI 開啟，輪到 AI 走子
        if (!this.network.conn && this.aiEnabled && this.engine.turn === COLORS.BLACK) {
            this.aiMove();
        }
    }

    handleRemoteData(data) {
        if (data.type === 'move') {
            if (!this.gameStarted) this.gameStarted = true;
            this.engine.move(data.sx, data.sy, data.tx, data.ty);
        } else if (data.type === 'undo') {
            this.engine.undo();
        } else if (data.type === 'reset') {
            this.engine = new ChessEngine();
            this.gameStarted = false;
            this.elapsedSeconds = 0;
        }
        this.update();
    }

    handlePeerOpen(id) {
        document.getElementById('my-id-display').innerText = id;
        document.getElementById('invite-url').value = `${window.location.origin}${window.location.pathname}?room=${id}`;
    }

    handleConnection(conn) {
        this.hideModal();
        if (!this.myColor) {
            this.myColor = COLORS.BLACK;
            this.showToast("連線成功！您是黑方");
        } else {
            this.showToast("連線成功！您是紅方");
        }
        this.update();
    }

    joinPeer() {
        const id = document.getElementById('join-id-input').value.trim();
        if (id) {
            this.myColor = COLORS.RED;
            this.network.connect(id);
        }
    }

    update() {
        const isFlipped = (this.myColor === COLORS.BLACK);
        this.renderer.render(this.engine.board, this.selected, this.hints, this.engine.history.slice(-1)[0], isFlipped);

        document.getElementById('turn-label').innerText = this.engine.turn === COLORS.RED ? "紅方走子" : "黑方走子";
        document.getElementById('turn-dot').style.background = this.engine.turn === COLORS.RED ? "var(--piece-red)" : "#222";

        const roleLabel = document.getElementById('my-role');
        roleLabel.innerText = this.myColor ? (this.myColor === COLORS.RED ? '紅方 (房主)' : '黑方 (訪客)') : '單機模式';

        // Render History
        const list = document.getElementById('history-list');
        if (this.engine.history.length === 0) {
            list.innerHTML = `<div style="text-align:center; color:#555; margin-top:50px;">尚無走法紀錄</div>`;
        } else {
            list.innerHTML = this.engine.history.map((h, i) => `
                <div class="history-row">
                    <span class="history-num">${i + 1}.</span>
                    <span>${h.notation}</span>
                </div>
            `).join('');
            list.scrollTop = list.scrollHeight;
        }
    }

    tick() {
        if (!this.gameStarted) {
            document.getElementById('time-display').innerText = `00:00`;
            return;
        }
        this.elapsedSeconds++;
        const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
        const s = String(this.elapsedSeconds % 60).padStart(2, '0');
        document.getElementById('time-display').innerText = `${m}:${s}`;
    }

    showInviteModal() {
        document.getElementById('modal-invite').style.display = 'flex';
    }

    hideModal() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    }

    showToast(msg) {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.style.opacity = 1;
        setTimeout(() => t.style.opacity = 0, 3000);
    }
}

window.gameApp = new App();
