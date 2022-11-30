import { MongooseRepository } from "../../../libs/databases/mongoose.repository";
import ContestHistoryModel from "./contest-history.collection";

class ContestHistoryORM extends MongooseRepository<typeof ContestHistoryModel> {
    constructor(){
        super(ContestHistoryModel);
    }
}

export const ContestHistoryRepository = new ContestHistoryORM();