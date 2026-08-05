import React, { useState } from 'react';
import { api } from '../services/api';

export default function ModalFechamentoVenda({ carrinho, totalVenda, onVendaConcluida }) {
  const [emitindoNfce, setEmitindoNfce] = useState(false);

  const handleFinalizarEEmitirNfce = async () => {
    try {
      setEmitindoNfce(true);

      // 1. Monta o payload exatamente como o Spring Boot espera (DTO)
      const payload = {
        itens: carrinho.map(item => ({
          codigoProduto: item.codigo || item.id.toString(),
          descricao: item.nome || item.descricao,
          ncm: item.ncm || "34031900", // Exemplo de NCM padrão para óleos/lubrificantes
          quantidade: item.quantidade,
          valorUnitario: item.precoUnitario,
          valorTotal: item.quantidade * item.precoUnitario
        })),
        pagamentos: [
          {
            formaPagamento: "CARTAO", // Ou DINHEIRO, PIX conforme a escolha do operador
            valor: totalVenda
          }
        ],
        valorTotalVenda: totalVenda,
        desconto: 0.00
      };

      // 2. Chama a rota do Spring Boot que criamos
      const response = await api.post('/fiscal/emitir-nfce', payload);

      const resultado = response.data;

      if (resultado.status === 'AUTORIZADO') {
        alert('NFC-e Autorizada com sucesso pela SEFAZ!');
        
        // Se a API retornar a URL do PDF/DANFE, podemos abrir em uma nova aba para impressão
        if (resultado.urlPdf) {
          window.open(resultado.urlPdf, '_blank');
        }

        // Executa ações de pós-venda (limpar carrinho, fechar modal, etc.)
        if (onVendaConcluida) onVendaConcluida();
      } else {
        alert('Atenção: A nota não foi autorizada.');
      }

    } catch (error) {
      console.error('Erro ao emitir NFC-e:', error);
      alert('Erro ao se comunicar com o servidor fiscal.');
    } finally {
      setEmitindoNfce(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Finalizar Venda e Emitir NFC-e</h3>
      <p className="text-sm text-slate-600 mb-4">Total a pagar: R$ {totalVenda.toFixed(2)}</p>
      
      <button
        onClick={handleFinalizarEEmitirNfce}
        disabled={emitindoNfce}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {emitindoNfce ? 'Validando e Emitindo NFC-e...' : 'Confirmar e Emitir NFC-e'}
      </button>
    </div>
  );
}