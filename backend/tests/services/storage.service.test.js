const supabase = require("../../src/config/supabase");
const service = require("../../src/services/storage.service");

const arquivo = (originalname = "imagem ação.png") => ({
  originalname,
  buffer: Buffer.from("imagem"),
  mimetype: "image/png",
});

describe("storage.service", () => {
  let bucket;

  beforeEach(() => {
    bucket = {
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
      remove: jest.fn(),
    };
    supabase.storage.from.mockReturnValue(bucket);
    jest.spyOn(Date, "now").mockReturnValue(1700000000000);
    jest.spyOn(Math, "random").mockReturnValue(0.5);
  });

  test("envia imagens com nome seguro e devolve URLs públicas", async () => {
    bucket.upload.mockResolvedValue({ error: null });
    bucket.getPublicUrl
      .mockReturnValueOnce({ data: { publicUrl: "https://cdn/1.png" } })
      .mockReturnValueOnce({ data: { publicUrl: "https://cdn/2.png" } });

    await expect(
      service.uploadImagens([arquivo(), arquivo("truck.jpg")])
    ).resolves.toEqual(["https://cdn/1.png", "https://cdn/2.png"]);

    expect(supabase.storage.from).toHaveBeenCalledWith("produtos");
    expect(bucket.upload).toHaveBeenNthCalledWith(
      1,
      "1700000000000-500000000-imagem_ac_a_o.png",
      expect.any(Buffer),
      { contentType: "image/png", upsert: false }
    );
    expect(bucket.upload).toHaveBeenNthCalledWith(
      2,
      "1700000000000-500000000-truck.jpg",
      expect.any(Buffer),
      { contentType: "image/png", upsert: false }
    );
  });

  test("usa nome padrão quando originalname está ausente", async () => {
    bucket.upload.mockResolvedValue({ error: null });
    bucket.getPublicUrl.mockReturnValue({ data: { publicUrl: "url" } });
    await service.uploadImagens([
      { buffer: Buffer.from("imagem"), mimetype: "image/png" },
    ]);
    expect(bucket.upload.mock.calls[0][0]).toBe(
      "1700000000000-500000000-imagem"
    );
  });

  test("converte erro do Supabase em AppError 502", async () => {
    bucket.upload.mockResolvedValue({ error: { message: "bucket indisponível" } });
    await expect(service.uploadImagens([arquivo()])).rejects.toMatchObject({
      message: "Falha ao enviar imagem para o Storage: bucket indisponível",
      status: 502,
    });
    expect(bucket.remove).not.toHaveBeenCalled();
  });

  test("limpa uploads anteriores quando um envio posterior falha", async () => {
    bucket.upload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "falhou" } });
    bucket.getPublicUrl.mockReturnValue({ data: { publicUrl: "url-1" } });
    bucket.remove.mockResolvedValue({});

    await expect(
      service.uploadImagens([arquivo("a.png"), arquivo("b.png")])
    ).rejects.toMatchObject({ status: 502 });
    expect(bucket.remove).toHaveBeenCalledWith([
      "1700000000000-500000000-a.png",
    ]);
  });

  test("preserva erro original mesmo se a limpeza compensatória falhar", async () => {
    const error = new Error("rede caiu");
    bucket.upload.mockResolvedValueOnce({ error: null }).mockRejectedValueOnce(error);
    bucket.getPublicUrl.mockReturnValue({ data: { publicUrl: "url-1" } });
    bucket.remove.mockRejectedValue(new Error("limpeza falhou"));
    await expect(
      service.uploadImagens([arquivo("a.png"), arquivo("b.png")])
    ).rejects.toBe(error);
  });

  test.each([undefined, null, []])("removerImagensPorUrl ignora entrada %p", async (urls) => {
    await service.removerImagensPorUrl(urls);
    expect(bucket.remove).not.toHaveBeenCalled();
  });

  test("remove somente paths extraídos de URLs públicas válidas", async () => {
    bucket.remove.mockResolvedValue({});
    await service.removerImagensPorUrl([
      "https://host/storage/v1/object/public/produtos/a.png",
      "url-sem-bucket",
      "https://host/produtos/pasta/b.png",
    ]);
    expect(bucket.remove).toHaveBeenCalledWith(["a.png", "pasta/b.png"]);
  });

  test("não chama Supabase quando nenhuma URL contém o bucket", async () => {
    await service.removerImagensPorUrl(["https://host/outro/a.png", null]);
    expect(bucket.remove).not.toHaveBeenCalled();
  });

  test("propaga erro externo ao remover imagens", async () => {
    const error = new Error("storage fora");
    bucket.remove.mockRejectedValue(error);
    await expect(
      service.removerImagensPorUrl(["https://host/produtos/a.png"])
    ).rejects.toBe(error);
  });
});

describe("storage.service sem Supabase configurado", () => {
  test("rejeita upload com erro de configuração", async () => {
    jest.resetModules();
    jest.doMock("../../src/config/supabase", () => null);
    const semSupabase = require("../../src/services/storage.service");
    await expect(semSupabase.uploadImagens([arquivo()])).rejects.toMatchObject({
      message: expect.stringContaining("Supabase Storage não configurado"),
      status: 500,
    });
  });

  test("remoção vira no-op", async () => {
    jest.resetModules();
    jest.doMock("../../src/config/supabase", () => null);
    const semSupabase = require("../../src/services/storage.service");
    await expect(semSupabase.removerImagensPorUrl(["url"])).resolves.toBeUndefined();
  });
});
