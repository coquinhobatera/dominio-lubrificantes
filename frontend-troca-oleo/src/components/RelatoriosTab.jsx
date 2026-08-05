import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function RelatoriosTab() {
  const [relatorio, setRelatorio] = useState(null);
  const [dataRelatorio, setDataRelatorio] = useState(new Date().toISOString().split('T')[0]);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);

  const carregarRelatorio = async (data) => {
    try {
      setCarregandoRelatorio(true);
      const res = await api.get(`/relatorios/diario?data=${data}`);
      setRelatorio(res.data);
    } catch (e) {
      console.error('Erro ao carregar relatório.', e);
    } finally {
      setCarregandoRelatorio(false);
    }
  };

  useEffect(() => {
    carregarRelatorio(dataRelatorio);
  }, [dataRelatorio]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-yellow-600" size={24} /> Relatório Diário de Faturamento
          </h2>
          <p className="text-sm text-slate-500">Métricas financeiras calculadas pelo Spring Boot</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Calendar size={18} className="text-slate-500" />
          <input
            type="date"
            value={dataRelatorio}
            onChange={(e) => setDataRelatorio(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
          />
        </div>
      </div>

      {carregandoRelatorio ? (
        <div className="bg-white p-8 rounded-xl shadow-md text-center text-slate-500">Carregando relatório...</div>
      ) : relatorio ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-md"><DollarSign size={32} /></div>
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Faturamento Total</p>
              <h3 className="text-3xl font-extrabold text-emerald-950">
                R$ {(relatorio?.faturamentoTotal ?? relatorio?.totalFaturado ?? 0).toFixed(2)}
              </h3>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-blue-700 text-white rounded-xl shadow-md"><CheckCircle size={32} /></div>
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">OS Concluídas</p>
              <h3 className="text-3xl font-extrabold text-blue-950">
                {relatorio?.quantidadeOsConcluidas ?? relatorio?.totalAtendimentos ?? 0} Concluídos
              </h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-md text-center text-slate-400">Nenhum dado encontrado.</div>
      )}
    </div>
  );
}