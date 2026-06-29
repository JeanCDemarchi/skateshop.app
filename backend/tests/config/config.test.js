const prismaConfigPath = "../../src/config/prisma";
const supabaseConfigPath = "../../src/config/supabase";

const envOriginal = { ...process.env };
const prismaGlobalOriginal = globalThis.prisma;

function restaurarAmbiente() {
  for (const chave of Object.keys(process.env)) {
    if (!(chave in envOriginal)) {
      delete process.env[chave];
    }
  }
  Object.assign(process.env, envOriginal);
}

describe("config/prisma", () => {
  afterEach(() => {
    restaurarAmbiente();
    if (prismaGlobalOriginal === undefined) {
      delete globalThis.prisma;
    } else {
      globalThis.prisma = prismaGlobalOriginal;
    }
    jest.resetModules();
    jest.dontMock("@prisma/client");
  });

  test("instancia, exporta e guarda o PrismaClient fora de produção", () => {
    const clienteFalso = { origem: "PrismaClient falso" };
    const mockPrismaClient = jest.fn(() => clienteFalso);
    delete globalThis.prisma;
    process.env.NODE_ENV = "test";
    jest.resetModules();
    jest.unmock(prismaConfigPath);
    jest.doMock("@prisma/client", () => ({
      PrismaClient: mockPrismaClient,
    }));

    const prisma = require(prismaConfigPath);

    expect(mockPrismaClient).toHaveBeenCalledTimes(1);
    expect(prisma).toBe(clienteFalso);
    expect(globalThis.prisma).toBe(clienteFalso);
  });

  test("reutiliza o singleton global sem instanciar outro cliente", () => {
    const clienteExistente = { origem: "singleton falso" };
    const mockPrismaClient = jest.fn();
    globalThis.prisma = clienteExistente;
    process.env.NODE_ENV = "development";
    jest.resetModules();
    jest.unmock(prismaConfigPath);
    jest.doMock("@prisma/client", () => ({
      PrismaClient: mockPrismaClient,
    }));

    const prisma = require(prismaConfigPath);

    expect(prisma).toBe(clienteExistente);
    expect(mockPrismaClient).not.toHaveBeenCalled();
    expect(globalThis.prisma).toBe(clienteExistente);
  });

  test("em produção instancia e exporta sem registrar singleton global", () => {
    const clienteFalso = { origem: "produção falsa" };
    const mockPrismaClient = jest.fn(() => clienteFalso);
    delete globalThis.prisma;
    process.env.NODE_ENV = "production";
    jest.resetModules();
    jest.unmock(prismaConfigPath);
    jest.doMock("@prisma/client", () => ({
      PrismaClient: mockPrismaClient,
    }));

    const prisma = require(prismaConfigPath);

    expect(mockPrismaClient).toHaveBeenCalledTimes(1);
    expect(prisma).toBe(clienteFalso);
    expect(globalThis.prisma).toBeUndefined();
  });
});

describe("config/supabase", () => {
  afterEach(() => {
    restaurarAmbiente();
    jest.resetModules();
    jest.dontMock("@supabase/supabase-js");
  });

  test("cria e exporta cliente com URL e chave fictícias", () => {
    const clienteFalso = { origem: "Supabase falso" };
    const mockCreateClient = jest.fn(() => clienteFalso);
    process.env.SUPABASE_URL = "https://projeto-ficticio.supabase.co";
    process.env.SUPABASE_SERVICE_KEY = "chave-service-role-ficticia";
    jest.resetModules();
    jest.unmock(supabaseConfigPath);
    jest.doMock("@supabase/supabase-js", () => ({
      createClient: mockCreateClient,
    }));

    const supabase = require(supabaseConfigPath);

    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://projeto-ficticio.supabase.co",
      "chave-service-role-ficticia",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    expect(supabase).toBe(clienteFalso);
  });

  test.each([
    ["URL ausente", undefined, "chave-ficticia"],
    ["chave ausente", "https://projeto-ficticio.supabase.co", undefined],
    ["ambas ausentes", undefined, undefined],
  ])("exporta null e não cria cliente quando %s", (_cenario, url, chave) => {
    const mockCreateClient = jest.fn();
    if (url === undefined) {
      delete process.env.SUPABASE_URL;
    } else {
      process.env.SUPABASE_URL = url;
    }
    if (chave === undefined) {
      delete process.env.SUPABASE_SERVICE_KEY;
    } else {
      process.env.SUPABASE_SERVICE_KEY = chave;
    }
    jest.resetModules();
    jest.unmock(supabaseConfigPath);
    jest.doMock("@supabase/supabase-js", () => ({
      createClient: mockCreateClient,
    }));

    const supabase = require(supabaseConfigPath);

    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(supabase).toBeNull();
  });
});
