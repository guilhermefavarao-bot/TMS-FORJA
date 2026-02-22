import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface PainelCadastroOcorrenciasProps {
  onClose: () => void;
  onSave: (ocorrencia: { descricao: string; status: string }) => void;
}

const PainelCadastroOcorrencias: React.FC<PainelCadastroOcorrenciasProps> = ({ onClose, onSave }) => {
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('Pendente');

  const handleSave = () => {
    if (!descricao) {
      alert('Por favor, preencha a descrição da ocorrência.');
      return;
    }
    onSave({ descricao, status });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="win-outset p-1 bg-[#C0C0C0] w-[600px] flex flex-col">
        <div className="win-title-bar flex items-center justify-between h-6">
          <span className="font-bold ml-1">Painel de Cadastro de Ocorrências</span>
          <button onClick={onClose} className="win-button h-4 w-4 flex items-center justify-center mr-1">
            <X size={12} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start">
            <label className="w-40">Descrição da Ocorrência:</label>
            <textarea 
              className="win-input flex-1 h-24"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            ></textarea>
          </div>
          <div className="flex items-center">
            <label className="w-40">Status:</label>
            <select 
              className="win-input flex-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Pendente</option>
              <option>Resolvido</option>
              <option>Em andamento</option>
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

export default PainelCadastroOcorrencias;
