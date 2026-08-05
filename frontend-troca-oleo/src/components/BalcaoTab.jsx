import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, Wrench, CreditCard, Save, CheckCircle, Search, 
  History, UserCheck, UserPlus, MessageCircle, 
  Bell, Calendar, Clock, Printer, AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { ReciboTermico } from './recibo/ReciboTermico';

export default function BalcaoTab() {
  const [formData, setFormData] = useState({
    placa: '',
    modeloVeiculo: '',
    nomeCliente: '',
    whatsapp: '',
    kmAtual: '',
    oleo: '',
    filtro: '',
    valorTotal: '',
    formaPagamento: 'PIX',
  });

  const [toast, setToast] = useState({ show: false, mensagem: '', tipo: 'sucesso' });
  const [buscandoPlaca, setBuscandoPlaca] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusVeiculo, setStatusVeiculo] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [filtroHistorico, setFiltroHistorico] = useState('');
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [atendimentoParaImprimir, setAtendimentoParaImprimir] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('TODOS');

  const inputPlacaRef = useRef(null);

  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    setToast({ show: true, mensagem, tipo });
    setTimeout(() => {
      setToast({ show: false, mensagem: '', tipo: 'sucesso' });
    }, 3500);
  };

  const carregarHistorico = async () => {
    try {
      setCarregandoHistorico(true);
      const res = await api.get('/atendimentos');
      setHistorico(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar histórico.', e);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const formatarPlaca = (valor) => valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

  const formatarWhatsapp = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '').slice(0, 11);
    if (apenasNumeros.length <= 2) return apenasNumeros;
    if (apenasNumeros.length <= 7) return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
  };

  const buscarDadosPorPlaca = async (placaParaBuscar) => {
    if (placaParaBuscar.length === 7) {
      try {
        setBuscandoPlaca(true);
        const response = await api.get(`/veiculos/${placaParaBuscar}`);
        const veiculo = response.data;
        if (veiculo) {
          setFormData((prev) => ({
            ...prev,
            modeloVeiculo: veiculo.modelo || veiculo.modeloVeiculo || prev.modeloVeiculo,
            nomeCliente: veiculo.cliente?.nome || veiculo.nomeCliente || prev.nomeCliente,
            whatsapp: veiculo.cliente?.whatsapp || veiculo.whatsapp || prev.whatsapp,
          }));
          setStatusVeiculo('EXISTENTE');
          mostrarToast('Veículo já cadastrado! Dados carregados.', 'sucesso');
        }
      } catch (error) {
        setStatusVeiculo('NOVO');
      } finally {
        setBuscandoPlaca(false);
      }
    }
  };

  // Manipulador de digitação otimizado e seguro
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'placa' ? formatarPlaca(value) :
              name === 'whatsapp' ? formatarWhatsapp(value) : value
    }));

    if (name === 'placa') {
      setStatusVeiculo(null);
      const placaLimpa = formatarPlaca(value);
      if (placaLimpa.length === 7) {
        buscarDadosPorPlaca(placaLimpa);
      }
    }
  };

  const enviarWhatsAppELembrete = async (atendimento, trocaId) => {
    const numeroLimpo = (atendimento.whatsapp || atendimento.veiculo?.cliente?.whatsapp || '').replace(/\D/g, '');
    if (!numeroLimpo) {
      mostrarToast('Cliente não possui WhatsApp válido.', 'erro');
      return;
    }
    const telefoneComDDI = numeroLimpo.length <= 11 ? `55${numeroLimpo}` : numeroLimpo;
    const placa = atendimento.placa || atendimento.veiculo?.placa || 'N/I';
    const modelo = atendimento.modelo || atendimento.modeloVeiculo || atendimento.veiculo?.modelo || 'Veículo';
    const nome = atendimento.nomeCliente || atendimento.veiculo?.cliente?.nome || 'Cliente';
    const servico = atendimento.descricaoServico || `Óleo: ${atendimento.oleo || atendimento.oleoUtilizado || 'N/I'} | Filtro: ${atendimento.filtro || atendimento.filtroOleo || 'N/I'}`;
    const valor = Number(atendimento.valorTotal || 0).toFixed(2);
    const pagamento = atendimento.formaPagamento || 'A combinar';
    const kmAtualNum = Number(atendimento.kmAtual || 0);
    const proximaKm = kmAtualNum > 0 ? (kmAtualNum + 10000).toLocaleString('pt-BR') : '10.000';

    const texto = 
      `Olá *${nome}*! 👋%0A%0A` +
      `Agradecemos pela preferência na *Domínio Lubrificantes*! 🛢️🚗%0A%0A` +
      `📋 *COMPROVANTE DE SERVIÇO*%0A` +
      `───────────────%0A` +
      `🚘 *Veículo:* ${modelo}%0A` +
      `🏷️ *Placa:* ${placa}%0A` +
      `📏 *KM Atual:* ${atendimento.kmAtual} KM%0A` +
      `🛠️ *Serviço:* ${servico}%0A` +
      `💳 *Pagamento:* ${pagamento}%0A` +
      `💰 *Valor Total:* R$ ${valor}%0A` +
      `───────────────%0A%0A` +
      `📅 *PRÓXIMA TROCA RECOMENDADA:*%0A` +
      `Em *6 meses* ou ao atingir *${proximaKm} KM*.%0A%0A` +
      `Qualquer dúvida, estamos à disposição!`;

    window.open(`https://api.whatsapp.com/send?phone=${telefoneComDDI}&text=${texto}`, '_blank');

    if (trocaId) {
      try {
        await api.patch(`/atendimentos/${trocaId}/lembrete?status=ENVIADO`);
        carregarHistorico();
      } catch (err) {
        console.error('Erro ao atualizar lembrete', err);
      }
    }
  };

  const reimprimirRecibo = (item) => {
    const dadosRecibo = {
      placa: item.placa || item.veiculo?.placa,
      modelo: item.modelo || item.modeloVeiculo || item.veiculo?.modelo,
      nomeCliente: item.nomeCliente || item.veiculo?.cliente?.nome,
      whatsapp: item.whatsapp || item.veiculo?.cliente?.whatsapp,
      kmAtual: item.kmAtual,
      oleoUtilizado: item.oleo || item.oleoUtilizado,
      filtroOleo: item.filtro || item.filtroOleo,
      descricaoServico: item.descricaoServico || `Óleo: ${item.oleo || item.oleoUtilizado || 'N/I'}`,
      valorTotal: item.valorTotal || item.historicoTrocas?.[0]?.valorTotal,
      formaPagamento: item.formaPagamento || item.historicoTrocas?.[0]?.formaPagamento
    };
    setAtendimentoParaImprimir(dadosRecibo);
    setTimeout(() => { window.print(); }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const km = formData.kmAtual ? parseInt(formData.kmAtual, 10) : null;
    const valor = formData.valorTotal ? parseFloat(formData.valorTotal) : 0.0;

    const payload = {
      placa: formData.placa.trim(),
      nomeCliente: formData.nomeCliente.trim(),
      whatsapp: formData.whatsapp.trim(),
      modelo: formData.modeloVeiculo.trim() || null,
      kmAtual: isNaN(km) ? null : km,
      oleoUtilizado: formData.oleo,
      filtroOleo: formData.filtro,
      descricaoServico: `Óleo: ${formData.oleo || 'N/I'} | Filtro: ${formData.filtro || 'N/I'}`.trim(),
      valorTotal: valor,
      formaPagamento: formData.formaPagamento
    };

    try {
      setSalvando(true);
      await api.post('/atendimentos', payload);
      setAtendimentoParaImprimir({ ...formData, modelo: formData.modeloVeiculo });
      mostrarToast('Atendimento gravado e recibo enviado para impressão!', 'sucesso');
      setStatusVeiculo(null);
      if (formData.whatsapp) enviarWhatsAppELembrete(formData, null);
      setTimeout(() => { window.print(); }, 300);
      setFormData({ placa: '', modeloVeiculo: '', nomeCliente: '', whatsapp: '', kmAtual: '', oleo: '', filtro: '', valorTotal: '', formaPagamento: 'PIX' });
      carregarHistorico();
      if (inputPlacaRef.current) inputPlacaRef.current.focus();
    } catch (error) {
      mostrarToast('Erro ao registrar atendimento. Verifique os dados.', 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const historicoFiltrado = historico.filter((item) => {
    const termo = filtroHistorico.toLowerCase();
    const placa = (item.placa || item.veiculo?.placa || '').toLowerCase();
    const cliente = (item.nomeCliente || item.veiculo?.cliente?.nome || '').toLowerCase();
    const combina = placa.includes(termo) || cliente.includes(termo);
    if (abaAtiva === 'LEMBRETES_PENDENTES') {
      return combina && (item.statusLembrete || 'PENDENTE') === 'PENDENTE';
    }
    return combina;
  });

  const totalPendentes = historico.filter(i => (i.statusLembrete || 'PENDENTE') === 'PENDENTE').length;

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

      <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 border border-slate-200">
        <div className="mb-8 border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Novo Atendimento - Registro de Serviço</h2>
            <p className="text-sm text-slate-500">Preencha os dados para salvar o histórico e agendar o retorno.</p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hidden md:block">
            💡 Dica: Digite os 7 caracteres da placa para buscar clientes cadastrados.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2">
                <Car size={18} className="text-blue-700" /> Veículo e Cliente
              </h3>
              {statusVeiculo === 'EXISTENTE' && (
                <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
                  <UserCheck size={14} /> Cliente Recorrente
                </span>
              )}
              {statusVeiculo === 'NOVO' && (
                <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-300">
                  <UserPlus size={14} /> Novo Cliente
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 flex justify-between">
                  Placa {buscandoPlaca && <Search size={12} className="animate-spin text-blue-600" />}
                </label>
                <input 
                  ref={inputPlacaRef}
                  type="text" 
                  name="placa" 
                  value={formData.placa} 
                  onChange={handleChange} 
                  placeholder="ABC1D23" 
                  className="w-full p-2.5 border border-slate-300 rounded-md font-mono uppercase font-bold bg-white focus:ring-2 focus:ring-yellow-500 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Modelo Veículo</label>
                <input type="text" name="modeloVeiculo" value={formData.modeloVeiculo} onChange={handleChange} placeholder="Ex: Ford Focus" className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome do Cliente</label>
                <input type="text" name="nomeCliente" value={formData.nomeCliente} onChange={handleChange} placeholder="Nome completo" className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">WhatsApp</label>
                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 90000-0000" className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" required />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Wrench size={18} className="text-blue-700" /> Detalhes do Serviço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">KM Atual</label>
                <input type="number" name="kmAtual" value={formData.kmAtual} onChange={handleChange} placeholder="Ex: 85000" className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Óleo Utilizado</label>
                <input type="text" name="oleo" value={formData.oleo} onChange={handleChange} placeholder="Ex: Motorcraft 5W20" className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Filtro de Óleo</label>
                <input type="text" name="filtro" value={formData.filtro} onChange={handleChange} placeholder="Ex: TM1" className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-700" /> Pagamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Forma de Pagamento</label>
                <select name="formaPagamento" value={formData.formaPagamento} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none">
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="FATURADO">Faturado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Valor Total (R$)</label>
                <input type="number" step="0.01" name="valorTotal" value={formData.valorTotal} onChange={handleChange} placeholder="300.00" className="w-full p-2.5 border border-slate-300 rounded-md font-bold text-lg bg-white focus:ring-2 focus:ring-yellow-500 outline-none" required />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={salvando} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold py-3.5 px-8 rounded-lg shadow-md cursor-pointer disabled:opacity-50 transition-all">
              <Save size={20} /> {salvando ? 'Processando...' : 'Salvar, Imprimir e Enviar WhatsApp'}
            </button>
          </div>
        </form>
      </div>

      {/* HISTÓRICO DE ATENDIMENTOS */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 border border-slate-200 mt-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setAbaAtiva('TODOS')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs cursor-pointer transition-all ${abaAtiva === 'TODOS' ? 'bg-blue-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
              <History size={16} /> Todos
            </button>
            <button onClick={() => setAbaAtiva('LEMBRETES_PENDENTES')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs cursor-pointer transition-all ${abaAtiva === 'LEMBRETES_PENDENTES' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
              <Bell size={16} /> Pendentes ({totalPendentes})
            </button>
          </div>
          <div className="relative w-full lg:w-72">
            <input type="text" value={filtroHistorico} onChange={(e) => setFiltroHistorico(e.target.value)} placeholder="Filtrar por placa ou nome..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 outline-none" />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
              <tr>
                <th className="p-3">Placa</th>
                <th className="p-3">Veículo / Cliente</th>
                <th className="p-3">Serviço / KM</th>
                <th className="p-3">Data Retorno</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {carregandoHistorico ? (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400">Carregando histórico...</td></tr>
              ) : historicoFiltrado.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400">Nenhum atendimento encontrado.</td></tr>
              ) : (
                historicoFiltrado.map((item, idx) => {
                  const status = item.statusLembrete || 'PENDENTE';
                  const trocaId = item.id || item.historicoTrocas?.[0]?.id;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800">{item.placa || item.veiculo?.placa}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{item.modelo || item.modeloVeiculo || item.veiculo?.modelo}</div>
                        <div className="text-xs text-slate-500">{item.nomeCliente || item.veiculo?.cliente?.nome}</div>
                      </td>
                      <td className="p-3">
                        <div>{item.descricaoServico || item.oleo}</div>
                        <div className="text-xs text-slate-400">{item.kmAtual} KM</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Calendar size={14} className="text-slate-400" /> {item.dataLembrete || 'Em 6 meses'}
                        </div>
                      </td>
                      <td className="p-3">
                        {status === 'PENDENTE' && <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300"><Clock size={12} className="inline mr-1" /> Pendente</span>}
                        {status === 'ENVIADO' && <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle size={12} className="inline mr-1" /> Enviado</span>}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => reimprimirRecibo(item)} title="Reimprimir Recibo" className="bg-slate-700 hover:bg-slate-800 text-white text-xs py-1.5 px-2.5 rounded-md cursor-pointer transition-colors"><Printer size={14} /></button>
                          <button onClick={() => enviarWhatsAppELembrete(item, trocaId)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 rounded-md flex items-center gap-1 cursor-pointer transition-colors">
                            <MessageCircle size={15} /> {status === 'PENDENTE' ? 'WhatsApp' : 'Reenviar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {atendimentoParaImprimir && (
        <div className="hidden print:block">
          <ReciboTermico atendimento={atendimentoParaImprimir} dados={atendimentoParaImprimir} />
        </div>
      )}
    </div>
  );
}