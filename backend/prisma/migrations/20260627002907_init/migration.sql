-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "produto" (
    "id_produto" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco_atual" DOUBLE PRECISION NOT NULL,
    "estoque_atual" INTEGER NOT NULL,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "fk_id_criador" INTEGER,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id_produto")
);

-- CreateTable
CREATE TABLE "produto_imagem" (
    "id_imagem" SERIAL NOT NULL,
    "fk_id_produto" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "produto_imagem_pkey" PRIMARY KEY ("id_imagem")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id_pedido" SERIAL NOT NULL,
    "data_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "valor_total" DOUBLE PRECISION NOT NULL,
    "fk_id_usuario" INTEGER NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "item_pedido" (
    "id_item_pedido" SERIAL NOT NULL,
    "fk_id_pedido" INTEGER NOT NULL,
    "fk_id_produto" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario_venda" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "item_pedido_pkey" PRIMARY KEY ("id_item_pedido")
);

-- CreateTable
CREATE TABLE "envio" (
    "id_envio" SERIAL NOT NULL,
    "fk_id_pedido" INTEGER NOT NULL,
    "codigo_rastreio" TEXT,
    "transportadora" TEXT,
    "data_postagem" TIMESTAMP(3),
    "status_entrega" TEXT,

    CONSTRAINT "envio_pkey" PRIMARY KEY ("id_envio")
);

-- CreateTable
CREATE TABLE "pagamento" (
    "id_pagamento" SERIAL NOT NULL,
    "fk_id_pedido" INTEGER NOT NULL,
    "metodo_pagamento" TEXT NOT NULL,
    "status_transacao" TEXT NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "id_transacao_gateway" TEXT,

    CONSTRAINT "pagamento_pkey" PRIMARY KEY ("id_pagamento")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_username_key" ON "usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "envio_fk_id_pedido_key" ON "envio"("fk_id_pedido");

-- CreateIndex
CREATE UNIQUE INDEX "pagamento_fk_id_pedido_key" ON "pagamento"("fk_id_pedido");

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_fk_id_criador_fkey" FOREIGN KEY ("fk_id_criador") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_imagem" ADD CONSTRAINT "produto_imagem_fk_id_produto_fkey" FOREIGN KEY ("fk_id_produto") REFERENCES "produto"("id_produto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_fk_id_usuario_fkey" FOREIGN KEY ("fk_id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pedido" ADD CONSTRAINT "item_pedido_fk_id_pedido_fkey" FOREIGN KEY ("fk_id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pedido" ADD CONSTRAINT "item_pedido_fk_id_produto_fkey" FOREIGN KEY ("fk_id_produto") REFERENCES "produto"("id_produto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_fk_id_pedido_fkey" FOREIGN KEY ("fk_id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_fk_id_pedido_fkey" FOREIGN KEY ("fk_id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;
