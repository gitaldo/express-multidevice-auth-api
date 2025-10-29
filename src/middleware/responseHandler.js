// middleware/responseHandler.js
export const responseHandler = (req, res, next) => {
  res.success = (message, data = null, code = 200) => {
    res.status(code).json({
      status: "success",
      message,
      data,
    });
  };

  res.error = (message, code = 400, details = null) => {
    res.status(code).json({
      status: "error",
      message,
      code,
      ...(details && { details }),
    });
  };

  next();
};
