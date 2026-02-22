import React from 'react';
import { X, Search, Filter } from 'lucide-react';

interface FiltroTabelaFreteProps {
  onClose: () => void;
  embarcadores: any[];
  transportadoras: any[];
  onApplyFilter: (embarcadorId: string | null, transportadoraId: string | null) => void;
  initialEmbarcadorId: string | null;
  initialTransportadoraId: string | null;
}

const FiltroTabelaFrete: React.FC<FiltroTabelaFreteProps> = ({ onClose, embarcadores, transportadoras, onApplyFilter, initialEmbarcadorId, initialTransportadoraId }) => {
  const [selectedEmbarcador, setSelectedEmbarcador] = React.useState<string | null>(initialEmbarcadorId);
  const [selectedTransportadora, setSelectedTransportadora] = React.useState<string | null>(initialTransportadoraId);

  React.useEffect(() => {
    setSelectedEmbarcador(initialEmbarcadorId);
    setSelectedTransportadora(initialTransportadoraId);
  }, [initialEmbarcadorId, initialTransportadoraId]);

  const handleApplyClick = () => {
    onApplyFilter(selectedEmbarcador, selectedTransportadora);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="win-outset p-1 bg-[#C0C0C0] w-[500px]">
        <div className="win-title-bar flex items-center justify-between h-6">
          <span className="font-bold ml-1">Preencha o filtro</span>
          <button onClick={onClose} className="win-button h-4 w-4 flex items-center justify-center mr-1">
            <X size={12} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center">
            <label className="w-32">Embarcador:</label>
            <select 
              className="win-input flex-1"
              value={selectedEmbarcador || ''}
              onChange={(e) => setSelectedEmbarcador(e.target.value || null)}
            >
              <option value="">Selecione</option>
              {embarcadores.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <label className="w-32">Transportadora:</label>
            <select 
              className="win-input flex-1"
              value={selectedTransportadora || ''}
              onChange={(e) => setSelectedTransportadora(e.target.value || null)}
            >
              <option value="">Selecione</option>
              {transportadoras.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <label className="w-32">Origem:</label>
            <select className="win-input w-24"></select>
            <select className="win-input flex-1 ml-2"></select>
          </div>
          <div className="flex items-center">
            <label className="w-32">Data Vigência:</label>
            <input type="text" className="win-input flex-1" />
            <span className="mx-2">até</span>
            <input type="text" className="win-input flex-1" />
          </div>
          <div className="flex items-center">
            <label className="w-32">Status:</label>
            <select className="win-input flex-1"></select>
          </div>
          <div className="flex items-center">
            <label className="w-32">Filtro por Parâmetros:</label>
            <select className="win-input flex-1"></select>
          </div>
        </div>
        <div className="flex justify-between items-center p-2 border-t border-gray-400">
            <button onClick={handleApplyClick} className="win-button p-1 flex items-center gap-1">
                <Filter size={18} />
                <span>Aplicar Filtro</span>
            </button>
            <div className="flex items-center gap-2">
                <button className="win-button p-1">
                    <Search size={18} />
                </button>
                <button className="win-button p-1">
                    <span className="text-red-500 font-bold">?</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FiltroTabelaFrete;
