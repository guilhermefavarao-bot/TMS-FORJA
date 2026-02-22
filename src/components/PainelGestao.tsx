import React, { useState } from 'react';
import { X, Plus, Pencil, Trash2, Copy, ClipboardPaste, Download, History, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, RefreshCw } from 'lucide-react';
import PainelOcorrencias from './PainelOcorrencias';
import PainelItensTabela from './PainelItensTabela';
import PainelHistoricoOcorrencias from './PainelHistoricoOcorrencias';
import PainelAnexos from './PainelAnexos';
import PainelAprovadores from './PainelAprovadores';

const mockData = [
  { id: 1, embarcador: 'Embarcador A', transportadora: 'Transportadora X', tipo: 'Padrão', vigencia: '01/01/2024', cadastro: '31/12/2023', status: 'Ativa' },
  { id: 2, embarcador: 'Embarcador B', transportadora: 'Transportadora Y', tipo: 'Promocional', vigencia: '15/02/2024', cadastro: '10/02/2024', status: 'Inativa' },
];

const PainelGestao: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isOcorrenciasOpen, setIsOcorrenciasOpen] = useState(false);
    const [isItensOpen, setIsItensOpen] = useState(false);
    const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);
    const [isAnexosOpen, setIsAnexosOpen] = useState(false);
  const [isAprovadoresOpen, setIsAprovadoresOpen] = useState(false);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="win-outset p-1 bg-[#C0C0C0] w-[900px] h-[600px] flex flex-col">
        <div className="win-title-bar flex items-center justify-between h-6">
          <span className="font-bold ml-1">Painel de Gestão de Tabelas de Frete</span>
          <button onClick={onClose} className="win-button h-4 w-4 flex items-center justify-center mr-1">
            <X size={12} />
          </button>
        </div>
        
        <div className="flex items-center gap-1 p-1 border-b border-[#808080]">
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><Plus size={14} />Novo</button>
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><Pencil size={14} />Editar</button>
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><Trash2 size={14} />Excluir</button>
            <div className="w-[1px] h-4 bg-[#808080] mx-1" />
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><Copy size={14} />Copiar</button>
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><ClipboardPaste size={14} />Colar</button>
            <div className="w-[1px] h-4 bg-[#808080] mx-1" />
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><Download size={14} />Exportar</button>
            <button onClick={() => setIsHistoricoOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5"><History size={14} />Histórico</button>
            <button onClick={() => setIsOcorrenciasOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5">Painel de Ocorrências</button>
            <button onClick={() => setIsItensOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5">Painel de Itens da Tabela</button>
            <button onClick={() => setIsAnexosOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5">Painel de Anexos</button>
            <button onClick={() => setIsAprovadoresOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5">Painel de Aprovadores</button>
        </div>

        <div className="flex-1 overflow-auto m-1 win-inset bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="win-grid-header">ID</th>
                <th className="win-grid-header">Embarcador</th>
                <th className="win-grid-header">Transportadora</th>
                <th className="win-grid-header">Tipo de Tabela</th>
                <th className="win-grid-header">Data de Vigência</th>
                <th className="win-grid-header">Data de Cadastro</th>
                <th className="win-grid-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, idx) => (
                <tr key={row.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <td className="border-r border-b border-gray-300 p-1 text-right">{row.id}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.embarcador}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.transportadora}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.tipo}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.vigencia}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.cadastro}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="h-8 flex items-center justify-between px-2 border-t bg-[#C0C0C0] win-outset m-1">
          <div className="flex items-center gap-2">
            <button className="win-button p-0.5"><ChevronsLeft size={14} /></button>
            <button className="win-button p-0.5"><ChevronLeft size={14} /></button>
            <span className="px-1">Página</span>
            <input type="text" defaultValue="1" className="win-input w-10 text-center" />
            <span>de 1</span>
            <button className="win-button p-0.5"><ChevronRight size={14} /></button>
            <button className="win-button p-0.5"><ChevronsRight size={14} /></button>
            <div className="w-[1px] h-4 bg-[#808080] mx-1" />
            <button className="win-button p-0.5"><RefreshCw size={14} /></button>
          </div>
          <div className="win-inset px-2">{mockData.length} registro(s)</div>
        </div>
        {isOcorrenciasOpen && <PainelOcorrencias onClose={() => setIsOcorrenciasOpen(false)} />}
        {isItensOpen && <PainelItensTabela onClose={() => setIsItensOpen(false)} />}
        {isHistoricoOpen && <PainelHistoricoOcorrencias onClose={() => setIsHistoricoOpen(false)} />}
        {isAnexosOpen && <PainelAnexos onClose={() => setIsAnexosOpen(false)} />}
        {isAprovadoresOpen && <PainelAprovadores onClose={() => setIsAprovadoresOpen(false)} />}
      </div>
    </div>
  );
};

export default PainelGestao;
