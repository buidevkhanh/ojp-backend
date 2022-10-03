import * as mongoose from 'mongoose';

export class MongooseRepository<TModel> {
  public TSchema: mongoose.Model<TModel>;

  constructor(_TSchema: mongoose.Model<TModel>) {
    this.TSchema = _TSchema;
  }

  async findOneByCondition(condition: any): Promise<any> {
    return this.TSchema.findOne<TModel>(condition);
  }

  async createOne(document: TModel | any) {
    await this.TSchema.create(document);
  }
}
