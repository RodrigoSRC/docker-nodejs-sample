export class AppError extends Error {
    statusCode: number;
    errorCode: string;
    errorDescription: string;

    constructor(errorCode: string, errorDescription: string, statusCode: number = 400) {
        super(errorDescription); // Define a mensagem de erro usando o construtor da classe `Error`
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.statusCode = statusCode;
    }
}