import { AppError } from "../../libs/errors/app.error";
import { ContestRepository } from "./contest.repository"

async function createContest(contest) {
    const name = contest.name;
    const existContest = await ContestRepository.findOneByCondition({name: {$regex: name, $options: 'i'}});
    if(existContest) {
        throw new AppError('Contest name already exist', 400);
    }
    await ContestRepository.createWithReturn(contest);
}

async function adminList({page, pageSize}) {
    const params = {
        paginate: {
            page: page || 1, 
            pageSize: pageSize || 20,
            sort: 'beginAt:-1'
        },
        populate: [
            {path: 'questions.problem', select: '_id problemName'}
        ]
    }
    return ContestRepository.getAllWithPaginate(params);
}

export default {
    createContest,
    adminList
}