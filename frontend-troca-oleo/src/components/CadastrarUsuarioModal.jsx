import React, { useState } from 'react';
import { UserPlus, X, Shield, Lock, User } from 'lucide-react';
import { api } from '../services/api';

export default function CadastrarUsuarioModal({ isOpen, onClose }) {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('CAIXA');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ texto: '', tipo: '' });

    try {
      await api.post('/auth/registrar', {
        username,
        senha,
        perfil
      });
      setMensagem({ texto: 'Usuário cadastrado com sucesso!', tipo: 'sucesso' });
      setUsername('');
      setSenha('');
      setPerfil('CAIXA');
    } catch (error) {
      const erroMsg = error.response?.data || 'Erro ao cadastrar usuário.';
      setMensagem({ texto: typeof erroMsg === 'string' ? erroMsg : 'Erro ao cadastrar.', tipo: 'erro' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 relative">
        
        {/* Botão de Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-500 text-slate-950 rounded-xl shadow">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Novo Usuário</h2>
            <p className="text-xs text-slate-500">Cadastre um operador ou gerente no sistema</p>
          </div>
        </div>

        {mensagem.texto && (
          <div className={`mb-4 p-3 rounded-lg text-xs font-semibold text-center border ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nome de Usuário</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: joao.silva"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Senha</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Perfil de Acesso</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Shield size={16} />
              </span>
              <select
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="CAIXA">Caixa / Operador</option>
                <option value="GERENTE">Gerente / Administrador</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg shadow transition cursor-pointer text-sm"
            >
              {carregando ? 'Salvando...' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}