import { ModuleCompute, ModuleDefinition } from '@nodescript/core/types';

import { MongoDbConnectionError } from '../lib/errors.js';
import { MongoDbConnection } from '../lib/MongoDbConnection.js';

type P = {
    url: string;
    adapterUrl: string;
    secret: string;
};
type R = Promise<unknown>;

export const module: ModuleDefinition<P, R> = {
    version: '1.4.0',
    moduleName: 'MongoDB.Connect',
    description: 'Connects to a MongoDB database. Returns the connection required by other nodes.',
    keywords: ['mongodb', 'database', 'storage', 'connect'],
    params: {
        url: {
            schema: { type: 'string' },
        },
        adapterUrl: {
            schema: {
                type: 'string',
                default: 'wss://mongodb.adapters.nodescript.dev/ws'
            },
            advanced: true,
        },
        secret: {
            schema: {
                type: 'string',
                default: ''
            },
            advanced: true,
        },
    },
    result: {
        async: true,
        schema: { type: 'any' },
    },
    evalMode: 'manual',
    cacheMode: 'always',
};

export const compute: ModuleCompute<P, R> = async (params, ctx) => {
    const ws = await new Promise<WebSocket>((resolve, reject) => {
        const ws = new WebSocket(params.adapterUrl);
        ws.addEventListener('open', () => {
            resolve(ws);
        });
        ws.addEventListener('error', () => {
            reject(new MongoDbConnectionError('Could not connect to MongoDB adapter'));
        });
    });
    const { url, secret } = params;
    const connection = new MongoDbConnection(ws);
    const disposableId = 'MongoDB.Connect:' + url;
    await ctx.dispose(disposableId);
    ctx.trackDisposable(disposableId, connection);
    await connection.Mongo.connect({ url, secret });
    return connection;
};
