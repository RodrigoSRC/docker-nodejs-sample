import { AppDataSource } from "../data-source";
import { Measure, MeasureType } from "../entities/measures.entity";
import { TMeasureRequest, TMeasureResponseCreate } from "../interfaces/measures.interface";
import { AppError } from "../errors/App.Error";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Between } from "typeorm";

const client = new GoogleAIFileManager(
    process.env.GEMINI_API_KEY!
);
const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});


export class MeasuresService {

    async create(data: TMeasureRequest): Promise<TMeasureResponseCreate> {
        console.log("seila")
        const {image, customer_code, measure_datetime, measure_type} = data

        const geminiResponse = await this.sendImageToGemini(image);
        
        const measureRepository = AppDataSource.getRepository(Measure)

        const startOfMonth = new Date(measure_datetime.getFullYear(), measure_datetime.getMonth(), 1);
        const endOfMonth = new Date(measure_datetime.getFullYear(), measure_datetime.getMonth() + 1, 0);


        const findMeasure = await measureRepository.findOne({
            where: {
                measure_datetime: Between(startOfMonth, endOfMonth),
                measure_type: MeasureType[measure_type as keyof typeof MeasureType],
            }
        });

        if (findMeasure) {
            throw new AppError("DOUBLE_REPORT", "Leitura do mês já realizada.", 409);
        }

        const measureData = {
            ...data,
            image_url: geminiResponse.image_url, // Adiciona o image_url gerado pelo Gemini
            measure_type: MeasureType[measure_type as keyof typeof MeasureType], // Converte measure_type para MeasureType
        };

        const measure: Measure = measureRepository.create(measureData);
    
        await measureRepository.save(measure)

        return geminiResponse
        
    }

    private async sendImageToGemini(base64Image: string) {
        try {
            const uploadResponse = await client.uploadFile(base64Image, {
                mimeType: "image/jpeg",
                displayName: "Conta",
            });

            const generationResponse = await model.generateContent([{
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri,
                }
            },
            {text: "Preciso que retorne um objeto com 3 campos preenchidos: image_url (link temporário para a imagem), measure_value (o valor de consumo da conta de água ou gás) e measure_uuid (um UUID da conta)."}
        
        ]);

            const result = generationResponse.response.text();
            const parsedResult = JSON.parse(result); 

            return {
                image_url: parsedResult.image_url,
                measure_value: parsedResult.measure_value,
                measure_uuid: parsedResult.measure_uuid,
            };

        } catch (error) {
            throw new AppError("INVALID_DATA","Falha ao processar a imagem com o Gemini.", 400);
        }
    }


    async confirmMeasure(id: string, newValue: number): Promise<object> {
        const measureRepository = AppDataSource.getRepository(Measure);

        const measure = await measureRepository.findOne({ where: { id } });

        // OBS: No documento modelo estava a mesma descrição do erro 409 e interpretei que houve um erro ao documentar. Por isso a mensagem diferente do erro 404. Se errei, desculpe mesmo!
        if (!measure) {
            throw new AppError("MEASURE_NOT_FOUND", "Leitura do mês não encontrada.", 404);
        }

        if (measure.measure_confirmed) {
            throw new AppError("CONFIRMATION_DUPLICATE", "Leitura do mês já realizada.", 409);
        }

        measure.measure_value = newValue;
        measure.measure_confirmed = true;

        await measureRepository.save(measure);

        return { success: true };
    }

    async list(customer_code: string, measure_type?: string): Promise<object> {
        const measureRepository = AppDataSource.getRepository(Measure);

        // Constrói a consulta com os filtros necessários
        const queryBuilder = measureRepository.createQueryBuilder("measure")
            .where("measure.customer_code = :customer_code", { customer_code });

        // Se o tipo de medida for informado, aplica o filtro, case insensitive
        if (measure_type) {
            const measureTypeEnum = MeasureType[measure_type.toUpperCase() as keyof typeof MeasureType];
            if (!measureTypeEnum) {
                throw new AppError("INVALID_MEASURE_TYPE", "Tipo de medida inválido.", 400);
            }
            queryBuilder.andWhere("measure.measure_type = :measure_type", { measure_type: measureTypeEnum });
        }

        const measures = await queryBuilder.getMany();

        if (measures.length === 0) {
            throw new AppError("MEASURE_NOT_FOUND", "Nenhuma medida encontrada para o cliente.", 404);
        }

        const response = {
            customer_code,
            measures: measures.map(measure => ({
                measure_uuid: measure.id,
                measure_datetime: measure.measure_datetime,
                measure_type: measure.measure_type,
                has_confirmed: measure.measure_confirmed,
                image_url: measure.image_url
            }))
        };

        return response;
    }
 
}