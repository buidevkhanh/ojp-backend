import * as joi from 'joi';
import { AppObject } from '../../commons/app.object';

export const createProblem = joi.object({
  problemName: joi.string().min(1).required(),
  problemLevel: joi
    .string()
    .required()
    .valid(AppObject.PROBLEM_LEVEL.EASY, AppObject.PROBLEM_LEVEL.MEDIUM),
  problemCategory: joi
    .string()
    .regex(/^[0-9a-f]{24}$/i)
    .required()
    .messages({ 'string.base.partern': 'Invalid Id format' }),
  problemQuestion: joi.string().required(),
  expectedInput: joi.string().optional().allow(''),
  expectedOutput: joi.string().optional().allow(''),
  problemScope: joi
    .string()
    .valid(AppObject.APP_SCOPES.CLASS, AppObject.APP_SCOPES.PUBLIC),
  problemCases: joi
    .array()
    .items(
      joi.object({
        input: joi.string().optional().allow(''),
        output: joi.string().optional().allow(''),
      }),
    )
    .required(),
});
