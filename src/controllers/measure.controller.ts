import { Request, Response } from "express";
import { MeasuresService } from "../services/measures.service";


class MeasuresController {
    constructor(private measuresService: MeasuresService) { }

    async create(req: Request, res: Response) {
        console.log("seila")
        const newMeasure = await this.measuresService.create(req.body)

        return res.status(200).json(newMeasure)
    }

    async confirm(req: Request, res: Response): Promise<Response> {
 
            const { measure_uuid, new_value } = req.body;

            const measuresService = new MeasuresService();

            await measuresService.confirmMeasure(measure_uuid, new_value);

            return res.status(200).json({ message: "Valor confirmado com sucesso." });

    }

    async list(req: Request, res: Response): Promise<Response> {

            const { customer_code } = req.params;
            const { measure_type } = req.query;

            const measuresService = new MeasuresService();
            const measures = await measuresService.list(customer_code, measure_type as string);

            return res.status(200).json(measures);
    }


}

export { MeasuresController }