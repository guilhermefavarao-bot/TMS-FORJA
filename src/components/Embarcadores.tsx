import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Plus
} from 'lucide-react';
import CadastroEmbarcador from './CadastroEmbarcador';
import useLocalStorage from '../hooks/useLocalStorage';

interface Embarcador {
  id: number;
  cnpj: string;
  nome: string;
  fantasia: string;
  cep: string;
  cidade: string;
  status: 'Ativa' | 'Inativa';
  statusImplantacao: 'Implantado' | 'Pendente';
  chaveImplantacao: string;
}

interface EmbarcadoresProps {
  setActiveTab: (tab: string) => void;
  embarcadores: Embarcador[];
  setEmbarcadores: (embarcadores: Embarcador[]) => void;
}

const Embarcadores: React.FC<EmbarcadoresProps> = ({ setActiveTab, embarcadores, setEmbarcadores }) => {
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const totalRecords = embarcadores.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmbarcadores = embarcadores.slice(indexOfFirstItem, indexOfLastItem);

  const firstRecordOnPage = totalRecords > 0 ? indexOfFirstItem + 1 : 0;
  const lastRecordOnPage = Math.min(indexOfLastItem, totalRecords);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isCadastroOpen) {
    return <CadastroEmbarcador 
      onBack={() => setIsCadastroOpen(false)} 
      onSave={(newEmbarcador) => {
        setEmbarcadores(prev => [...prev, newEmbarcador]);
        setIsCadastroOpen(false);
        setActiveTab('Transportadora');
      }}
    />;
  }

  return (
    <div className="flex flex-col h-full bg-white win-inset">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="win-grid-header">EmbarcadorId</th>
              <th className="win-grid-header">CNPJ</th>
              <th className="win-grid-header">Nome</th>
              <th className="win-grid-header">Fantasia</th>
              <th className="win-grid-header">CEP</th>
              <th className="win-grid-header">Cidade</th>
              <th className="win-grid-header">Status</th>
              <th className="win-grid-header">Status Implantação</th>
              <th className="win-grid-header">Chave Implantação</th>
            </tr>
          </thead>
          <tbody>
            {currentEmbarcadores.map((e, idx) => (
              <tr key={e.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <td className="border-r border-b border-gray-300 p-1 text-right">{e.id}</td>
                <td className="border-r border-b border-gray-300 p-1">{e.cnpj}</td>
                <td className="border-r border-b border-gray-300 p-1">{e.nome}</td>
                <td className="border-r border-b border-gray-300 p-1">{e.fantasia}</td>
                <td className="border-r border-b border-gray-300 p-1">{e.cep}</td>
                <td className="border-r border-b border-gray-300 p-1">{e.cidade}</td>
                <td className="border-r border-b border-gray-300 p-1">{e.status}</td>
                <td className="border-r border-b border-gray-300 p-1">{e.statusImplantacao}</td>
                <td className="border-r border-b border-gray-300 p-1 font-mono text-xs">{e.chaveImplantacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-8 flex items-center justify-between px-2 border-t bg-[#C0C0C0] win-outset">
        <div className="flex items-center gap-2">
          <button onClick={() => handlePageChange(1)} disabled={currentPage === 1 || totalRecords === 0} className="win-button p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsLeft size={14} /></button>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || totalRecords === 0} className="win-button p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
          <span className="px-1">Página</span>
          <input 
            type="text" 
            value={currentPage} 
            onChange={(e) => {
              const page = Number(e.target.value);
              if (!isNaN(page)) {
                handlePageChange(page);
              }
            }}
            className="win-input w-10 text-center"
            disabled={totalRecords === 0}
          />
          <span>de {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalRecords === 0} className="win-button p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
          <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalRecords === 0} className="win-button p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsRight size={14} /></button>
          <div className="w-[1px] h-4 bg-[#808080] mx-1" />
          <button className="win-button p-0.5"><RefreshCw size={14} /></button>
        </div>
        <div className="win-inset px-2">{firstRecordOnPage} à {lastRecordOnPage} de {totalRecords} registro(s)</div>
        <div className="flex items-center">
           <button onClick={() => setIsCadastroOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5">
            <Plus size={14} />
            <span>Cadastrar Embarcador</span>
          </button>
          <input type="text" placeholder="Insira a sua busca aqui" className="win-input w-48 ml-2" />
          <button className="win-button ml-1 px-4">Procurar</button>
        </div>
      </div>
    </div>
  );
};

export default Embarcadores;
