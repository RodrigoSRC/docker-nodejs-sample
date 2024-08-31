import { NextFunction, Request, Response } from "express";
import { ZodTypeAny, ZodError } from "zod";

const ensureDataIsValidMiddleware = (schema: ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log("seila")
        try {
            const validatedBody = schema.parse(req.body);
            req.body = validatedBody;
            next();
        } catch (error) {
            if (error instanceof ZodError) {

                return res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "Os dados fornecidos no corpo da requisição são inválidos",
                });
            }
        }
    };
};

export { ensureDataIsValidMiddleware };
