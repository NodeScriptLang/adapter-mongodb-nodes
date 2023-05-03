import { MongoProtocol, mongoProtocol } from '@nodescript/adapter-mongodb-protocol';
import { InvalidTypeError } from '@nodescript/core/util';
import { createHttpClient } from '@nodescript/protocomm';

const SYM_MONGODB_CONNECTION = Symbol.for('ns:MongoDbConnection');

export function requireConnection(value: unknown): MongoDbConnection {
    if ((value as any)[SYM_MONGODB_CONNECTION]) {
        return value as MongoDbConnection;
    }
    throw new InvalidTypeError('MongoDB Connection required. Use the output of MongoDB Connect node.');
}

export class MongoDbConnection {

    rpc: MongoProtocol;

    constructor(readonly databaseUrl: string, readonly adapterUrl: string, secret?: string) {
        this.rpc = createHttpClient(mongoProtocol, {
            baseUrl: adapterUrl,
            headers: secret ? {
                authorization: `Bearer ${secret}`,
            } : undefined,
        });
    }

    get Mongo() {
        return this.rpc.Mongo;
    }

    get [SYM_MONGODB_CONNECTION]() {
        return true;
    }

}
