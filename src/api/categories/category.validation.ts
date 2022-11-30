import * as joi from 'joi';

export const createCategory = joi.object({
  categoryName: joi.string().min(1).required(),
  categoryLogo: joi.string().required().messages({
    'string.empty': 'logo url must not be empty',
  }),
});

export const updateCategory = joi.object({
  categoryId: joi
    .string()
    .regex(/^[0-9a-f]{24}$/i)
    .required()
    .messages({ 'string.base.partern': 'Invalid Id format' }),
  categoryName: joi.string().optional().allow(null),
  categoryLogo: joi.string().optional().allow(null).messages({
    'string.empty': 'logo url must not be empty',
  }),
});
