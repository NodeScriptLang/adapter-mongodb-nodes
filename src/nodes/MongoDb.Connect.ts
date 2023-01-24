import { GraphEvalContext, ModuleCompute, ModuleDefinition } from '@nodescript/core/types';

import { MongoDbConnectionError } from '../lib/errors.js';
import { MongoDbConnection } from '../lib/MongoDbConnection.js';

type P = { url: string };
type R = Promise<unknown>;

export const module: ModuleDefinition<P, R> = {
    version: '1.2.0',
    moduleName: 'MongoDB.Connect',
    description: 'Connects to a MongoDB database. Returns the connection required by other nodes.',
    keywords: ['mongodb', 'database', 'storage', 'connect'],
    params: {
        url: {
            schema: { type: 'string' },
        }
    },
    result: {
        async: true,
        schema: { type: 'any' },
    },
    evalMode: 'manual',
    cacheMode: 'always',
};

export const compute: ModuleCompute<P, R> = async (params, ctx) => {
    const wsUrl = getAdapterWsUrl(ctx);
    const ws = await new Promise<WebSocket>((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        ws.addEventListener('open', () => {
            resolve(ws);
        });
        ws.addEventListener('error', () => {
            reject(new MongoDbConnectionError('Could not connect to MongoDB adapter'));
        });
    });
    const { url } = params;
    const connection = new MongoDbConnection(ws);
    const disposableId = 'MongoDB.Connect:' + url;
    await ctx.dispose(disposableId);
    ctx.trackDisposable(disposableId, connection);
    await connection.Mongo.connect({ url });
    return connection;
};

function getAdapterWsUrl(ctx: GraphEvalContext) {
    const env = ctx.getLocal<string>('NS_ENV', 'production');
    switch (env) {
        case 'development':
            return 'ws://localhost:8183/ws';
        case 'staging':
            return 'wss://mongodb.adapters.staging.nodescript.dev/ws';
        case 'production':
        default:
            return 'wss://mongodb.adapters.nodescript.dev/ws';
    }
}
