import { MongoFilter, MongoProjection, MongoSort } from '@nodescript/adapter-mongodb-protocol';
import { ModuleCompute, ModuleDefinition } from '@nodescript/core/types';

import { requireConnection } from '../lib/MongoDbConnection.js';

type P = {
    connection: unknown;
    collection: string;
    filter: MongoFilter;
    projection: MongoProjection;
    sort: MongoSort;
    limit: number;
    skip: number;
};
type R = Promise<unknown>;

export const module: ModuleDefinition<P, R> = {
    moduleId: '@contrib/MongoDb.FindMany',
    version: '1.1.0',
    label: 'MongoDB.FindMany',
    description: 'Finds documents in specified MongoDB collection.',
    keywords: ['mongodb', 'database', 'find', 'query'],
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
        projection: {
            schema: {
                type: 'object',
                properties: {},
                additionalProperties: { type: 'any' },
            }
        },
        sort: {
            schema: {
                type: 'object',
                properties: {},
                additionalProperties: { type: 'any' },
            }
        },
        limit: {
            schema: {
                type: 'number',
                default: 1000,
            },
        },
        skip: {
            schema: {
                type: 'number',
                default: 0,
            },
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
    const projection = Object.keys(params.projection).length > 0 ? params.projection : undefined;
    const sort = Object.keys(params.sort).length > 0 ? params.sort : undefined;
    const limit = params.limit;
    const skip = params.skip;
    const { documents } = await connection.Mongo.findMany({
        collection,
        filter,
        projection,
        sort,
        limit,
        skip,
    });
    return documents;
};
