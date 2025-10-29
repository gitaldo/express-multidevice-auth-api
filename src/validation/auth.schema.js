import { z } from "zod";


export const registerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
});


export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});


// helper middleware for validasidation
export function validate(schema) {
    return (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (err) {
        next(err);
    }
    };
}