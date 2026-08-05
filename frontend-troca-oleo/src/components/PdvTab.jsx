import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, DollarSign } from 'lucide-react';
import { api } from '../services/api';

export default function PdvTab() {
  const [carrinho, setCarrinho] = useState([]);
  const [nomeProduto, setNomeProduto] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Adicionar item ao carrinho local
  const handleAdicionarItem = (e) => {
    e.preventDefault();
    if (!nomeProduto || !precoUnitario) return;

    const novoItem = {
      id: Date.now(),
      codigo: 'PROD-' + Math.floor(Math.random() * 1000),
      descricao: nomeProduto,
      ncm: '34031900', // NCM padrão para lubrificantes
      quantidade: Number(quantidade),
      precoUnitario: Number(precoUnitario)
    };

    setCarrinho([...carrinho, novoItem]);
    setNomeProduto('');
    setQuantidade(1);
    setPrecoUnitario('');
  };

  const handleRemoverItem = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const totalVenda = carrinho.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);

  // Finalizar e Emitir NFC-e (integrado com o Spring Boot)
  const handleFinalizarEEmitirNfce = async () => {
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um produto ao carrinho.');
      return;
    }

    try {
      setCarregando(true);

      const payload = {
        itens: carrinho.map(item => ({
          codigoProduto: item.codigo,
          descricao: item.descricao,
          ncm: item.ncm,
          quantidade: item.quantidade,
          valorUnitario: item.precoUnitario,
          valorTotal: item.quantidade * item.precoUnitario
        })),
        pagamentos: [
          { formaPagamento: 'CARTAO', valor: totalVenda }
        ],
        valorTotalVenda: totalVenda,
        desconto: 0.00
      };

      const response = await api.post('/fiscal/emitir-nfce', payload);
      const resultado = response.data;

      if (resultado.status === 'AUTORIZADO') {
        alert('NFC-e Autorizada com sucesso pela SEFAZ!');
        if (resultado.urlPdf) {
          window.open(resultado.urlPdf, '_blank');
        }
        setCarrinho([]); // Limpa a venda após autorizar
      } else {
        alert('Atenção: A nota não foi autorizada.');
      }

    } catch (error) {
      console.error('Erro ao emitir NFC-e:', error);
      alert('Erro ao se conectar com o servidor para emissão da nota.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FORMULÁRIO DE LANÇAMENTO DE ITENS */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 lg:col-span-1">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <ShoppingCart className="text-yellow-600" size={20} /> Lançar Item no Caixa
        </h2>

        <form onSubmit={handleAdicionarItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Produto</label>
            <input
              type="text"
              required
              placeholder="Ex: Óleo Shell Helix 5W30"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Qtd</label>
              <input
                type="number"
                required
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Preço Un. (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="49.00"
                value={precoUnitario}
                onChange={(e) => setPrecoUnitario(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow cursor-pointer"
          >
            <Plus size={18} /> Adicionar à Venda
          </button>
        </form>
      </div>

      {/* CARRINHO E TOTALIZADOR / FECHAMENTO */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 lg:col-span-2 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Itens da Venda Atual</h2>
          
          <div className="overflow-x-auto min-h-[150px] max-h-[250px] overflow-y-auto mb-4 border border-slate-100 rounded-lg">
            {carrinho.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhum item adicionado à venda ainda.</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 uppercase text-xs text-slate-700">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qtd</th>
                    <th className="p-2.5 text-right">Unitário</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                    <th className="p-2.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {carrinho.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-800">{item.descricao}</td>
                      <td className="p-2.5 text-center font-bold">{item.quantidade}</td>
                      <td className="p-2.5 text-right">R$ {item.precoUnitario.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</td>
                      <td className="p-2.5 text-center">
                        <button 
                          onClick={() => handleRemoverItem(item.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RODAPÉ DO CAIXA E BOTÃO FISCAL */}
        <div className="border-t border-slate-200 pt-4 mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-600">TOTAL DA VENDA:</span>
            <span className="text-3xl font-extrabold text-slate-900">R$ {totalVenda.toFixed(2)}</span>
          </div>

          <button
            onClick={handleFinalizarEEmitirNfce}
            disabled={carregando || carrinho.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            <DollarSign size={20} />
            {carregando ? 'Transmitindo para SEFAZ...' : 'Finalizar Venda & Emitir NFC-e'}
          </button>
        </div>
      </div>
    </div>
  );
}