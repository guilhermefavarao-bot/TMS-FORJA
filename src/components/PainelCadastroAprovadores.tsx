import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface PainelCadastroAprovadoresProps {
  onClose: () => void;
  onSave: (aprovador: { nome: string; status: string }) => void;
}

const PainelCadastroAprovadores: React.FC<PainelCadastroAprovadoresProps> = ({ onClose, onSave }) => {
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState('Ativo');

  const handleSave = () => {
    if (!nome) {
      alert('Por favor, preencha o nome do aprovador.');
      return;
    }
    onSave({ nome, status });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]">
      <div className="win-outset p-1 bg-[#C0C0C0] w-[600px] flex flex-col">
        <div className="win-title-bar flex items-center justify-between h-6">
          <span className="font-bold ml-1">Painel de Cadastro de Aprovadores</span>
          <button onClick={onClose} className="win-button h-4 w-4 flex items-center justify-center mr-1">
            <X size={12} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center">
            <label className="w-40">Nome do Aprovador:</label>
            <input 
              type="text" 
              className="win-input flex-1"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <label className="w-40">Status:</label>
            <select 
              className="win-input flex-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end items-center p-2 border-t border-gray-400 gap-2">
            <button onClick={onClose} className="win-button px-4 py-1">
                Voltar
            </button>
            <button onClick={handleSave} className="win-button px-4 py-1 font-bold flex items-center gap-1">
                <Save size={14} />
                Salvar
            </button>
        </div>
      </div>
    </div>
  );
};

export default PainelCadastroAprovadores;
