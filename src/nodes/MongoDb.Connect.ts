import { GraphEvalContext, ModuleCompute, ModuleDefinition } from '@nodescript/core/types';

import { MongoDbConnection } from '../lib/MongoDbConnection.js';

type P = {
    url: string;
    adapterUrl: string;
    secret: string;
};
type R = Promise<unknown>;

export const module: ModuleDefinition<P, R> = {
    version: '2.1.1',
    moduleName: 'Mongo DB / Connect',
    description: 'Connects to a MongoDB database. Returns the connection required by other nodes.',
    keywords: ['mongodb', 'database', 'storage', 'connect'],
    params: {
        url: {
            schema: { type: 'string' },
        },
        adapterUrl: {
            schema: {
                type: 'string',
                default: ''
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
    const adapterUrl = getAdapterUrl(params, ctx);
    const databaseUrl = params.url;
    const connection = new MongoDbConnection(databaseUrl, adapterUrl, params.secret);
    await connection.Mongo.connect({ databaseUrl });
    return connection;
};

function getAdapterUrl(params: P, ctx: GraphEvalContext) {
    if (params.adapterUrl) {
        return params.adapterUrl;
    }
    return ctx.getLocal<string>('ADAPTER_MONGODB_URL') ?? 'https://mongodb.adapters.nodescript.dev';
}
