import * as ImagePicker from 'expo-image-picker';
import helper, { assetParaArquivo, selecionarImagens } from './imagePicker';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'images-ficticias' },
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

describe('selecionarImagens', () => {
  test('retorna erro quando a permissão é negada', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });

    await expect(selecionarImagens()).resolves.toEqual({
      erro: 'Permissão de acesso às fotos negada.',
    });
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  test('abre a galeria com seleção múltipla e qualidade configurada', async () => {
    const assets = [{ uri: 'file:///imagem.png' }];
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets });

    await expect(selecionarImagens()).resolves.toEqual({ assets });
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: 'images-ficticias',
      allowsMultipleSelection: true,
      quality: 0.7,
    });
  });

  test('retorna lista vazia quando a seleção é cancelada', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });
    await expect(selecionarImagens()).resolves.toEqual({ assets: [] });
  });

  test('normaliza assets ausentes como lista vazia', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: false });
    await expect(selecionarImagens()).resolves.toEqual({ assets: [] });
  });
});

describe('assetParaArquivo', () => {
  test('preserva nome e MIME type fornecidos pelo picker', () => {
    expect(
      assetParaArquivo({
        uri: 'file:///shape.png',
        fileName: 'shape.png',
        mimeType: 'image/png',
      })
    ).toEqual({
      uri: 'file:///shape.png',
      name: 'shape.png',
      type: 'image/png',
    });
  });

  test('gera nome e tipo padrão', () => {
    jest.spyOn(Date, 'now').mockReturnValue(123456);
    expect(assetParaArquivo({ uri: 'file:///foto' }, 3)).toEqual({
      uri: 'file:///foto',
      name: 'foto_123456_3.jpg',
      type: 'image/jpeg',
    });
  });

  test('export default reúne os helpers', () => {
    expect(helper).toEqual({ selecionarImagens, assetParaArquivo });
  });
});
