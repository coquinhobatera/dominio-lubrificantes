import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, DollarSign, Building2 } from 'lucide-react';
import { api } from '../services/api';

export default function PdvTab() {
  const [carrinho, setCarrinho] = useState([]);
  const [nomeProduto, setNomeProduto] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Estados para controlar o modal / aba de Nota Fiscal PJ (Modelo 55)
  const [modoEmissao, setModoEmissao] = useState('NFCE'); // 'NFCE' ou 'NFE'
  const [destinatario, setDestinatario] = useState({
    nome: '',
    documento: '',
    inscricaoEstadual: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  });

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

  // Finalizar e Emitir NFC-e (Modelo 65)
  const handleEmitirNfce = async () => {
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
        pagamentos: [{ formaPagamento: 'CARTAO', valor: totalVenda }],
        valorTotalVenda: totalVenda,
        desconto: 0.00
      };

      const response = await api.post('/fiscal/emitir-nfce', payload);
      const resultado = response.data;

      if (resultado.status === 'AUTORIZADO') {
        alert('NFC-e Autorizada com sucesso!');
        if (resultado.urlPdf) window.open(resultado.urlPdf, '_blank');
        setCarrinho([]);
      }
    } catch (error) {
      console.error('Erro ao emitir NFC-e:', error);
      alert('Erro ao se conectar com o servidor para emissão da NFC-e.');
    } finally {
      setCarregando(false);
    }
  };

  // Finalizar e Emitir NF-e Completa (Modelo 55 - Empresas/Frotas)
  const handleEmitirNfe = async (e) => {
    e.preventDefault();
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um produto ao carrinho.');
      return;
    }

    try {
      setCarregando(true);
      const payload = {
        destinatario,
        itens: carrinho.map(item => ({
          codigoProduto: item.codigo,
          descricao: item.descricao,
          ncm: item.ncm,
          quantidade: item.quantidade,
          valorUnitario: item.precoUnitario,
          valorTotal: item.quantidade * item.precoUnitario
        })),
        pagamentos: [{ formaPagamento: 'PIX/FATURADO', valor: totalVenda }],
        valorTotalVenda: totalVenda,
        desconto: 0.00
      };

      const response = await api.post('/fiscal/emitir-nfe', payload);
      const resultado = response.data;

      if (resultado.status === 'AUTORIZADO') {
        alert('NF-e (Modelo 55) Autorizada com sucesso para a empresa!');
        if (resultado.urlPdf) window.open(resultado.urlPdf, '_blank');
        setCarrinho([]);
        setModoEmissao('NFCE'); // Retorna ao painel padrão
      }
    } catch (error) {
      console.error('Erro ao emitir NF-e:', error);
      alert('Erro ao se conectar com o servidor para emissão da NF-e.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUNA ESQUERDA: LANÇAR ITENS OU DADOS DA EMPRESA */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 lg:col-span-1 space-y-6">
        <div>
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

        {/* SELETOR DE TIPO DE EMISSÃO */}
        <div className="border-t border-slate-200 pt-4">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Tipo de Emissão Fiscal</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModoEmissao('NFCE')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border cursor-pointer ${modoEmissao === 'NFCE' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-300'}`}
            >
              Cupom (NFC-e)
            </button>
            <button
              type="button"
              onClick={() => setModoEmissao('NFE')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border cursor-pointer flex items-center justify-center gap-1 ${modoEmissao === 'NFE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-300'}`}
            >
              <Building2 size={14} /> Nota PJ (Mod. 55)
            </button>
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: CARRINHO E FECHAMENTO */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 lg:col-span-2 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Itens da Venda Atual</h2>
          
          <div className="overflow-x-auto min-h-[150px] max-h-[220px] overflow-y-auto mb-4 border border-slate-100 rounded-lg">
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
                        <button onClick={() => handleRemoverItem(item.id)} className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer">
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

        {/* FORMULÁRIO DE DESTINATÁRIO (EXIBIDO APENAS SE MODO NFE ESTIVER ATIVO) */}
        {modoEmissao === 'NFE' && (
          <form onSubmit={handleEmitirNfe} className="border border-blue-200 bg-blue-50/50 p-4 rounded-xl mb-4 space-y-3">
            <h3 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1">
              <Building2 size={14} /> Dados do Destinatário (NF-e Modelo 55)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" placeholder="Razão Social / Nome da Empresa" required value={destinatario.nome} onChange={(e) => setDestinatario({...destinatario, nome: e.target.value})} className="p-2 border rounded text-xs bg-white" />
              <input type="text" placeholder="CNPJ / CPF (Apenas números)" required value={destinatario.documento} onChange={(e) => setDestinatario({...destinatario, documento: e.target.value})} className="p-2 border rounded text-xs bg-white" />
              <input type="text" placeholder="Inscrição Estadual ou ISENTO" value={destinatario.inscricaoEstadual} onChange={(e) => setDestinatario({...destinatario, inscricaoEstadual: e.target.value})} className="p-2 border rounded text-xs bg-white" />
              <input type="text" placeholder="CEP" required value={destinatario.cep} onChange={(e) => setDestinatario({...destinatario, cep: e.target.value})} className="p-2 border rounded text-xs bg-white" />
              <input type="text" placeholder="Logradouro (Rua, Av...)" required value={destinatario.logradouro} onChange={(e) => setDestinatario({...destinatario, logradouro: e.target.value})} className="p-2 border rounded text-xs bg-white" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Número" required value={destinatario.numero} onChange={(e) => setDestinatario({...destinatario, numero: e.target.value})} className="p-2 border rounded text-xs bg-white" />
                <input type="text" placeholder="UF (Ex: RJ)" required maxLength="2" value={destinatario.uf} onChange={(e) => setDestinatario({...destinatario, uf: e.target.value})} className="p-2 border rounded text-xs bg-white" />
              </div>
              <input type="text" placeholder="Bairro" required value={destinatario.bairro} onChange={(e) => setDestinatario({...destinatario, bairro: e.target.value})} className="p-2 border rounded text-xs bg-white" />
              <input type="text" placeholder="Cidade" required value={destinatario.cidade} onChange={(e) => setDestinatario({...destinatario, cidade: e.target.value})} className="p-2 border rounded text-xs bg-white" />
            </div>

            <button
              type="submit"
              disabled={carregando || carrinho.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <DollarSign size={18} />
              {carregando ? 'Transmitindo NF-e...' : 'Transmitir NF-e (Modelo 55)'}
            </button>
          </form>
        )}

        {/* RODAPÉ DO CAIXA E BOTÃO DE NFC-E PADRÃO */}
        <div className="border-t border-slate-200 pt-4 mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-600">TOTAL DA VENDA:</span>
            <span className="text-3xl font-extrabold text-slate-900">R$ {totalVenda.toFixed(2)}</span>
          </div>

          {modoEmissao === 'NFCE' && (
            <button
              onClick={handleEmitirNfce}
              disabled={carregando || carrinho.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              <DollarSign size={20} />
              {carregando ? 'Transmitindo para SEFAZ...' : 'Finalizar Venda & Emitir NFC-e'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}