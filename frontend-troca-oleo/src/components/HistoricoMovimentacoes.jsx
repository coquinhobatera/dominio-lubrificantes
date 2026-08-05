import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react';
import { getMovimentacoes } from '../services/api';

export default function HistoricoMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovimentacoes()
      .then((res) => setMovimentacoes(res.data))
      .catch((err) => console.error("Erro ao carregar movimentações:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-600">Carregando extrato de movimentações...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Extrato de Movimentações do Estoque
          </h1>
          <p className="text-sm text-gray-500">Histórico detalhado de entradas e saídas/baixas do sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4 text-center">Quantidade</th>
                <th className="py-3 px-4 text-right">Preço Un.</th>
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Observação / Referência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {movimentacoes.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    {mov.tipo === 'ENTRADA' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <ArrowUpCircle className="w-4 h-4 text-emerald-600" /> Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                        <ArrowDownCircle className="w-4 h-4 text-rose-600" /> Saída / Baixa
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{mov.produto?.nome}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-800">{mov.quantidade}</td>
                  <td className="py-3 px-4 text-right text-gray-600">R$ {mov.precoUnitario?.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {new Date(mov.dataMovimentacao).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-gray-600 italic">{mov.observacao || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}