// Helper para selecionar imagens da galeria do dispositivo (expo-image-picker).
import * as ImagePicker from 'expo-image-picker';

// Retorna { assets: [...] } com as imagens escolhidas, ou { erro } / { assets: [] }.
export async function selecionarImagens() {
  const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissao.granted) {
    return { erro: 'Permissão de acesso às fotos negada.' };
  }

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.7,
  });

  if (resultado.canceled) {
    return { assets: [] };
  }
  return { assets: resultado.assets || [] };
}

// Converte um asset do picker no formato que o FormData espera (RN).
export function assetParaArquivo(asset, indice = 0) {
  const uri = asset.uri;
  const nome = asset.fileName || `foto_${Date.now()}_${indice}.jpg`;
  const tipo = asset.mimeType || 'image/jpeg';
  return { uri, name: nome, type: tipo };
}

export default { selecionarImagens, assetParaArquivo };
