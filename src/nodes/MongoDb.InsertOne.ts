import { MongoDocument } from '@nodescript/adapter-mongodb-protocol';
import { ModuleCompute, ModuleDefinition } from '@nodescript/core/types';

import { requireConnection } from '../lib/MongoDbConnection.js';

type P = {
    connection: unknown;
    collection: string;
    document: MongoDocument;
};
type R = Promise<unknown>;

export const module: ModuleDefinition<P, R> = {
    moduleId: '@contrib/MongoDb.InsertOne',
    version: '1.0.0',
    label: 'MongoDB Insert One',
    description: 'Inserts a single document into specified MongoDB collection.',
    keywords: ['mongodb', 'database', 'insert'],
    params: {
        connection: {
            schema: { type: 'any' },
            hideValue: true,
        },
        collection: {
            schema: { type: 'string' },
        },
        document: {
            schema: {
                type: 'object',
                properties: {},
                additionalProperties: { type: 'any' },
            },
        },
    },
    result: {
        async: true,
        schema: { type: 'any' },
    },
    evalMode: 'manual',
    cacheMode: 'always',
};

export const compute: ModuleCompute<P, R> = async params => {
    const connection = requireConnection(params.connection);
    const collection = params.collection;
    const document = params.document;
    const res = await connection.Mongo.insertOne({
        collection,
        document,
    });
    return res;
};
