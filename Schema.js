const Joi = require('joi')
const review = require('./models/review')

module.exports.reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required()
});