import React, { useState, useEffect } from 'react';
import { 
  Car, Wrench, CreditCard, Save, CheckCircle, Search, 
  ShieldCheck, History, UserCheck, UserPlus, MessageCircle, 
  Bell, Calendar, Clock, Printer, DollarSign, Package, 
  ArrowUpCircle, ArrowDownCircle, BarChart3, Layers
} from 'lucide-react';
import { api } from './services/api';
import logoImg from './assets/logo.jpg';
// 🟢 IMPORT DO RECIBO TÉRMICO
import { ReciboTermico } from './components/recibo/ReciboTermico';

export default function App() {
  // Controle da Aba Principal da Aplicação ('BALCAO' | 'RELATORIOS' | 'ESTOQUE')
  const [abaNavegacao, setAbaNavegacao] = useState('BALCAO');

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

  const [sucesso, setSucesso] = useState(false);
  const [buscandoPlaca, setBuscandoPlaca] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusVeiculo, setStatusVeiculo] = useState(null); // 'EXISTENTE' | 'NOVO' | null
  const [historico, setHistorico] = useState([]);
  const [filtroHistorico, setFiltroHistorico] = useState('');
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  
  // 🟢 ESTADOS DOS NOVOS MÓDULOS (RELATÓRIOS E ESTOQUE)
  const [relatorio, setRelatorio] = useState(null);
  const [dataRelatorio, setDataRelatorio] = useState(new Date().toISOString().split('T')[0]);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);

  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregandoMovimentacoes, setCarregandoMovimentacoes] = useState(false);

  // 🟢 ESTADO PARA CONTROLAR O RECIBO QUE SERÁ IMPRESSO
  const [atendimentoParaImprimir, setAtendimentoParaImprimir] = useState(null);

  // Controle de visualização da tabela de balcão ('TODOS' | 'LEMBRETES_PENDENTES')
  const [abaAtiva, setAbaAtiva] = useState('TODOS');

  // 🔄 Carrega o histórico de atendimentos do backend
  const carregarHistorico = async () => {
    try {
      setCarregandoHistorico(true);
      const res = await api.get('/atendimentos');
      setHistorico(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar histórico de atendimentos.', e);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  // 📊 Carrega dados do Relatório Diário do Spring Boot (/api/relatorios/diario)
  const carregarRelatorio = async (data) => {
    try {
      setCarregandoRelatorio(true);
      const res = await api.get(`/relatorios/diario?data=${data}`);
      setRelatorio(res.data);
    } catch (e) {
      console.error('Erro ao carregar relatório diário.', e);
    } finally {
      setCarregandoRelatorio(false);
    }
  };

  // 📦 Carrega extrato de movimentações do estoque (/api/movimentacoes)
  const carregarMovimentacoes = async () => {
    try {
      setCarregandoMovimentacoes(true);
      const res = await api.get('/movimentacoes');
      setMovimentacoes(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar movimentações do estoque.', e);
    } finally {
      setCarregandoMovimentacoes(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  useEffect(() => {
    if (abaNavegacao === 'RELATORIOS') {
      carregarRelatorio(dataRelatorio);
    } else if (abaNavegacao === 'ESTOQUE') {
      carregarMovimentacoes();
    }
  }, [abaNavegacao, dataRelatorio]);

  // 🔍 Filtra os atendimentos por aba, placa ou nome
  const historicoFiltrado = historico.filter((item) => {
    const termo = filtroHistorico.toLowerCase();
    const placa = (item.placa || item.veiculo?.placa || '').toLowerCase();
    const cliente = (item.nomeCliente || item.veiculo?.cliente?.nome || '').toLowerCase();

    const combinaTermo = placa.includes(termo) || cliente.includes(termo);

    if (abaAtiva === 'LEMBRETES_PENDENTES') {
      const status = item.statusLembrete || 'PENDENTE';
      return combinaTermo && status === 'PENDENTE';
    }

    return combinaTermo;
  });

  // 📲 Função para abrir o WhatsApp e atualizar o status no Backend
  const enviarWhatsAppELembrete = async (atendimento, trocaId) => {
    const numeroLimpo = (atendimento.whatsapp || atendimento.veiculo?.cliente?.whatsapp || '').replace(/\D/g, '');

    if (!numeroLimpo) {
      alert('Este cliente não possui um número de WhatsApp válido cadastrado.');
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
      `Agradecemos pela preferência em realizar a manutenção do seu veículo conosco na *Domínio Lubrificantes*! 🛢️🚗%0A%0A` +
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
      `Qualquer dúvida, estamos à disposição neste número! Tenha um ótimo dia! 🛠️✨`;

    const url = `https://api.whatsapp.com/send?phone=${telefoneComDDI}&text=${texto}`;
    window.open(url, '_blank');

    if (trocaId) {
      try {
        await api.patch(`/atendimentos/${trocaId}/lembrete?status=ENVIADO`);
        carregarHistorico();
      } catch (err) {
        console.error('Erro ao atualizar status do lembrete:', err);
      }
    }
  };

  // 🖨️ Função auxiliar para reimprimir recibos da tabela
  const reimprimirRecibo = (item) => {
    const dadosRecibo = {
      placa: item.placa || item.veiculo?.placa,
      modelo: item.modelo || item.modeloVeiculo || item.veiculo?.modelo,
      marca: item.marca || item.veiculo?.marca || '',
      ano: item.ano || item.veiculo?.ano || '',
      nomeCliente: item.nomeCliente || item.veiculo?.cliente?.nome,
      whatsapp: item.whatsapp || item.veiculo?.cliente?.whatsapp,
      kmAtual: item.kmAtual,
      oleoUtilizado: item.oleo || item.oleoUtilizado,
      filtroOleo: item.filtro || item.filtroOleo,
      descricaoServico: item.descricaoServico || `Óleo: ${item.oleo || item.oleoUtilizado || 'N/I'} | Filtro: ${item.filtro || item.filtroOleo || 'N/I'}`,
      valorTotal: item.valorTotal || item.historicoTrocas?.[0]?.valorTotal,
      formaPagamento: item.formaPagamento || item.historicoTrocas?.[0]?.formaPagamento
    };

    setAtendimentoParaImprimir(dadosRecibo);

    setTimeout(() => {
      window.print();
    }, 250);
  };

  const formatarPlaca = (valor) => valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

  const formatarWhatsapp = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '').slice(0, 11);
    if (apenasNumeros.length <= 2) return apenasNumeros;
    if (apenasNumeros.length <= 7) return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'placa') {
      setFormData({ ...formData, placa: formatarPlaca(value) });
      setStatusVeiculo(null);
    } else if (name === 'whatsapp') {
      setFormData({ ...formData, whatsapp: formatarWhatsapp(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const buscarDadosPorPlaca = async () => {
    if (formData.placa.length >= 7) {
      try {
        setBuscandoPlaca(true);
        const response = await api.get(`/veiculos/${formData.placa}`);
        const veiculo = response.data;

        if (veiculo) {
          setFormData((prev) => ({
            ...prev,
            modeloVeiculo: veiculo.modelo || veiculo.modeloVeiculo || prev.modeloVeiculo,
            nomeCliente: veiculo.cliente?.nome || veiculo.nomeCliente || prev.nomeCliente,
            whatsapp: veiculo.cliente?.whatsapp || veiculo.whatsapp || prev.whatsapp,
          }));
          setStatusVeiculo('EXISTENTE');
        }
      } catch (error) {
        setStatusVeiculo('NOVO');
      } finally {
        setBuscandoPlaca(false);
      }
    }
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
      marca: null,
      ano: null,
      kmAtual: isNaN(km) ? null : km,
      oleoUtilizado: formData.oleo,
      filtroOleo: formData.filtro,
      descricaoServico: `Óleo: ${formData.oleo || 'N/I'} | Filtro: ${formData.filtro || 'N/I'}`.trim(),
      valorTotal: valor,
      formaPagamento: formData.formaPagamento
    };

    if (!payload.whatsapp) {
      alert('O WhatsApp é obrigatório para registrar o atendimento.');
      return;
    }

    try {
      setSalvando(true);
      await api.post('/atendimentos', payload);
      
      // 🟢 DEFINE OS DADOS DO RECIBO E DISPARA A IMPRESSÃO
      setAtendimentoParaImprimir({
        ...formData,
        modelo: formData.modeloVeiculo,
        oleoUtilizado: formData.oleo,
        filtroOleo: formData.filtro,
        descricaoServico: `Óleo: ${formData.oleo || 'N/I'} | Filtro: ${formData.filtro || 'N/I'}`
      });

      setSucesso(true);
      setStatusVeiculo(null);

      // Dispara envio do WhatsApp se preenchido
      if (formData.whatsapp) {
        enviarWhatsAppELembrete(formData, null);
      }

      // Aguarda montar o recibo invisível no DOM e dispara a impressão
      setTimeout(() => {
        window.print();
      }, 300);

      setTimeout(() => setSucesso(false), 4000);

      setFormData({
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

      carregarHistorico();
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        alert('Erro 400: Certifique-se de que Placa, Nome, WhatsApp, KM e Serviço/Óleo foram informados.');
      } else {
        alert('Erro ao registrar atendimento. Verifique se o backend está rodando.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const totalPendentes = historico.filter(
    (item) => (item.statusLembrete || 'PENDENTE') === 'PENDENTE'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10">
      
      {/* BANNER SUPERIOR */}
      <header className="bg-slate-900 border-b-4 border-yellow-500 text-white shadow-xl mb-8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-5">
            <div className="bg-white p-2 rounded-xl shadow-md border-2 border-yellow-500">
              <img 
                src={logoImg} 
                alt="Domínio Lubrificantes" 
                className="h-14 w-auto object-contain" 
              />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-wider uppercase text-yellow-400 drop-shadow-md">
                DOMÍNIO LUBRIFICANTES
              </h1>
              <p className="text-xs text-slate-300 font-semibold tracking-wide">
                SISTEMA DE GESTÃO DE ATENDIMENTO E TROCA DE ÓLEO
              </p>
            </div>
          </div>

          {/* MENU DE NAVEGAÇÃO PRINCIPAL */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 p-1.5 rounded-xl shadow-inner">
            <button
              onClick={() => setAbaNavegacao('BALCAO')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaNavegacao === 'BALCAO'
                  ? 'bg-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Car size={16} />
              Balcão / Atendimento
            </button>

            <button
              onClick={() => setAbaNavegacao('RELATORIOS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaNavegacao === 'RELATORIOS'
                  ? 'bg-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BarChart3 size={16} />
              Relatórios & Vendas
            </button>

            <button
              onClick={() => setAbaNavegacao('ESTOQUE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaNavegacao === 'ESTOQUE'
                  ? 'bg-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Package size={16} />
              Estoque & Extrato
            </button>
          </div>

        </div>
      </header>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ==================== ABA 1: BALCÃO / ATENDIMENTO ==================== */}
        {abaNavegacao === 'BALCAO' && (
          <>
            {/* FORMULÁRIO DE REGISTRO */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 border border-slate-200">
              
              <div className="mb-8 border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Novo Atendimento - Registro de Serviço</h2>
                  <p className="text-sm text-slate-500">Preencha os dados do veículo para salvar o histórico e agendar o retorno.</p>
                </div>

                {sucesso && (
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg border border-emerald-300">
                    <CheckCircle size={20} />
                    <span className="font-semibold text-sm">Atendimento Gravado!</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Bloco 1: Veículo e Cliente */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2">
                      <Car size={18} className="text-blue-700" />
                      Veículo e Cliente
                    </h3>

                    {statusVeiculo === 'EXISTENTE' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full">
                        <UserCheck size={14} /> Cliente Cadastrado
                      </span>
                    )}
                    {statusVeiculo === 'NOVO' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1 rounded-full">
                        <UserPlus size={14} /> Novo Cliente
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 flex justify-between">
                        Placa
                        {buscandoPlaca && <Search size={12} className="animate-spin text-blue-600" />}
                      </label>
                      <input
                        type="text"
                        name="placa"
                        value={formData.placa}
                        onChange={handleChange}
                        onBlur={buscarDadosPorPlaca}
                        placeholder="ABC1D23"
                        className="w-full p-2.5 border border-slate-300 rounded-md font-mono uppercase focus:ring-2 focus:ring-blue-600 outline-none bg-white font-bold text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Modelo Veículo</label>
                      <input
                        type="text"
                        name="modeloVeiculo"
                        value={formData.modeloVeiculo}
                        onChange={handleChange}
                        placeholder="Ex: Ford Focus 2.0"
                        className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome do Cliente</label>
                      <input
                        type="text"
                        name="nomeCliente"
                        value={formData.nomeCliente}
                        onChange={handleChange}
                        placeholder="Nome completo"
                        className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">WhatsApp</label>
                      <input
                        type="text"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="(00) 90000-0000"
                        className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bloco 2: Serviço e Óleo */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Wrench size={18} className="text-blue-700" />
                    Detalhes do Serviço
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">KM Atual</label>
                      <input
                        type="number"
                        name="kmAtual"
                        value={formData.kmAtual}
                        onChange={handleChange}
                        placeholder="Ex: 85000"
                        className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Óleo Utilizado</label>
                      <input
                        type="text"
                        name="oleo"
                        value={formData.oleo}
                        onChange={handleChange}
                        placeholder="Ex: Motorcraft 5W20"
                        className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Filtro de Óleo</label>
                      <input
                        type="text"
                        name="filtro"
                        value={formData.filtro}
                        onChange={handleChange}
                        placeholder="Ex: TM1 - Filtro de Óleo"
                        className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloco 3: Pagamento */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-blue-700" />
                    Pagamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Forma de Pagamento</label>
                      <select
                        name="formaPagamento"
                        value={formData.formaPagamento}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                      >
                        <option value="PIX">PIX</option>
                        <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                        <option value="CARTAO_DEBITO">Cartão de Débito</option>
                        <option value="DINHEIRO">Dinheiro</option>
                        <option value="FATURADO">Faturado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Valor Total (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="valorTotal"
                        value={formData.valorTotal}
                        onChange={handleChange}
                        placeholder="300.00"
                        className="w-full p-2.5 border border-slate-300 rounded-md font-bold text-slate-900 text-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Botão de Ação */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={salvando}
                    className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-bold py-3.5 px-8 rounded-lg shadow-md transition-colors cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} />
                    {salvando ? 'Processando...' : 'Salvar, Imprimir Recibo e Agendar'}
                  </button>
                </div>

              </form>
            </div>

            {/* TABELA DE ATENDIMENTOS E LEMBRETES */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 border border-slate-200">
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setAbaAtiva('TODOS')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                      abaAtiva === 'TODOS'
                        ? 'bg-blue-800 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <History size={16} />
                    Todos os Atendimentos
                  </button>

                  <button
                    onClick={() => setAbaAtiva('LEMBRETES_PENDENTES')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                      abaAtiva === 'LEMBRETES_PENDENTES'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bell size={16} />
                    Lembretes Pendentes
                    {totalPendentes > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-black ${
                        abaAtiva === 'LEMBRETES_PENDENTES' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
                      }`}>
                        {totalPendentes}
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative w-full lg:w-72">
                  <input
                    type="text"
                    value={filtroHistorico}
                    onChange={(e) => setFiltroHistorico(e.target.value)}
                    placeholder="Filtrar por placa ou nome..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none bg-white font-medium"
                  />
                  <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                </div>

              </div>

              {/* TABELA DE DADOS */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                    <tr>
                      <th className="p-3">Placa</th>
                      <th className="p-3">Veículo / Cliente</th>
                      <th className="p-3">Serviço / KM</th>
                      <th className="p-3">Data Retorno</th>
                      <th className="p-3">Status Lembrete</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {carregandoHistorico ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-400">
                          Carregando atendimentos...
                        </td>
                      </tr>
                    ) : historicoFiltrado.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-400 py-8">
                          {abaAtiva === 'LEMBRETES_PENDENTES' 
                            ? '🎉 Nenhum lembrete de 6 meses pendente no momento!'
                            : 'Nenhum atendimento encontrado.'}
                        </td>
                      </tr>
                    ) : (
                      historicoFiltrado.map((item, idx) => {
                        const status = item.statusLembrete || 'PENDENTE';
                        const trocaId = item.id || item.historicoTrocas?.[0]?.id;

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-800">
                              {item.placa || item.veiculo?.placa}
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-800">
                                {item.modelo || item.modeloVeiculo || item.veiculo?.modelo}
                              </div>
                              <div className="text-xs text-slate-500">
                                {item.nomeCliente || item.veiculo?.cliente?.nome}
                              </div>
                            </td>
                            <td className="p-3">
                              <div>{item.descricaoServico || item.oleo || 'Serviço padrão'}</div>
                              <div className="text-xs text-slate-400">{item.kmAtual} KM</div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <Calendar size={14} className="text-slate-400" />
                                {item.dataLembrete || 'Em 6 meses'}
                              </div>
                            </td>
                            <td className="p-3">
                              {status === 'PENDENTE' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  <Clock size={12} /> Pendente
                                </span>
                              )}
                              {status === 'ENVIADO' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle size={12} /> Enviado
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Botão Reimprimir Recibo */}
                                <button
                                  onClick={() => reimprimirRecibo(item)}
                                  title="Reimprimir Recibo Térmico"
                                  className="inline-flex items-center gap-1 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs py-1.5 px-2.5 rounded-md transition-colors cursor-pointer shadow-sm"
                                >
                                  <Printer size={14} />
                                </button>

                                {/* Botão WhatsApp */}
                                <button
                                  onClick={() => enviarWhatsAppELembrete(item, trocaId)}
                                  title="Enviar confirmação e marcar como enviado"
                                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 rounded-md transition-colors cursor-pointer shadow-sm"
                                >
                                  <MessageCircle size={15} />
                                  {status === 'PENDENTE' ? 'Disparar WhatsApp' : 'Reenviar'}
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
          </>
        )}

        {/* ==================== ABA 2: RELATÓRIOS & VENDAS ==================== */}
        {abaNavegacao === 'RELATORIOS' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="text-yellow-600" size={24} />
                  Relatório Diário de Faturamento
                </h2>
                <p className="text-sm text-slate-500">Métricas financeiras calculadas diretamente pelo Spring Boot</p>
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
              <div className="bg-white p-8 rounded-xl shadow-md text-center text-slate-500 font-medium">
                Carregando relatório do dia...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-md">
                      <DollarSign size={32} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Faturamento Total</p>
                      <h3 className="text-3xl font-extrabold text-emerald-950">
                        R$ {relatorio?.faturamentoTotal?.toFixed(2) || '0.00'}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-4 bg-blue-700 text-white rounded-xl shadow-md">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">OS / Atendimentos Concluídos</p>
                      <h3 className="text-3xl font-extrabold text-blue-950">
                        {relatorio?.quantidadeOsConcluidas || 0} Concluídos
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                  <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Package className="text-blue-700" size={20} />
                    Itens e Mão de Obra Vendidos nesta Data
                  </h3>

                  {relatorio?.itensVendidos?.length === 0 ? (
                    <p className="text-slate-400 text-center py-6">Nenhum item faturado na data selecionada.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-100 uppercase text-xs text-slate-700">
                          <tr>
                            <th className="p-3">Descrição do Item / Serviço</th>
                            <th className="p-3 text-center">Quantidade</th>
                            <th className="p-3 text-right">Total Faturado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {relatorio?.itensVendidos?.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold text-slate-800">{item.descricao}</td>
                              <td className="p-3 text-center font-bold">{item.quantidade}</td>
                              <td className="p-3 text-right font-extrabold text-emerald-700">
                                R$ {item.totalVendido?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== ABA 3: ESTOQUE & EXTRATO ==================== */}
        {abaNavegacao === 'ESTOQUE' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Layers className="text-yellow-600" size={24} />
                Extrato de Auditoria de Movimentações do Estoque
              </h2>
              <p className="text-sm text-slate-500">Histórico detalhado das entradas, saídas manuais e baixas automáticas de OS</p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              {carregandoMovimentacoes ? (
                <div className="p-8 text-center text-slate-400">Carregando movimentações do estoque...</div>
              ) : movimentacoes.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Nenhuma movimentação registrada no estoque.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100 uppercase text-xs text-slate-700">
                      <tr>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Produto</th>
                        <th className="p-3 text-center">Qtd.</th>
                        <th className="p-3 text-right">Preço Un.</th>
                        <th className="p-3">Data / Hora</th>
                        <th className="p-3">Observação / Origem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {movimentacoes.map((mov) => (
                        <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            {mov.tipo === 'ENTRADA' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <ArrowUpCircle size={14} /> Entrada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                <ArrowDownCircle size={14} /> Saída / Baixa
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{mov.produto?.nome || 'Produto Indefinido'}</td>
                          <td className="p-3 text-center font-bold text-slate-900">{mov.quantidade}</td>
                          <td className="p-3 text-right text-slate-700">R$ {mov.precoUnitario?.toFixed(2)}</td>
                          <td className="p-3 text-xs text-slate-500">
                            {new Date(mov.dataMovimentacao).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-3 italic text-slate-600">{mov.observacao || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 🟢 COMPONENTE DE RECIBO TÉRMICO OCULTO (Renders apenas na Impressão) */}
      <ReciboTermico atendimento={atendimentoParaImprimir} />

    </div>
  );
}