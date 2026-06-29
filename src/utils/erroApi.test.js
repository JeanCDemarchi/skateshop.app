import extrairMensagemErro, { extrairMensagemErro as nomeada } from './erroApi';

describe('extrairMensagemErro', () => {
  test('exporta a mesma função como default e nomeada', () => {
    expect(extrairMensagemErro).toBe(nomeada);
  });

  test('junta mensagens de validação do backend', () => {
    const erro = {
      response: {
        data: {
          issues: [{ mensagem: 'Nome obrigatório' }, { mensagem: 'CEP inválido' }],
          error: 'erro genérico',
        },
      },
    };
    expect(extrairMensagemErro(erro)).toBe('Nome obrigatório\nCEP inválido');
  });

  test('usa a mensagem error do backend', () => {
    expect(
      extrairMensagemErro({ response: { data: { error: 'Não autorizado' } } })
    ).toBe('Não autorizado');
  });

  test('traduz erro de rede', () => {
    expect(extrairMensagemErro({ message: 'Network Error' })).toBe(
      'Não foi possível conectar ao servidor. Verifique sua conexão.'
    );
  });

  test('usa fallback informado', () => {
    expect(extrairMensagemErro(new Error('falha'), 'Tente depois')).toBe('Tente depois');
  });

  test('usa fallback padrão para entrada ausente', () => {
    expect(extrairMensagemErro()).toBe('Algo deu errado. Tente novamente.');
  });
});
