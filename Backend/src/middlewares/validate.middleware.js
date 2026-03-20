export const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);

    req.validatedData = validatedData; // attach clean data
    next();
  } catch (error) {
    const formattedErrors = {};

    error.issues.forEach((err) => {
      const field = err.path[0];
      formattedErrors[field] = err.message;
    });

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        fields: formattedErrors,
      },
    });
  }
};
