jest.mock("../src/config/prisma", () => ({
  usuario: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  produto: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  pedido: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  itemPedido: {
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}));

jest.mock("../src/config/supabase", () => ({
  storage: {
    from: jest.fn(),
  },
}));
