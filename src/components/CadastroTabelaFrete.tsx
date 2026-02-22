import React, { useState } from 'react';
import FiltroTabelaFrete from './FiltroTabelaFrete';
import PainelGestao from './PainelGestao';
import { Filter } from 'lucide-react';

interface CadastroTabelaFreteProps {
  embarcadores: any[];
  transportadoras: any[];
}

const CadastroTabelaFrete: React.FC<CadastroTabelaFreteProps> = ({ embarcadores, transportadoras }) => {
  const [isFiltroOpen, setIsFiltroOpen] = useState(false);
  const [isPainelOpen, setIsPainelOpen] = useState(false);

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
      <div className="flex-1 border-2 border-gray-400 win-outset p-2">
        {/* O conteúdo principal da aba será adicionado aqui */}
        <p className="text-center">Conteúdo da aba Cadastro Tabela Frete</p>
      </div>
      {isFiltroOpen && <FiltroTabelaFrete onClose={() => setIsFiltroOpen(false)} embarcadores={embarcadores} transportadoras={transportadoras} />}
      {isPainelOpen && <PainelGestao onClose={() => setIsPainelOpen(false)} />}
    </div>
  );
};

export default CadastroTabelaFrete;
