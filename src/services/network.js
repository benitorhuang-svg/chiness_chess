/**
 * 工業級 P2P 通訊服務
 * 封裝 PeerJS 互動
 */

export class NetworkService {
    constructor(onOpen, onData, onConn) {
        this.peer = null;
        this.conn = null;
        this.onOpen = onOpen;
        this.onData = onData;
        this.onConn = onConn;
    }

    init(customId = null) {
        if (this.peer) this.peer.destroy();
        this.peer = customId ? new Peer(customId) : new Peer();

        this.peer.on('open', (id) => this.onOpen(id));
        this.peer.on('connection', (c) => this.handleConnection(c));
        this.peer.on('error', (err) => {
            console.error('Peer Error:', err);
            if (err.type === 'unavailable-id') {
                alert('ID 已被佔用，請更換。');
                this.init();
            }
        });
    }

    handleConnection(c) {
        this.conn = c;
        this.conn.on('data', (data) => this.onData(data));
        if (this.onConn) this.onConn(this.conn);
    }

    connect(remoteId) {
        this.conn = this.peer.connect(remoteId);
        this.conn.on('open', () => {
            if (this.onConn) this.onConn(this.conn);
        });
        this.conn.on('data', (data) => this.onData(data));
    }

    send(data) {
        if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    }
}
