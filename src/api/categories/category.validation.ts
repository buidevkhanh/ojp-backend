import * as joi from 'joi';

export const createCategory = joi.object({
  categoryName: joi.string().min(1).required(),
  categoryLogo: joi.string().min(20).max(20).required().messages({
    'string.min': 'logoId contains 20 charactors',
    'string.max': 'logoId contains 20 charactors',
    'string.empty': 'logoId must not be empty',
  }),
});

export const updateCategory = joi.object({
  categoryId: joi
    .string()
    .regex(/^[0-9a-f]{24}$/i)
    .required()
    .messages({ 'string.base.partern': 'Invalid Id format' }),
  categoryName: joi.string().min(1),
  categoryLogo: joi.string().min(20).max(20).messages({
    'string.min': 'logoId contains 20 charactors',
    'string.max': 'logoId contains 20 charactors',
    'string.empty': 'logoId must not be empty',
  }),
});
