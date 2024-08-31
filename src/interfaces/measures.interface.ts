import { z } from "zod"
import { measureSchema, measureSchemaRequest, measureSchemaResponseCreate } from "../schemas/measures.schema"

type TMeasureRequest = z.infer<typeof measureSchemaRequest>
type TMeasure = z.infer<typeof measureSchema>
type TMeasureResponse = z.infer<typeof measureSchema>
type TMeasureResponseCreate = z.infer<typeof measureSchemaResponseCreate>

export { TMeasureRequest, TMeasure, TMeasureResponse, TMeasureResponseCreate }