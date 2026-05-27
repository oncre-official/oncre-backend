import { ObjectId } from 'mongodb';
import { Model, PopulateOptions, UpdateResult } from 'mongoose';

import { normalizeMongoIds } from '@on/helpers/db';

export interface AggregateOption {
  limit?: number;
  skip?: number;
}

type GenericRecord = Record<string, any> | any;

interface Options {
  aggregate?: AggregateOption;
  populate?: PopulateOptions[];
  sort?: { [key: string]: number };
  select?: string[];
  projection?: { [key: string]: number };
  pipeline?: any[];
}

export class BaseRepository<T> {
  constructor(private readonly repository: Model<T>) {}

  async find(query?: GenericRecord, options?: Options): Promise<T[]> {
    return await this.queryBuilder(query, options?.populate, options?.sort).exec();
  }

  async findOne(query: GenericRecord, options?: Options): Promise<T> {
    const parsedQuery = normalizeMongoIds(query);

    let queryBuilder: any = this.repository.findOne(parsedQuery);

    if (options && options.populate) queryBuilder = queryBuilder.populate(options.populate);

    return await queryBuilder.exec();
  }

  async findById(id: string | ObjectId, options?: Options): Promise<T> {
    const objectId = new ObjectId(String(id));
    let queryBuilder: any = this.repository.findById(objectId);

    if (options && options.populate) queryBuilder = queryBuilder.populate(options.populate);

    return await queryBuilder.exec();
  }

  async findAndCount(query: GenericRecord, options?: Options): Promise<{ row: T[]; count: number }> {
    const dataQueryBuilder = this.queryBuilder(query, options.populate, options?.sort);
    const countQueryBuilder = this.repository.find(query);

    const [data, count] = await Promise.all([
      dataQueryBuilder
        .select(options.select || '')
        .skip(options.aggregate?.skip || 0)
        .limit(options.aggregate?.limit || 0)
        .exec(),
      countQueryBuilder.countDocuments().exec(),
    ]);

    return { row: data, count };
  }

  async findOneAndCreate(query: GenericRecord, payload: GenericRecord, options?: Options): Promise<T> {
    const parsedQuery = normalizeMongoIds(query);

    let queryBuilder: any = this.repository.findOneAndUpdate(
      parsedQuery,
      { $setOnInsert: payload },
      { new: true, upsert: true },
    );

    if (options?.populate) queryBuilder = queryBuilder.populate(options.populate);

    return await queryBuilder.exec();
  }

  async aggregate(query: any, options?: Options): Promise<T[]> {
    const aggregationPipeline: any[] = query;
    const option = options?.aggregate;

    if (option && option.limit !== undefined) aggregationPipeline.push({ $limit: Number(option.limit) });

    if (option && option.skip !== undefined) aggregationPipeline.push({ $skip: Number(option.skip) });

    return await this.repository.aggregate(aggregationPipeline).exec();
  }

  async distinct(field: string, query?: GenericRecord): Promise<any[]> {
    return await this.repository.distinct(field, query).exec();
  }

  async aggregateAndCount(pipeline: any[] = [], options?: Options): Promise<{ row: T[]; count: number }> {
    const skip = Number(options?.aggregate?.skip || 0);
    const limit = Number(options?.aggregate?.limit || 0);

    const countResult = await this.repository.aggregate([...pipeline, { $count: 'count' }]).exec();
    const count = countResult[0]?.count || 0;

    const dataPipeline = [...pipeline];

    if (skip) dataPipeline.push({ $skip: skip });
    if (limit) dataPipeline.push({ $limit: limit });

    const data = await this.repository.aggregate(dataPipeline).exec();

    return { row: data, count };
  }

  async create(payload: GenericRecord): Promise<T> {
    const parsedPayload = normalizeMongoIds(payload);
    return await this.repository.create(parsedPayload);
  }

  async createMany(payload: GenericRecord[]): Promise<T[]> {
    const parsedPayload = payload.map((item) => normalizeMongoIds(item));
    return await this.repository.insertMany(parsedPayload);
  }

  async updateOne(query: GenericRecord, update: GenericRecord): Promise<T | null> {
    const parsedQuery = normalizeMongoIds(query);
    const parsedUpdate = normalizeMongoIds(update);

    return await this.repository.findOneAndUpdate(parsedQuery, parsedUpdate, { new: true }).exec();
  }

  async updateMany(query: GenericRecord, update: GenericRecord): Promise<UpdateResult> {
    const parsedQuery = normalizeMongoIds(query);
    const parsedUpdate = normalizeMongoIds(update);

    return await this.repository.updateMany(parsedQuery, parsedUpdate).exec();
  }

  async upsert(query: GenericRecord, update: GenericRecord): Promise<void> {
    const parsedQuery = normalizeMongoIds(query);
    const parsedUpdate = normalizeMongoIds(update);

    await this.repository.updateOne(parsedQuery, parsedUpdate, { upsert: true }).exec();
  }

  async updateById(id: string | ObjectId, update: GenericRecord, options?: GenericRecord): Promise<T | any> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;

    const parsedUpdate = normalizeMongoIds(update);

    return await this.repository.findByIdAndUpdate(objectId, parsedUpdate, { new: true, ...options }).exec();
  }

  async deleteOne(query: GenericRecord): Promise<void> {
    await this.repository.deleteOne(query).exec();
  }

  async deleteById(id: string | ObjectId): Promise<void> {
    const objectId = new ObjectId(String(id));
    await this.repository.findByIdAndDelete(objectId).exec();
  }

  async deleteMany(query: GenericRecord): Promise<void> {
    await this.repository.deleteMany(query);
  }

  private queryBuilder(
    query: GenericRecord = {},
    populateOptions?: PopulateOptions[],
    sortOptions?: { [key: string]: number },
    projectionOptions?: { [key: string]: number },
  ): any {
    let queryBuilder: any = this.repository.find(query, projectionOptions);

    if (populateOptions) queryBuilder = queryBuilder.populate(populateOptions);

    const defaultSortField = 'createdAt';
    const defaultSortDirection = -1;
    const finalSortOptions = sortOptions || { [defaultSortField]: defaultSortDirection };

    queryBuilder = queryBuilder.sort(finalSortOptions);

    return queryBuilder;
  }
}
