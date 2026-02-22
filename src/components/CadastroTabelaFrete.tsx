import React, { useState } from 'react';
import FiltroTabelaFrete from './FiltroTabelaFrete';
import PainelGestao from './PainelGestao';
import { Filter, FileText } from 'lucide-react';

interface ImportedFreightTable {
  id: string;
  embarcadorId: string;
  transportadoraId: string;
  filename: string;
  status: 'Validado' | 'Com Erros';
  data: any[]; // TableRowData[] from TabelaFreteImportacao
}

interface CadastroTabelaFreteProps {
  embarcadores: any[];
  transportadoras: any[];
  importedFreightTables: ImportedFreightTable[];
}

const CadastroTabelaFrete: React.FC<CadastroTabelaFreteProps> = ({ embarcadores, transportadoras, importedFreightTables }) => {
  const [isFiltroOpen, setIsFiltroOpen] = useState(false);
  const [isPainelOpen, setIsPainelOpen] = useState(false);
  const [selectedEmbarcadorId, setSelectedEmbarcadorId] = useState<string | null>(null);
  const [selectedTransportadoraId, setSelectedTransportadoraId] = useState<string | null>(null);
  const [filteredTables, setFilteredTables] = useState<ImportedFreightTable[]>([]);
  const [filterApplied, setFilterApplied] = useState(false);

  const handleFilterApply = (embarcadorId: string | null, transportadoraId: string | null) => {
    setSelectedEmbarcadorId(embarcadorId);
    setSelectedTransportadoraId(transportadoraId);

    const filtered = importedFreightTables.filter(table => {
      const matchesEmbarcador = embarcadorId ? table.embarcadorId === embarcadorId : true;
      const matchesTransportadora = transportadoraId ? table.transportadoraId === transportadoraId : true;
      return matchesEmbarcador && matchesTransportadora && table.status === 'Validado';
    });
    setFilteredTables(filtered);
    setFilterApplied(true);
    setIsFiltroOpen(false);
  };

  // Initial filter application or when importedFreightTables change
  // This effect runs only when importedFreightTables change, not on initial render for filterApplied
  React.useEffect(() => {
    // Only apply filter if one was already set, but don't set filterApplied to true
    if (selectedEmbarcadorId || selectedTransportadoraId) {
      const filtered = importedFreightTables.filter(table => {
        const matchesEmbarcador = selectedEmbarcadorId ? table.embarcadorId === selectedEmbarcadorId : true;
        const matchesTransportadora = selectedTransportadoraId ? table.transportadoraId === selectedTransportadoraId : true;
        return matchesEmbarcador && matchesTransportadora && table.status === 'Validado';
      });
      setFilteredTables(filtered);
    }
  }, [importedFreightTables, selectedEmbarcadorId, selectedTransportadoraId]);

  return (
    <div className="flex flex-col h-full bg-white win-inset p-2">
      <div className="flex justify-start mb-2 space-x-2">
        <button onClick={() => setIsFiltroOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5">
          <Filter size={14} />
          <span>Filtro</span>
        </button>
        <button onClick={() => setIsPainelOpen(true)} className="win-button flex items-center gap-1 px-2 py-0.5">
          <span>Painel de Gestão</span>
        </button>
      </div>
      <div className="flex-1 border-2 border-gray-400 win-outset p-2 overflow-auto">
        {filterApplied ? (
          <>
            <h3 className="font-bold mb-2">Tabelas de Frete Importadas (Status: Importado)</h3>
            {filteredTables.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="win-grid-header">ID</th>
                <th className="win-grid-header">Arquivo</th>
                <th className="win-grid-header">Embarcador</th>
                <th className="win-grid-header">Transportadora</th>
                <th className="win-grid-header">Status</th>
                <th className="win-grid-header">Qtd. Itens</th>
              </tr>
            </thead>
            <tbody>
              {filteredTables.map((table, idx) => (
                <tr key={table.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <td className="border-r border-b border-gray-300 p-1 text-right">{table.id.substring(0, 6)}</td>
                  <td className="border-r border-b border-gray-300 p-1 font-medium text-blue-800">{table.filename}</td>
                  <td className="border-r border-b border-gray-300 p-1">{embarcadores.find(e => e.id === table.embarcadorId)?.nome || table.embarcadorId}</td>
                  <td className="border-r border-b border-gray-300 p-1">{transportadoras.find(t => t.id === table.transportadoraId)?.nome || table.transportadoraId}</td>
                  <td className="border-r border-b border-gray-300 p-1 text-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 border border-black mx-auto" title="Importado"></div>
                  </td>
                  <td className="border-r border-b border-gray-300 p-1 text-right">{table.data.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center text-gray-500 italic">
            <FileText size={24} className="mx-auto text-gray-400 mb-2" />
            Nenhuma tabela importada encontrada para os filtros selecionados.
          </div>
        )}
          </>
        ) : (
          <div className="p-4 text-center text-gray-500 italic">
            <Filter size={24} className="mx-auto text-gray-400 mb-2" />
            Utilize o filtro para pesquisar tabelas de frete importadas.
          </div>
        )}
      </div>
      {isFiltroOpen && (
        <FiltroTabelaFrete 
          onClose={() => setIsFiltroOpen(false)} 
          embarcadores={embarcadores} 
          transportadoras={transportadoras} 
          onApplyFilter={handleFilterApply}
          initialEmbarcadorId={selectedEmbarcadorId}
          initialTransportadoraId={selectedTransportadoraId}
        />
      )}
      {isPainelOpen && <PainelGestao onClose={() => setIsPainelOpen(false)} />}
    </div>
  );
};

export default CadastroTabelaFrete;
