export default function errorMiddleware(error, req, res, next) {
  console.error(error);
  const status = error.statusCode || 500;
  const message = status === 500 ? "Server error" : error.message;

  res.status(status).json({ success: false, message });
}
