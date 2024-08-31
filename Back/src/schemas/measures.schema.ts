import { z } from "zod";

const measureSchema = z.object({
    id: z.number(),
    image: z.string().refine(value => value.startsWith('data:image/'), {
        message: "Invalid image format. Must be a base64 encoded image string."
    }),
    customer_code: z.string(),
    measure_datetime: z.date(),
    measure_value: z.number(),
    measure_type: z.enum(["WATER", "GAS"]),
    measure_confirmed: z.boolean()
});

const measureSchemaRequest = measureSchema.omit({
    id: true,
    measure_confirmed: true,

})

const measureSchemaResponse = measureSchema

const measureSchemaResponseCreate = z.object({
    image_url: z.string(),
    measure_value: z.string(),
    measure_uuid: z.string(),
});

const measureConfirmedSchema = z.object({
    measure_uuid: z.string(),
    new_value: z.number()

})

export {measureSchema, measureSchemaRequest, measureSchemaResponse, measureSchemaResponseCreate, measureConfirmedSchema};