import { Router } from "express";
import { measuresController } from "../controllers";
import { ensureDataIsValidMiddleware } from "../middlewares/ensureDataIsValid.middleware";
import { measureConfirmedSchema, measureSchemaRequest } from "../schemas/measures.schema";


const measuresRoutes = Router()

measuresRoutes.post("/upload", ensureDataIsValidMiddleware(measureSchemaRequest), (req, res) => measuresController.create(req, res))

measuresRoutes.patch("/confirm", ensureDataIsValidMiddleware(measureConfirmedSchema), (req, res) => measuresController.confirm(req, res))

measuresRoutes.get("/:customer_code/list", (req, res) => measuresController.list(req, res))



export {measuresRoutes}