import { MongoFilter } from '@nodescript/adapter-mongodb-protocol';
import { ModuleCompute, ModuleDefinition } from '@nodescript/core/types';

import { requireConnection } from '../lib/MongoDbConnection.js';

type P = {
    connection: unknown;
    collection: string;
    filter: MongoFilter;
    multiple: boolean;
};
type R = Promise<unknown>;

export const module: ModuleDefinition<P, R> = {
    moduleId: '@contrib/MongoDb.Delete',
    version: '1.0.0',
    label: 'MongoDB Delete',
    description: 'Deletes documents matching criteria in specified MongoDB collection.',
    keywords: ['mongodb', 'database', 'delete'],
    params: {
        connection: {
            schema: { type: 'any' },
            hideValue: true,
        },
        collection: {
            schema: { type: 'string' },
        },
        filter: {
            schema: {
                type: 'object',
                properties: {},
                additionalProperties: { type: 'any' },
            },
        },
        multiple: {
            schema: { type: 'boolean' },
        }
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
    const filter = params.filter;
    if (params.multiple) {
        return await connection.Mongo.deleteMany({
            collection,
            filter,
        });
    }
    return await connection.Mongo.deleteOne({
        collection,
        filter,
    });
};
