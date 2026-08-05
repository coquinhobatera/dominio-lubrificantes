import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await api.post('/auth/login', { username, senha });
      const dadosUsuario = response.data;

      // Salva no navegador que o usuário está logado
      localStorage.setItem('usuarioLogado', JSON.stringify(dadosUsuario));
      onLoginSuccess(dadosUsuario);

    } catch (err) {
      setErro('Usuário ou senha incorretos. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-yellow-500 text-slate-900 rounded-xl mb-3 shadow">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Domínio Lubrificantes</h1>
          <p className="text-sm text-slate-500 mt-1">Acesse o sistema com suas credenciais</p>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Usuário</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: admin ou caixa"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Senha</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200 cursor-pointer text-sm"
          >
            {carregando ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Módulo Fiscal e PDV Seguro &bull; Versão 1.0
        </div>
      </div>
    </div>
  );
}