import { MeasuresController } from "./measure.controller";
import { MeasuresService } from "../services/measures.service";

const measuresService = new MeasuresService
const measuresController = new MeasuresController(measuresService)

export { measuresController }