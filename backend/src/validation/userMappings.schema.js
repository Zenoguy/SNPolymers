const { z } = require('zod');

const createUserMappingSchema = {
  body: z.object({
    je_mobile_number: z.string({ required_error: 'je_mobile_number is required.' })
      .trim()
      .min(1, 'je_mobile_number is required.'),
    zo_mobile_number: z.string({ required_error: 'zo_mobile_number is required.' })
      .trim()
      .min(1, 'zo_mobile_number is required.')
  })
};

module.exports = {
  createUserMappingSchema
};
