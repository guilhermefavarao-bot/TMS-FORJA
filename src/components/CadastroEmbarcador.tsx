import React, { useState } from 'react';
import { Save, Lock } from 'lucide-react';

const CadastroEmbarcador: React.FC<{ onBack: () => void; onSave: (data: any) => void; }> = ({ onBack, onSave }) => {
  const [cnpj, setCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [fantasia, setFantasia] = useState('');
  const [codigoEmpresa, setCodigoEmpresa] = useState('');
  const [status, setStatus] = useState('');
  const [numeroCertDigital, setNumeroCertDigital] = useState('');
  const [codigoTomador, setCodigoTomador] = useState('');
  const [informarEndereco, setInformarEndereco] = useState(false);
  const [cep, setCep] = useState('');
  const [uf, setUf] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [site, setSite] = useState('');
  const [mediaViagens, setMediaViagens] = useState('');
  const [fretePago, setFretePago] = useState('');
  const [regioesAtendidas, setRegioesAtendidas] = useState('');
  const [prazoPagamento, setPrazoPagamento] = useState('');
  const [particularidades, setParticularidades] = useState('');
  const handleSave = () => {
    const embarcadorData = {
      cnpj,
      nome,
      fantasia,
      codigoEmpresa,
      status: status || 'Ativo',
      numeroCertDigital,
      codigoTomador,
      informarEndereco,
      cep,
      uf,
      cidade,
      endereco,
      numero,
      bairro,
      complemento,
      telefone,
      site,
      mediaViagens,
      fretePago,
      regioesAtendidas,
      prazoPagamento,
      particularidades,
      id: Math.random().toString(36).substr(2, 9), // simple unique id
      chaveImplantacao: 'N/A',
    };
    onSave(embarcadorData);
  };

  return (
    <div className="flex flex-col h-full bg-[#C0C0C0] p-2 space-y-2">
      {/* --- Formulário Principal --- */}
      <div className="win-outset p-2 bg-[#C0C0C0] flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
          {/* Coluna 1 */}
          <div className="space-y-1">
            <div><label>CNPJ:</label><input type="text" className="win-input w-full" value={cnpj} onChange={e => setCnpj(e.target.value)} /></div>
            <div><label>Nome:</label><input type="text" className="win-input w-full" value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div><label>Fantasia:</label><input type="text" className="win-input w-full" value={fantasia} onChange={e => setFantasia(e.target.value)} /></div>
            <div><label>Código Empresa:</label><input type="text" className="win-input w-full" value={codigoEmpresa} onChange={e => setCodigoEmpresa(e.target.value)} /></div>
            <div><label>Status:</label><input type="text" className="win-input w-full" value={status} onChange={e => setStatus(e.target.value)} /></div>
            <div><label>Número Cert. Digital:</label><input type="text" className="win-input w-full" value={numeroCertDigital} onChange={e => setNumeroCertDigital(e.target.value)} /></div>
            <div><label>Código do Tomador:</label><input type="text" className="win-input w-full" value={codigoTomador} onChange={e => setCodigoTomador(e.target.value)} /></div>
          </div>




        </div>
      </div>



      {/* --- Botões de Ação --- */}
      <div className="flex justify-end items-center gap-2">
        <button className="win-button flex items-center gap-1 px-2 py-0.5" onClick={onBack}>
          <span>Voltar</span>
        </button>
        <button className="win-button flex items-center gap-1 px-2 py-0.5">
          <Lock size={14} />
          <span>Inativar Embarcador</span>
        </button>
        <button className="win-button flex items-center gap-1 px-2 py-0.5 font-bold" onClick={handleSave}>
          <Save size={14} />
          <span>Salvar</span>
        </button>
      </div>
    </div>
  );
};

export default CadastroEmbarcador;
