import React, { useState, useEffect } from 'react';
import { 
  Calendar, DollarSign, PlusCircle, CheckCircle, Clock, 
  AlertCircle, ArrowUpCircle, ArrowDownCircle, Search, Check, Filter 
} from 'lucide-react';
import { api } from '../services/api';

export default function AgendaFinanceira() {
  const [subAba, setSubAba] = useState('RETORNOS');
  
  // Estados para Agenda de Retornos
  const [retornos, setRetornos] = useState([]);
  const [carregandoRetornos, setCarregandoRetornos] = useState(false);
  const [filtroRetorno, setFiltroRetorno] = useState('');

  // Estados para Financeiro / Contas e Calendário/Mês
  const [transacoes, setTransacoes] = useState([]);
  const [carregandoTransacoes, setCarregandoTransacoes] = useState(false);
  const [filtroFinanceiro, setFiltroFinanceiro] = useState('');
  
  // Filtros de Mês e Ano
  const dataAtual = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(String(dataAtual.getMonth() + 1).padStart(2, '0'));
  const [anoSelecionado, setAnoSelecionado] = useState(String(dataAtual.getFullYear()));
  const [filtroStatusTab, setFiltroStatusTab] = useState('TODOS'); // 'TODOS', 'PENDENTE', 'PAGO'

  const [formDataFinanceiro, setFormDataFinanceiro] = useState({
    descricao: '',
    tipo: 'DESPESA', // DESPESA ou RECEITA
    valor: '',
    dataVencimento: new Date().toISOString().split('T')[0],
    status: 'PENDENTE'
  });

  const [toast, setToast] = useState({ show: false, mensagem: '', tipo: 'sucesso' });

  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    setToast({ show: true, mensagem, tipo });
    setTimeout(() => {
      setToast({ show: false, mensagem: '', tipo: 'sucesso' });
    }, 3500);
  };

  const carregarRetornos = async () => {
    try {
      setCarregandoRetornos(true);
      const res = await api.get('/atendimentos');
      setRetornos(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar retornos', e);
    } finally {
      setCarregandoRetornos(false);
    }
  };

  const carregarTransacoes = async () => {
    try {
      setCarregandoTransacoes(true);
      const salvoLocal = localStorage.getItem('dominio_transacoes');
      if (salvoLocal) {
        setTransacoes(JSON.parse(salvoLocal));
      }
      
      const res = await api.get('/financeiro').catch(() => null);
      if (res && res.data && res.data.length > 0) {
        setTransacoes(res.data);
        localStorage.setItem('dominio_transacoes', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Erro ao carregar transações', e);
    } finally {
      setCarregandoTransacoes(false);
    }
  };

  useEffect(() => {
    carregarRetornos();
    carregarTransacoes();
  }, []);

  const handleFinanceiroChange = (e) => {
    const { name, value } = e.target;
    setFormDataFinanceiro({ ...formDataFinanceiro, [name]: value });
  };

  const handleSalvarFinanceiro = async (e) => {
    e.preventDefault();
    const novoItem = {
      id: Date.now(),
      ...formDataFinanceiro,
      valor: parseFloat(formDataFinanceiro.valor) || 0
    };

    const novaListaAtualizada = [novoItem, ...transacoes];
    setTransacoes(novaListaAtualizada);
    localStorage.setItem('dominio_transacoes', JSON.stringify(novaListaAtualizada));

    // Ajusta o mês e ano selecionados automaticamente para o mês da conta cadastrada para exibi-la na hora
    if (novoItem.dataVencimento) {
      const [anoCad, mesCad] = novoItem.dataVencimento.split('-');
      setAnoSelecionado(anoCad);
      setMesSelecionado(mesCad);
    }

    mostrarToast('Conta cadastrada com sucesso!', 'sucesso');
    setFormDataFinanceiro({
      descricao: '',
      tipo: 'DESPESA',
      valor: '',
      dataVencimento: new Date().toISOString().split('T')[0],
      status: 'PENDENTE'
    });

    try {
      await api.post('/financeiro', novoItem);
    } catch (error) {
      console.log('Salvo localmente.');
    }
  };

  const marcarComoPago = async (id) => {
    const novaLista = transacoes.map(t => t.id === id ? { ...t, status: 'PAGO' } : t);
    setTransacoes(novaLista);
    localStorage.setItem('dominio_transacoes', JSON.stringify(novaLista));
    mostrarToast('Conta marcada como paga!', 'sucesso');

    try {
      await api.patch(`/financeiro/${id}/status?status=PAGO`);
    } catch (e) {
      // Ignora erro se backend não possuir a rota exata
    }
  };

  const retornosFiltrados = retornos.filter(item => {
    const termo = filtroRetorno.toLowerCase();
    const placa = (item.placa || item.veiculo?.placa || '').toLowerCase();
    const nome = (item.nomeCliente || item.veiculo?.cliente?.nome || '').toLowerCase();
    return placa.includes(termo) || nome.includes(termo);
  });

  // Filtro avançado por Mês, Ano, Status e Descrição
  const transacoesFiltradas = transacoes.filter(item => {
    const termo = filtroFinanceiro.toLowerCase();
    const matchTermo = (item.descricao || '').toLowerCase().includes(termo);

    let matchData = true;
    if (item.dataVencimento) {
      const [ano, mes] = item.dataVencimento.split('-');
      matchData = ano === anoSelecionado && mes === mesSelecionado;
    }

    let matchStatus = true;
    if (filtroStatusTab === 'PENDENTE') matchStatus = item.status === 'PENDENTE';
    if (filtroStatusTab === 'PAGO') matchStatus = item.status === 'PAGO';

    return matchTermo && matchData && matchStatus;
  });

  // Totais do mês selecionado
  const totalDespesasMes = transacoesFiltradas
    .filter(t => t.tipo === 'DESPESA')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  const totalReceitasMes = transacoesFiltradas
    .filter(t => t.tipo === 'RECEITA')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  return (
    <div className="relative">
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-white transition-all animate-bounce ${
          toast.tipo === 'sucesso' ? 'bg-emerald-800 border-emerald-600' : 'bg-rose-800 border-rose-600'
        }`}>
          {toast.tipo === 'sucesso' ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
          <span className="font-bold text-sm">{toast.mensagem}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2.5 rounded-xl text-slate-950 font-bold shadow">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Agenda & Controle Financeiro</h2>
              <p className="text-xs text-slate-500">Gerencie os retornos de clientes e o vencimento de contas por mês.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button 
              onClick={() => setSubAba('RETORNOS')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                subAba === 'RETORNOS' ? 'bg-blue-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calendar size={16} /> Agenda de Retornos
            </button>
            <button 
              onClick={() => setSubAba('FINANCEIRO')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                subAba === 'FINANCEIRO' ? 'bg-yellow-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <DollarSign size={16} /> Contas & Caixa
            </button>
          </div>
        </div>

        {subAba === 'RETORNOS' && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="font-bold text-slate-700 text-md">Cronograma de Retorno (Previsão de 6 Meses)</h3>
              <div className="relative w-full sm:w-72">
                <input 
                  type="text" 
                  value={filtroRetorno} 
                  onChange={(e) => setFiltroRetorno(e.target.value)} 
                  placeholder="Filtrar por placa ou nome..." 
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" 
                />
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                  <tr>
                    <th className="p-3">Placa</th>
                    <th className="p-3">Cliente / Veículo</th>
                    <th className="p-3">KM Atual</th>
                    <th className="p-3">Data Estimada Retorno</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {carregandoRetornos ? (
                    <tr><td colSpan="5" className="p-6 text-center text-slate-400">Carregando cronograma...</td></tr>
                  ) : retornosFiltrados.length === 0 ? (
                    <tr><td colSpan="5" className="p-6 text-center text-slate-400">Nenhum retorno agendado encontrado.</td></tr>
                  ) : (
                    retornosFiltrados.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-800">{item.placa || item.veiculo?.placa}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{item.nomeCliente || item.veiculo?.cliente?.nome}</div>
                          <div className="text-xs text-slate-500">{item.modelo || item.modeloVeiculo || item.veiculo?.modelo}</div>
                        </td>
                        <td className="p-3 font-semibold">{item.kmAtual} KM</td>
                        <td className="p-3 text-slate-700 font-semibold">{item.dataLembrete || 'Em 6 meses'}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock size={12} className="inline mr-1" /> {item.statusLembrete || 'PENDENTE'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {subAba === 'FINANCEIRO' && (
          <div className="mt-6 space-y-6">
            <form onSubmit={handleSalvarFinanceiro} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-700 text-md flex items-center gap-2">
                <PlusCircle size={18} className="text-blue-700" /> Cadastrar Nova Conta / Movimentação
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tipo</label>
                  <select name="tipo" value={formDataFinanceiro.tipo} onChange={handleFinanceiroChange} className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none font-bold">
                    <option value="DESPESA">Despesa / Conta a Pagar</option>
                    <option value="RECEITA">Receita / Entrada</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descrição</label>
                  <input type="text" name="descricao" value={formDataFinanceiro.descricao} onChange={handleFinanceiroChange} placeholder="Ex: Conta de Luz, Aluguel, Fornecedor..." className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" name="valor" value={formDataFinanceiro.valor} onChange={handleFinanceiroChange} placeholder="0.00" className="w-full p-2.5 border border-slate-300 rounded-md bg-white font-bold focus:ring-2 focus:ring-yellow-500 outline-none" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Data de Vencimento</label>
                  <input type="date" name="dataVencimento" value={formDataFinanceiro.dataVencimento} onChange={handleFinanceiroChange} className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-slate-700" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status Inicial</label>
                  <select name="status" value={formDataFinanceiro.status} onChange={handleFinanceiroChange} className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none font-bold">
                    <option value="PENDENTE">Pendente (A Vencer)</option>
                    <option value="PAGO">Pago / Liquidado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold px-6 py-2.5 rounded-lg shadow cursor-pointer transition-all flex items-center gap-2">
                  <PlusCircle size={18} /> Salvar Conta
                </button>
              </div>
            </form>

            {/* BARRA DE CALENDÁRIO / FILTRO DE MÊS E ANO */}
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Calendar size={16} className="text-blue-700" /> Selecionar Mês/Ano:
                </div>
                <select value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)} className="p-2 border border-slate-300 rounded-md bg-white text-xs font-bold outline-none">
                  <option value="01">Janeiro</option>
                  <option value="02">Fevereiro</option>
                  <option value="03">Março</option>
                  <option value="04">Abril</option>
                  <option value="05">Maio</option>
                  <option value="06">Junho</option>
                  <option value="07">Julho</option>
                  <option value="08">Agosto</option>
                  <option value="09">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
                <select value={anoSelecionado} onChange={(e) => setAnoSelecionado(e.target.value)} className="p-2 border border-slate-300 rounded-md bg-white text-xs font-bold outline-none">
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              {/* RESUMO RÁPIDO DO MÊS */}
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  Despesas: R$ {totalDespesasMes.toFixed(2)}
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  Receitas: R$ {totalReceitasMes.toFixed(2)}
                </span>
              </div>
            </div>

            {/* LISTAGEM DE CONTAS DO MÊS */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button onClick={() => setFiltroStatusTab('TODOS')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${filtroStatusTab === 'TODOS' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Todas do Mês</button>
                  <button onClick={() => setFiltroStatusTab('PENDENTE')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${filtroStatusTab === 'PENDENTE' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Pendentes</button>
                  <button onClick={() => setFiltroStatusTab('PAGO')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${filtroStatusTab === 'PAGO' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Pagas</button>
                </div>

                <div className="relative w-full sm:w-64">
                  <input 
                    type="text" 
                    value={filtroFinanceiro} 
                    onChange={(e) => setFiltroFinanceiro(e.target.value)} 
                    placeholder="Filtrar por descrição..." 
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" 
                  />
                  <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                    <tr>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Descrição</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {carregandoTransacoes ? (
                      <tr><td colSpan="6" className="p-6 text-center text-slate-400">Carregando contas...</td></tr>
                    ) : transacoesFiltradas.length === 0 ? (
                      <tr><td colSpan="6" className="p-6 text-center text-slate-400">Nenhuma conta encontrada para este mês.</td></tr>
                    ) : (
                      transacoesFiltradas.map((item, idx) => {
                        const isDespesa = item.tipo === 'DESPESA';
                        const isPago = item.status === 'PAGO';
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-bold">
                              {isDespesa ? (
                                <span className="flex items-center gap-1 text-rose-700 text-xs"><ArrowDownCircle size={15} /> Despesa</span>
                              ) : (
                                <span className="flex items-center gap-1 text-emerald-700 text-xs"><ArrowUpCircle size={15} /> Receita</span>
                              )}
                            </td>
                            <td className="p-3 font-semibold text-slate-800">{item.descricao}</td>
                            <td className="p-3 font-mono font-bold text-slate-700">
                              {item.dataVencimento ? new Date(item.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className={`p-3 font-extrabold ${isDespesa ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {isDespesa ? '- ' : '+ '}R$ {Number(item.valor || 0).toFixed(2)}
                            </td>
                            <td className="p-3">
                              {isPago ? (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle size={12} className="inline mr-1" /> Pago
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  <Clock size={12} className="inline mr-1" /> Pendente
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {!isPago && (
                                <button 
                                  onClick={() => marcarComoPago(item.id)} 
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 rounded-md flex items-center gap-1 mx-auto cursor-pointer transition-colors"
                                  title="Marcar como Conta Paga"
                                >
                                  <Check size={14} /> Pagar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}