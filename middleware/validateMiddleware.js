export default function validateMiddleware(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0]?.message || "Invalid request body",
      });
    }

    req.body = result.data;
    return next();
  };
}
