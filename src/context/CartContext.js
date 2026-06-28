// Carrinho mantido no frontend (em memória, durante a sessão).
// O backend só é chamado no checkout para criar o pedido.
import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Cada item: { produto, quantidade }
  const [itens, setItens] = useState([]);

  function adicionarAoCarrinho(produto, quantidade = 1) {
    setItens((atual) => {
      const existente = atual.find((i) => i.produto.id === produto.id);
      if (existente) {
        // Já está no carrinho: incrementa a quantidade.
        return atual.map((i) =>
          i.produto.id === produto.id
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        );
      }
      return [...atual, { produto, quantidade }];
    });
  }

  function removerDoCarrinho(produtoId) {
    setItens((atual) => atual.filter((i) => i.produto.id !== produtoId));
  }

  function alterarQuantidade(produtoId, quantidade) {
    setItens((atual) => {
      if (quantidade <= 0) {
        return atual.filter((i) => i.produto.id !== produtoId);
      }
      return atual.map((i) =>
        i.produto.id === produtoId ? { ...i, quantidade } : i
      );
    });
  }

  function limparCarrinho() {
    setItens([]);
  }

  const totalItens = useMemo(
    () => itens.reduce((soma, i) => soma + i.quantidade, 0),
    [itens]
  );

  const valorTotal = useMemo(
    () => itens.reduce((soma, i) => soma + i.produto.precoAtual * i.quantidade, 0),
    [itens]
  );

  return (
    <CartContext.Provider
      value={{
        itens,
        adicionarAoCarrinho,
        removerDoCarrinho,
        alterarQuantidade,
        limparCarrinho,
        totalItens,
        valorTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart deve ser usado dentro de <CartProvider>');
  }
  return ctx;
}

export default CartContext;
