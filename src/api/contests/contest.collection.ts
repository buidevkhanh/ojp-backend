import * as mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';

const ContestQuestion = new mongoose.Schema({
  problem: { type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.PROBLEMS},
  score: { type: Number, required: true}
}, { _id: false});

const ContestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    visibility: { type: String, enum: ["public", "private"], default: 'public'},
    beginAt: { type: Date, require: true},
    duration: { type: Number, require: true},
    user: { type: [mongoose.Types.ObjectId], ref: AppObject.MONGO.COLLECTION.USERS},
    questions: [ContestQuestion],
    limitedMember: { type: Number, required: false}
  },
  {
    timestamps: true,
  },
);

const ContestModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.CONTESTS,
  ContestSchema,
);

export default ContestModel;
