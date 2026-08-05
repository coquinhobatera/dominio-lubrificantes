import React, { useState } from 'react';
import { Car, BarChart3, Package, Calendar, ShoppingCart } from 'lucide-react';
import logoImg from './assets/logo.jpg';

// Importando as abas modularizadas
import PdvTab from './components/PdvTab';
import BalcaoTab from './components/BalcaoTab';
import RelatoriosTab from './components/RelatoriosTab';
import EstoqueTab from './components/EstoqueTab';
import AgendaFinanceira from './components/AgendaFinanceira';

export default function App() {
  const [abaNavegacao, setAbaNavegacao] = useState('BALCAO');

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10">
      
      {/* BANNER SUPERIOR COM LOGO MAIOR E CENTRALIZADO */}
      <header className="bg-slate-900 border-b-4 border-yellow-500 text-white shadow-xl mb-6">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
          
          {/* LINHA 1: LOGO E TÍTULO CENTRALIZADOS */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shadow-md border border-yellow-500">
                <img src={logoImg} alt="Domínio Lubrificantes" className="h-25 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wider uppercase text-yellow-400">
                  DOMÍNIO LUBRIFICANTES
                </h1>
                <p className="text-[11px] text-slate-300 font-semibold tracking-wide">
                  SISTEMA DE GESTÃO DE ATENDIMENTO E TROCA DE ÓLEO
                </p>
              </div>
            </div>
          </div>

          {/* LINHA 2: MENU DE NAVEGAÇÃO CENTRALIZADO */}
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

    </div>
  );
}