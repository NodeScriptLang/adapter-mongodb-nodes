import { MongoProtocol, mongoProtocol } from '@nodescript/adapter-mongodb-protocol';
import { Disposable } from '@nodescript/core/types';
import { InvalidTypeError } from '@nodescript/core/util';
import { RpcClient, RpcMethodRequest } from '@nodescript/protocomm';

import { MongoDbConnectionError } from './errors.js';

const SYM_MONGODB_CONNECTION = Symbol.for('ns:MongoDbConnection');

export function requireConnection(value: unknown): MongoDbConnection {
    if (!(value as any)[SYM_MONGODB_CONNECTION]) {
        throw new InvalidTypeError('MongoDB Connection required. Use the output of MongoDB Connect node.');
    }
    const connection = value as MongoDbConnection;
    if (!connection.connected) {
        throw new MongoDbConnectionError('MongoDB disconnected');
    }
    return connection;
}

export class MongoDbConnection implements Disposable {

    ws!: WebSocket;
    rpcClient!: RpcClient<MongoProtocol>;
    connected!: boolean;

    constructor(ws: WebSocket) {
        Object.defineProperties(this, {
            rpcClient: {
                enumerable: false,
                value: new RpcClient(mongoProtocol, req => this.sendRequest(req)),
            },
            ws: {
                enumerable: false,
                value: ws,
            },
            connected: {
                enumerable: false,
                writable: true,
                value: true,
            }
        });
        ws.addEventListener('message', ev => this.onMessage(ev));
        ws.addEventListener('close', () => this.onClose());
    }

    get [SYM_MONGODB_CONNECTION]() {
        return true;
    }

    get Mongo() {
        return this.rpcClient.client.Mongo;
    }

    dispose() {
        this.ws.close();
    }

    private sendRequest(req: RpcMethodRequest) {
        this.ws.send(JSON.stringify(req));
    }

    private onMessage(ev: MessageEvent) {
        this.rpcClient.processMessage(ev.data);
    }

    private onClose() {
        this.rpcClient.handleClose();
        this.connected = false;
    }

}
