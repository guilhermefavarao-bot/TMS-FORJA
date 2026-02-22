import React from 'react';
import { X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, RefreshCw } from 'lucide-react';

const mockData = [
  { id: 1, data: '01/01/2024 10:00', descricao: 'Anexo A carregado', usuario: 'admin' },
  { id: 2, data: '15/02/2024 14:30', descricao: 'Anexo B excluído', usuario: 'user1' },
];

const PainelHistoricoAnexos: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]">
      <div className="win-outset p-1 bg-[#C0C0C0] w-[800px] h-[500px] flex flex-col">
        <div className="win-title-bar flex items-center justify-between h-6">
          <span className="font-bold ml-1">Painel de Histórico de Anexos</span>
          <button onClick={onClose} className="win-button h-4 w-4 flex items-center justify-center mr-1">
            <X size={12} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto m-1 win-inset bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="win-grid-header">ID</th>
                <th className="win-grid-header">Data de Ocorrência</th>
                <th className="win-grid-header">Descrição da Ação</th>
                <th className="win-grid-header">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, idx) => (
                <tr key={row.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <td className="border-r border-b border-gray-300 p-1 text-right">{row.id}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.data}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.descricao}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.usuario}</td>
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
      </div>
    </div>
  );
};

export default PainelHistoricoAnexos;
