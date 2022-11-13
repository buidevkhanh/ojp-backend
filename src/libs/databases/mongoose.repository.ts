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

  async createWithReturn(document: TModel | any) {
    return this.TSchema.create(document);
  }

  async getAllWithPaginate(params) {
    const paginate = params.paginate;
    let sortJson = '';
    if (paginate.sort) {
      sortJson = paginate.sort.split(',').join(`,"`);
      sortJson = (sortJson || '').split(':').join(`":`);
      sortJson = JSON.parse(`{"${sortJson}}`);
    }
    const list = await this.TSchema.find(params.conditions)
      .populate(params.populate)
      .select(params.projections || {})
      .sort(sortJson || {});
    return {
      data:
        paginate.pageSize == -1
          ? list
          : list.slice(
              ((paginate.page || 1) - 1) * (paginate.pageSize || 15),
              paginate.page * (paginate.pageSize || 15),
            ),
      page: +paginate.page || 1,
      pageSize: +paginate.pageSize || 15,
      totalItem: list.length,
      totalPage:
        paginate.pageSize == -1
          ? 1
          : Math.ceil(list.length / (paginate.pageSize || 15)),
    };
  }
}
