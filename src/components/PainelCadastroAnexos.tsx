import React, { useState, useRef } from 'react';
import { X, Save, Upload } from 'lucide-react';

interface PainelCadastroAnexosProps {
  onClose: () => void;
  onSave: (anexo: { nomeArquivo: string; usuario: string }) => void;
}

const PainelCadastroAnexos: React.FC<PainelCadastroAnexosProps> = ({ onClose, onSave }) => {
  const [nomeArquivo, setNomeArquivo] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNomeArquivo(file.name);
    }
  };

  const handleSave = () => {
    if (!nomeArquivo) {
      alert('Por favor, selecione um arquivo.');
      return;
    }
    // O nome de usuário seria obtido de um sistema de autenticação em um app real
    onSave({ nomeArquivo, usuario: 'admin' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]">
      <div className="win-outset p-1 bg-[#C0C0C0] w-[600px] flex flex-col">
        <div className="win-title-bar flex items-center justify-between h-6">
          <span className="font-bold ml-1">Painel de Cadastro de Anexos</span>
          <button onClick={onClose} className="win-button h-4 w-4 flex items-center justify-center mr-1">
            <X size={12} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center">
            <label className="w-40">Selecionar Arquivo:</label>
            <div className="flex-1 flex items-center">
                <input type="text" readOnly className="win-input flex-1" value={nomeArquivo} placeholder="Nenhum arquivo selecionado" />
                <button onClick={() => fileInputRef.current?.click()} className="win-button ml-2 p-1">
                    <Upload size={16} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
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

export default PainelCadastroAnexos;
