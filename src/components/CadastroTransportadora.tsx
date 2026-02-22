import React, { useState } from 'react';
import { Save, Lock } from 'lucide-react';

const CadastroTransportadora: React.FC<{ onBack: () => void; onSave: (data: any) => void; }> = ({ onBack, onSave }) => {
  const [cnpj, setCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [fantasia, setFantasia] = useState('');
  const [codigo, setCodigo] = useState('');
  const [informarEndereco, setInformarEndereco] = useState(true);
  const [cep, setCep] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
    const handleSave = () => {
    const transportadoraData = {
      cnpj,
      nome,
      fantasia,
      codigo,
      informarEndereco,
      cep,
      estado,
      cidade,
      endereco,
      numero,
      bairro,
      complemento,
      id: Math.random().toString(36).substr(2, 9), // simple unique id
      status: 'Ativo',
      chaveImplantacao: 'N/A',
    };
    onSave(transportadoraData);
  };

  return (
    <div className="flex flex-col h-full bg-[#C0C0C0] p-2 space-y-2">
      <div className="win-outset p-4 bg-[#C0C0C0] flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {/* Coluna 1 */}
          <div className="space-y-2">
            <div><label>CNPJ:</label><input type="text" className="win-input w-full" value={cnpj} onChange={e => setCnpj(e.target.value)} /></div>
            <div><label>Nome:</label><input type="text" className="win-input w-full" value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div><label>Fantasia:</label><input type="text" className="win-input w-full" value={fantasia} onChange={e => setFantasia(e.target.value)} /></div>
            <div><label>Código da Transportadora:</label><input type="text" className="win-input w-full" value={codigo} onChange={e => setCodigo(e.target.value)} /></div>
            <div className="pt-2">
              <div className="flex items-center"><input type="checkbox" id="info-addr" checked={informarEndereco} onChange={e => setInformarEndereco(e.target.checked)} /><label htmlFor="info-addr" className="ml-2">Informar Endereço</label></div>
            </div>
            {informarEndereco && (
              <>
                <div><label>CEP:</label><input type="text" className="win-input w-full" value={cep} onChange={e => setCep(e.target.value)} /></div>
                <div><label>Estado:</label><select className="win-input w-full" value={estado} onChange={e => setEstado(e.target.value)}></select></div>
                <div><label>Cidade:</label><select className="win-input w-full" value={cidade} onChange={e => setCidade(e.target.value)}></select></div>
                <div><label>Endereço:</label><input type="text" className="win-input w-full" value={endereco} onChange={e => setEndereco(e.target.value)} /></div>
                <div className="grid grid-cols-3 gap-x-2">
                  <div className="col-span-1"><label>Número:</label><input type="text" className="win-input w-full" value={numero} onChange={e => setNumero(e.target.value)} /></div>
                </div>
                <div><label>Bairro:</label><input type="text" className="win-input w-full" value={bairro} onChange={e => setBairro(e.target.value)} /></div>
                <div><label>Complemento:</label><input type="text" className="win-input w-full" value={complemento} onChange={e => setComplemento(e.target.value)} /></div>
              </>
            )}
          </div>

          {/* Coluna 2 - Vazia por enquanto, para manter o layout */}
          <div></div>
        </div>
      </div>

      {/* --- Botões de Ação --- */}
      <div className="flex justify-end items-center gap-2">
         <button className="win-button flex items-center gap-1 px-2 py-0.5" onClick={onBack}>
          <span>Voltar</span>
        </button>
        <button className="win-button flex items-center gap-1 px-2 py-0.5">
          <Lock size={14} />
          <span>Inativar Transportadora</span>
        </button>
        <button className="win-button flex items-center gap-1 px-2 py-0.5 font-bold" onClick={handleSave}>
          <Save size={14} />
          <span>Salvar</span>
        </button>
      </div>
    </div>
  );
};

export default CadastroTransportadora;
