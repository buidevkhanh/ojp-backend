import { MongooseRepository } from "../../libs/databases/mongoose.repository";
import ContestModel from "./contest.collection";

class ContestORM extends MongooseRepository<typeof ContestModel> {
    constructor(){
        super(ContestModel);
    }
}

export const ContestRepository = new ContestORM();