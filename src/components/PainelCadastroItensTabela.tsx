import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface PainelCadastroItensTabelaProps {
  onClose: () => void;
  onSave: (item: { origem: string; destino: string; peso: string; valor: string; status: string }) => void;
}

const PainelCadastroItensTabela: React.FC<PainelCadastroItensTabelaProps> = ({ onClose, onSave }) => {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [peso, setPeso] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState('Ativo');

  const handleSave = () => {
    if (!origem || !destino || !peso || !valor) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    onSave({ origem, destino, peso, valor, status });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="win-outset p-1 bg-[#C0C0C0] w-[600px] flex flex-col">
        <div className="win-title-bar flex items-center justify-between h-6">
          <span className="font-bold ml-1">Painel de Cadastro de Itens da Tabela</span>
          <button onClick={onClose} className="win-button h-4 w-4 flex items-center justify-center mr-1">
            <X size={12} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center">
            <label className="w-40">Origem:</label>
            <input type="text" className="win-input flex-1" value={origem} onChange={(e) => setOrigem(e.target.value)} />
          </div>
          <div className="flex items-center">
            <label className="w-40">Destino:</label>
            <input type="text" className="win-input flex-1" value={destino} onChange={(e) => setDestino(e.target.value)} />
          </div>
          <div className="flex items-center">
            <label className="w-40">Peso:</label>
            <input type="text" className="win-input flex-1" value={peso} onChange={(e) => setPeso(e.target.value)} />
          </div>
          <div className="flex items-center">
            <label className="w-40">Valor:</label>
            <input type="text" className="win-input flex-1" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
          <div className="flex items-center">
            <label className="w-40">Status:</label>
            <select className="win-input flex-1" value={status} onChange={(e) => setStatus(e.target.value)}>
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

export default PainelCadastroItensTabela;
