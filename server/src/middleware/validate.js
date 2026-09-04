const { validationResult } = require('express-validator')

/**
 * Collect express-validator errors and return 422 with standard format.
 * Place after your validation chains: router.post('/path', [...rules], validate, handler)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

module.exports = validate
