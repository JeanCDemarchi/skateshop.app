// Erro de aplicação com status HTTP. O middleware central (errorHandler)
// usa a propriedade `status` para responder com o código correto.
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

module.exports = AppError;
