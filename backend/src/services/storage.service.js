// Service responsável por enviar imagens ao Supabase Storage (bucket público
// "produtos") e devolver as URLs públicas.
const supabase = require("../config/supabase");
const AppError = require("../utils/AppError");

const BUCKET = "produtos";

// Gera um nome de arquivo único e seguro: timestamp + aleatório + nome original.
function gerarNomeArquivo(originalname) {
  const nomeSeguro = (originalname || "imagem")
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const aleatorio = Math.round(Math.random() * 1e9);
  return `${Date.now()}-${aleatorio}-${nomeSeguro}`;
}

// Envia uma lista de arquivos (multer) ao Storage. Se algum upload falhar,
// remove os que já foram enviados (best-effort) e lança erro — evitando
// arquivos órfãos e a criação de um produto sem imagens consistentes.
async function uploadImagens(files) {
  if (!supabase) {
    throw new AppError(
      "Supabase Storage não configurado. Verifique SUPABASE_URL e SUPABASE_SERVICE_KEY no .env",
      500
    );
  }

  const enviados = []; // { path, url }

  try {
    for (const file of files) {
      const path = gerarNomeArquivo(file.originalname);

      const { error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

      if (error) {
        throw new AppError(`Falha ao enviar imagem para o Storage: ${error.message}`, 502);
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      enviados.push({ path, url: data.publicUrl });
    }

    return enviados.map((item) => item.url);
  } catch (err) {
    // Limpeza dos arquivos já enviados antes da falha.
    if (enviados.length > 0) {
      await supabase.storage
        .from(BUCKET)
        .remove(enviados.map((item) => item.path))
        .catch(() => {});
    }
    throw err;
  }
}

// Extrai o caminho do arquivo dentro do bucket a partir da URL pública.
// Ex.: ".../storage/v1/object/public/produtos/123-abc.png" -> "123-abc.png"
function extrairPath(url) {
  const marcador = `/${BUCKET}/`;
  const idx = (url || "").indexOf(marcador);
  if (idx === -1) return null;
  return url.substring(idx + marcador.length);
}

// Remove do Storage as imagens correspondentes às URLs informadas.
// Best-effort: não lança erro (usado em limpeza pós-exclusão).
async function removerImagensPorUrl(urls) {
  if (!supabase || !urls || urls.length === 0) return;

  const paths = urls.map(extrairPath).filter(Boolean);
  if (paths.length === 0) return;

  await supabase.storage.from(BUCKET).remove(paths);
}

module.exports = { uploadImagens, removerImagensPorUrl };
