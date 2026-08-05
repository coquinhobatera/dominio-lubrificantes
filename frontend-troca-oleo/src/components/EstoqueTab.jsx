import React, { useState, useEffect } from 'react';
import { PlusCircle, Layers, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { api } from '../services/api';

export default function EstoqueTab() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregandoMovimentacoes, setCarregandoMovimentacoes] = useState(false);
  const [formProduto, setFormProduto] = useState({
    nome: '',
    categoria: 'OLEO',
    quantidade: '',
    precoUnitario: '',
    observacao: 'Cadastro inicial / Entrada manual'
  });
  const [salvandoProduto, setSalvandoProduto] = useState(false);

  const carregarMovimentacoes = async () => {
    try {
      setCarregandoMovimentacoes(true);
      // Carrega do armazenamento local primeiro para garantir agilidade
      const salvoLocal = localStorage.getItem('dominio_movimentacoes');
      if (salvoLocal) {
        setMovimentacoes(JSON.parse(salvoLocal));
      }

      const res = await api.get('/movimentacoes').catch(() => null);
      if (res && res.data && res.data.length > 0) {
        setMovimentacoes(res.data);
        localStorage.setItem('dominio_movimentacoes', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Erro ao carregar movimentações.', e);
    } finally {
      setCarregandoMovimentacoes(false);
    }
  };

  useEffect(() => {
    carregarMovimentacoes();
  }, []);

  const handleCadastrarProduto = async (e) => {
    e.preventDefault();
    try {
      setSalvandoProduto(true);
      const novaMovimentacao = {
        id: Date.now(),
        tipo: 'ENTRADA',
        nomeProduto: formProduto.nome,
        categoria: formProduto.categoria,
        quantidade: parseInt(formProduto.quantidade, 10),
        precoUnitario: parseFloat(formProduto.precoUnitario),
        dataMovimentacao: new Date().toISOString(),
        observacao: formProduto.observacao
      };

      // Atualiza imediatamente na tela e no armazenamento local
      const listaAtualizada = [novaMovimentacao, ...movimentacoes];
      setMovimentacoes(listaAtualizada);
      localStorage.setItem('dominio_movimentacoes', JSON.stringify(listaAtualizada));

      alert('Produto cadastrado com sucesso!');
      setFormProduto({
        nome: '',
        categoria: 'OLEO',
        quantidade: '',
        precoUnitario: '',
        observacao: 'Cadastro inicial / Entrada manual'
      });

      // Tenta enviar para o backend em segundo plano
      const payloadApi = {
        nomeProduto: formProduto.nome,
        categoria: formProduto.categoria,
        quantidade: parseInt(formProduto.quantidade, 10),
        precoUnitario: parseFloat(formProduto.precoUnitario),
        observacao: formProduto.observacao
      };
      
      await api.post('/movimentacoes/entrada', payloadApi).catch(() => {
        console.log('Salvo localmente com sucesso.');
      });

    } catch (error) {
      alert('Erro ao cadastrar produto no estoque.');
    } finally {
      setSalvandoProduto(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* FORMULÁRIO DE ENTRADA / CADASTRO */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <PlusCircle className="text-yellow-600" size={22} />
          Cadastrar Produto ou Registrar Entrada no Estoque
        </h2>
        
        <form onSubmit={handleCadastrarProduto} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome do Produto</label>
            <input
              type="text"
              required
              placeholder="Ex: Óleo Petronas 5W30"
              value={formProduto.nome}
              onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Categoria</label>
            <select
              value={formProduto.categoria}
              onChange={(e) => setFormProduto({ ...formProduto, categoria: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-sm"
            >
              <option value="OLEO">Óleo</option>
              <option value="FILTRO">Filtro</option>
              <option value="ADITIVO">Aditivo</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantidade</label>
            <input
              type="number"
              required
              min="1"
              placeholder="Ex: 12"
              value={formProduto.quantidade}
              onChange={(e) => setFormProduto({ ...formProduto, quantidade: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Preço Unit. (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="45.00"
              value={formProduto.precoUnitario}
              onChange={(e) => setFormProduto({ ...formProduto, precoUnitario: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-sm font-bold text-slate-900"
            />
          </div>

          <div className="lg:col-span-5 flex justify-end pt-2">
            <button
              type="submit"
              disabled={salvandoProduto}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow-md cursor-pointer disabled:opacity-50"
            >
              <PlusCircle size={18} />
              {salvandoProduto ? 'Salvando...' : 'Cadastrar no Estoque'}
            </button>
          </div>
        </form>
      </div>

      {/* TABELA DE EXTRATO */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
          <Layers className="text-yellow-600" size={24} /> Extrato de Auditoria do Estoque
        </h2>
        <p className="text-sm text-slate-500 mb-6">Histórico detalhado das entradas e baixas</p>

        <div className="overflow-x-auto">
          {carregandoMovimentacoes ? (
            <div className="p-8 text-center text-slate-400">Carregando extrato...</div>
          ) : !movimentacoes || movimentacoes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Nenhuma movimentação registrada.</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 uppercase text-xs text-slate-700">
                <tr>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3 text-center">Qtd.</th>
                  <th className="p-3 text-right">Preço Un.</th>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {movimentacoes.map((mov, idx) => (
                  <tr key={mov.id || idx} className="hover:bg-slate-50">
                    <td className="p-3">
                      {mov.tipo === 'ENTRADA' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <ArrowUpCircle size= {14} /> Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                          <ArrowDownCircle size={14} /> Saída
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{mov.produto?.nome || mov.nomeProduto || 'Produto'}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{mov.quantidade}</td>
                    <td className="p-3 text-right text-slate-700">R$ {Number(mov.precoUnitario || 0).toFixed(2)}</td>
                    <td className="p-3 text-xs text-slate-500">
                      {mov.dataMovimentacao ? new Date(mov.dataMovimentacao).toLocaleString('pt-BR') : 'N/I'}
                    </td>
                    <td className="p-3 text-xs text-slate-600 italic">{mov.observacao || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}