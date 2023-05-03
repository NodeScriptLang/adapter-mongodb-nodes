import { MongoDomain, MongoProtocol, mongoProtocol } from '@nodescript/adapter-mongodb-protocol';
import { Disposable } from '@nodescript/core/types';
import { InvalidTypeError } from '@nodescript/core/util';
import { createHttpClient, RpcClient, RpcMethodRequest } from '@nodescript/protocomm';

import { MongoDbConnectionError } from './errors.js';

const SYM_MONGODB_CONNECTION = Symbol.for('ns:MongoDbConnection');
const SYM_MONGODB_CONNECTION_V2 = Symbol.for('ns:MongoDbConnectionV2');

export type MongoDbConnection = { Mongo: MongoDomain; databaseUrl?: string };

export function requireConnection(value: unknown): MongoDbConnection {
    if ((value as any)[SYM_MONGODB_CONNECTION_V2]) {
        return value as MongoDbConnectionV2;
    }
    if ((value as any)[SYM_MONGODB_CONNECTION]) {
        const connection = value as MongoDbConnectionV1;
        if (!connection.connected) {
            throw new MongoDbConnectionError('MongoDB disconnected');
        }
        return connection;
    }
    throw new InvalidTypeError('MongoDB Connection required. Use the output of MongoDB Connect node.');
}

export class MongoDbConnectionV1 implements Disposable, MongoDbConnection {

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

export class MongoDbConnectionV2 implements MongoDbConnection {

    rpc: MongoProtocol;

    constructor(readonly databaseUrl: string, adapterUrl: string) {
        this.rpc = createHttpClient(mongoProtocol, {
            baseUrl: adapterUrl,
        });
    }

    get Mongo() {
        return this.rpc.Mongo;
    }

    get [SYM_MONGODB_CONNECTION_V2]() {
        return true;
    }

}
