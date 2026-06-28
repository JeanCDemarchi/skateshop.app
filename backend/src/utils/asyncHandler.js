// Envolve um handler async para que erros lançados sejam encaminhados
// automaticamente ao middleware central de tratamento de erros (next).
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
