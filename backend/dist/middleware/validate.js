"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => async (req, res, next) => {
    try {
        const parsed = await schema.parseAsync(req.body);
        req.body = parsed;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const firstIssue = error.errors[0]?.message || "Invalid input data";
            res.status(400).json({
                success: false,
                error: firstIssue,
            });
            return;
        }
        next(error);
    }
};
exports.validate = validate;
