export class AppError extends Error {
    constructor(statusCode = 500, message = "Internal Server Error", details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}


export function notFoundHandler(req, res, next) {
    next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
}


export function errorHandler(err, req, res, next) {
    // Zod error
    if (err?.name === "ZodError") {
        return res.status(400).json({
            error: "Validation Error",
            issues: err.issues,
        });
    }


    const status = err.statusCode || 500;
    const payload = {
        error: err.message || "Internal Server Error",
    };
    if (err.details) payload.details = err.details;

    if (process.env.NODE_ENV !== "production" && err.stack) {
        payload.stack = err.stack;
    }
        res.status(status).json(payload);
}