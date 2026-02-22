import React, { useState } from 'react';
import { X, Plus, Pencil, Trash2, Copy, ClipboardPaste, Download, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, RefreshCw } from 'lucide-react';
import PainelCadastroItensTabela from './PainelCadastroItensTabela';
import PainelHistoricoItens from './PainelHistoricoItens';

const initialData = [
  { id: 1, origem: 'São Paulo', destino: 'Rio de Janeiro', peso: '100kg', valor: 'R$ 250,00', cadastro: '01/01/2024', status: 'Ativo' },
  { id: 2, origem: 'Belo Horizonte', destino: 'Vitória', peso: '50kg', valor: 'R$ 150,00', cadastro: '15/02/2024', status: 'Inativo' },
];

const PainelItensTabela: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [itens, setItens] = useState(initialData);
    const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);

  const handleSaveItem = (novoItem: { origem: string; destino: string; peso: string; valor: string; status: string }) => {
    const novaData = {
      ...novoItem,
      id: itens.length + 1,
      cadastro: new Date().toLocaleDateString('pt-BR'),
    };
    setItens([...itens, novaData]);
    setIsCadastroOpen(false);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="win-outset p-1 bg-[#C0C0C0] w-[950px] h-[650px] flex flex-col">
        <div className="win-title-bar flex items-center justify-between h-6">
          <span className="font-bold ml-1">Painel de Itens da Tabela</span>
          <button onClick={onClose} className="win-button h-4 w-4 flex items-center justify-center mr-1">
            <X size={12} />
          </button>
        </div>
        
        <div className="flex items-center gap-1 p-1 border-b border-[#808080]">
            <button onClick={() => setIsCadastroOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5"><Plus size={14} />Novo</button>
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><Pencil size={14} />Editar</button>
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><Trash2 size={14} />Excluir</button>
            <div className="w-[1px] h-4 bg-[#808080] mx-1" />
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><Copy size={14} />Copiar</button>
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><ClipboardPaste size={14} />Colar</button>
            <div className="w-[1px] h-4 bg-[#808080] mx-1" />
            <button className="win-button flex items-center gap-1 px-2 py-0.5"><Download size={14} />Exportar</button>
            <div className="w-[1px] h-4 bg-[#808080] mx-1" />
            <button onClick={() => setIsHistoricoOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5">Histórico</button>
        </div>

        <div className="flex-1 overflow-auto m-1 win-inset bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="win-grid-header">ID</th>
                <th className="win-grid-header">Origem</th>
                <th className="win-grid-header">Destino</th>
                <th className="win-grid-header">Peso</th>
                <th className="win-grid-header">Valor</th>
                <th className="win-grid-header">Data de Cadastro</th>
                <th className="win-grid-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((row, idx) => (
                <tr key={row.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <td className="border-r border-b border-gray-300 p-1 text-right">{row.id}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.origem}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.destino}</td>
                  <td className="border-r border-b border-gray-300 p-1">{row.peso}</td>
                  <td className="border-r border-b border-gray-300 p-1 text-right">{row.valor}</td>
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
          <div className="win-inset px-2">{itens.length} registro(s)</div>
        </div>
        {isCadastroOpen && <PainelCadastroItensTabela onClose={() => setIsCadastroOpen(false)} onSave={handleSaveItem} />}
        {isHistoricoOpen && <PainelHistoricoItens onClose={() => setIsHistoricoOpen(false)} />}
      </div>
    </div>
  );
};

export default PainelItensTabela;
