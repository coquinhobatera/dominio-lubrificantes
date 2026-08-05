import React, { useState, useEffect } from 'react';
import { Car, BarChart3, Package, Calendar, ShoppingCart, LogOut, UserCheck } from 'lucide-react';
import logoImg from './assets/logo.jpg';

// Importando as abas modularizadas
import PdvTab from './components/PdvTab';
import BalcaoTab from './components/BalcaoTab';
import RelatoriosTab from './components/RelatoriosTab';
import EstoqueTab from './components/EstoqueTab';
import AgendaFinanceira from './components/AgendaFinanceira';
import LoginView from './components/LoginView'; // Tela de login
import CadastrarUsuarioModal from './components/CadastrarUsuarioModal'; // Modal de cadastro de usuário

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [abaNavegacao, setAbaNavegacao] = useState('BALCAO');
  const [isModalUsuarioOpen, setIsModalUsuarioOpen] = useState(false);

  // Recupera o usuário salvo no navegador ao abrir o app
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    setUsuario(null);
  };

  // Se o usuário não estiver logado, exibe a tela de login
  if (!usuario) {
    return <LoginView onLoginSuccess={(dados) => setUsuario(dados)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10">
      
      {/* BANNER SUPERIOR COM LOGO, DADOS DO OPERADOR E MENU */}
      <header className="bg-slate-900 border-b-4 border-yellow-500 text-white shadow-xl mb-6">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
          
          {/* TOPO: LOGO, TÍTULO E SAUDAÇÃO DO USUÁRIO */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            
            {/* Logo e Título */}
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shadow-md border border-yellow-500">
                <img src={logoImg} alt="Domínio Lubrificantes" className="h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-yellow-400">
                  DOMÍNIO LUBRIFICANTES
                </h1>
                <p className="text-[11px] text-slate-300 font-semibold tracking-wide">
                  SISTEMA DE GESTÃO DE ATENDIMENTO E TROCA DE ÓLEO
                </p>
              </div>
            </div>

            {/* Perfil, Botão Novo Usuário (Gerente) e Botão de Sair */}
            <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <div className="text-right">
                <p className="text-xs font-bold text-yellow-400 flex items-center justify-end gap-1">
                  <UserCheck size={14} /> {usuario.nomeUsuario}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Perfil: {usuario.perfil}</p>
              </div>

              {/* Botão de cadastro visível apenas para GERENTE */}
              {usuario.perfil === 'GERENTE' && (
                <button
                  onClick={() => setIsModalUsuarioOpen(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer shadow flex items-center gap-1"
                >
                  + Novo Usuário
                </button>
              )}

              <button
                onClick={handleLogout}
                title="Sair do Sistema"
                className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg transition cursor-pointer flex items-center justify-center shadow"
              >
                <LogOut size={16} />
              </button>
            </div>

          </div>

          {/* MENU DE NAVEGAÇÃO CENTRALIZADO */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-800/90 border border-slate-700 p-1.5 rounded-xl shadow-inner">
            <button
              onClick={() => setAbaNavegacao('BALCAO')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaNavegacao === 'BALCAO' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Car size={15} /> Balcão / Atendimento
            </button>

            <button
              onClick={() => setAbaNavegacao('PDV')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaNavegacao === 'PDV' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ShoppingCart size={15} /> Caixa / NFC-e
            </button>

            <button
              onClick={() => setAbaNavegacao('RELATORIOS')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaNavegacao === 'RELATORIOS' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BarChart3 size={15} /> Relatórios & Vendas
            </button>

            <button
              onClick={() => setAbaNavegacao('ESTOQUE')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaNavegacao === 'ESTOQUE' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Package size={15} /> Estoque & Extrato
            </button>

            <button
              onClick={() => setAbaNavegacao('AGENDA')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaNavegacao === 'AGENDA' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Calendar size={15} /> Agenda & Financeiro
            </button>
          </div>

        </div>
      </header>

      {/* CONTEÚDO DINÂMICO DA ABA ATIVA */}
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {abaNavegacao === 'BALCAO' && <BalcaoTab />}
        {abaNavegacao === 'PDV' && <PdvTab />}
        {abaNavegacao === 'RELATORIOS' && <RelatoriosTab />}
        {abaNavegacao === 'ESTOQUE' && <EstoqueTab />}
        {abaNavegacao === 'AGENDA' && <AgendaFinanceira />}
      </div>

      {/* MODAL DE CADASTRO DE USUÁRIO */}
      <CadastrarUsuarioModal 
        isOpen={isModalUsuarioOpen} 
        onClose={() => setIsModalUsuarioOpen(false)} 
      />

    </div>
  );
}