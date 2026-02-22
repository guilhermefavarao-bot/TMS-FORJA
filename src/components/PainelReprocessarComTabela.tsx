import React, { useState, useRef, useEffect } from 'react';
import { FileText, RefreshCcw, Upload, Search } from 'lucide-react';
import JSZip from 'jszip';

interface Embarcador {
  id: string;
  cnpj: string;
  nome: string;
  fantasia: string;
  cep: string;
  cidade: string;
  status: string;
  chaveImplantacao: string;
}

interface Transportadora {
  id: string;
  cnpj: string;
  nome: string;
  fantasia: string;
  cep: string;
  cidade: string;
  status: string;
  chaveImplantacao: string;
}

interface XMLRecord {
  id: string;
  filename: string;
  origemDestino: string;
  icms: number;
  pedagio: number;
  seguro: number;
  fretePeso: number;
  valorLiquido: number;
  totalCalculado: number;
  valueInformed: number;
  status: 'Conciliado' | 'Erro na Conciliação' | 'Aprovado' | 'Reprovado';
  selected?: boolean;
  observacao?: string;
  codigo?: string;
  soltransp?: string;
  embarcador?: string;
  transportadora?: string;
  embarcadorId?: string;
  transportadoraId?: string;
  chaves?: string[];
}

interface ImportedFreightTable {
  id: string;
  embarcadorId: string;
  transportadoraId: string;
  filename: string;
  status: 'Validado' | 'Com Erros';
  data: any[]; // TableRowData[] from TabelaFreteImportacao
}

interface PainelReprocessarComTabelaProps {
  importedFreightTables: ImportedFreightTable[];
  embarcadores: Embarcador[];
  transportadoras: Transportadora[];
  processXmlFile: (filename: string, text: string) => XMLRecord | null;
  formatBRL: (val: number) => string;
  renderStatusIcon: (status: string) => React.ReactNode;
}

export default function PainelReprocessarComTabela({
  importedFreightTables,
  embarcadores,
  transportadoras,
  processXmlFile,
  formatBRL,
  renderStatusIcon,
}: PainelReprocessarComTabelaProps) {
  const [tableIdToReconcile, setTableIdToReconcile] = useState('');
  const [records, setRecords] = useState<XMLRecord[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newRecords: XMLRecord[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      const record = processXmlFile(file.name, text);
      if (record) newRecords.push(record);
    }

    setRecords(prev => [...prev, ...newRecords]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newRecords: XMLRecord[] = [];
    const zip = new JSZip();

    try {
      const content = await zip.loadAsync(file);
      const xmlFiles = Object.values(content.files).filter(zipEntry => !zipEntry.dir && zipEntry.name.toLowerCase().endsWith('.xml'));

      for (const zipEntry of xmlFiles) {
        const text = await zipEntry.async('text');
        const record = processXmlFile(zipEntry.name, text);
        if (record) newRecords.push(record);
      }

      setRecords(prev => [...prev, ...newRecords]);
      alert(`${newRecords.length} arquivos XML processados do ZIP.`);
    } catch (error) {
      alert('Erro ao processar o arquivo ZIP. Certifique-se de que é um arquivo ZIP válido contendo XMLs.');
      console.error('Erro ao processar ZIP:', error);
    }

    if (zipFileInputRef.current) zipFileInputRef.current.value = '';
  };

  const handleReconcileWithTable = () => {
    if (!tableIdToReconcile) {
      alert('Por favor, insira o ID da tabela para conciliar.');
      return;
    }

    const targetTable = importedFreightTables.find(t => t.id.startsWith(tableIdToReconcile));
    if (!targetTable) {
      alert(`Tabela com ID '${tableIdToReconcile}' não encontrada.`);
      return;
    }

    const updatedRecords = records.map(xmlRecord => {
      // Check if Embarcador and Transportadora match
      const embarcadorMatch = xmlRecord.embarcadorId === targetTable.embarcadorId;
      const transportadoraMatch = xmlRecord.transportadoraId === targetTable.transportadoraId;

      if (!embarcadorMatch || !transportadoraMatch) {
        return { ...xmlRecord, status: 'Erro na Conciliação', observacao: 'Embarcador ou Transportadora diferentes da tabela.' };
      }

      // Find matching row in the imported table data
      const matchingTableRow = targetTable.data.find(tableRow => 
        tableRow['CÓDIGO'] === xmlRecord.codigo &&
        tableRow['ORIGEM'] === xmlRecord.origemDestino.split(' / ')[0] &&
        tableRow['DESTINO'] === xmlRecord.origemDestino.split(' / ')[1]
      );

      if (matchingTableRow) {
        const expectedAllIn = matchingTableRow['FRETE ALL IN'];
        const isMatch = Math.abs(xmlRecord.totalCalculado - expectedAllIn) < 0.01;
        return { 
          ...xmlRecord, 
          status: isMatch ? 'Conciliado' : 'Erro na Conciliação',
          observacao: isMatch ? 'Conciliado com tabela.' : `Divergência: Esperado ${formatBRL(expectedAllIn)}, Calculado ${formatBRL(xmlRecord.totalCalculado)}.`, 
          valueInformed: expectedAllIn // Update valueInformed with the table's value
        };
      } else {
        return { ...xmlRecord, status: 'Erro na Conciliação', observacao: 'Item não encontrado na tabela de frete.' };
      }
    });

    setRecords(updatedRecords);
    alert(`Conciliação com tabela '${targetTable.filename}' concluída.`);
  };

  const toggleSelection = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setRecords(prev => prev.map(r => ({ ...r, selected: checked })));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="win-outset p-2 mb-2 bg-[#C0C0C0]">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold">Arquivos XML:</label>
            <div className="flex gap-2">
              <input 
                type="file" 
                multiple 
                accept=".xml" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                className="win-button px-4 py-1 font-bold"
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar XMLs...
              </button>
              <input 
                type="file" 
                accept=".zip" 
                className="hidden" 
                ref={zipFileInputRef}
                onChange={handleZipUpload}
              />
              <button 
                className="win-button px-4 py-1 font-bold bg-blue-50"
                onClick={() => zipFileInputRef.current?.click()}
              >
                Importar ZIP...
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold">Reprocessar com Tabela de Frete (ID):</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="win-input px-2 py-1 w-32"
                placeholder="ID da Tabela"
                value={tableIdToReconcile}
                onChange={(e) => setTableIdToReconcile(e.target.value)}
              />
              <button 
                className="win-button px-4 py-1 font-bold bg-blue-50"
                onClick={handleReconcileWithTable}
              >
                Reprocessar com Tabela
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 win-inset bg-white overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="win-grid-header w-8">
                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
              </th>
              <th className="win-grid-header">Embarcador</th>
              <th className="win-grid-header">Transportadora</th>
              <th className="win-grid-header">Origem/Destino</th>
              <th className="win-grid-header">Código</th>
              <th className="win-grid-header">Total Calc.</th>
              <th className="win-grid-header">All In (Exp.)</th>
              <th className="win-grid-header w-32">Status</th>
              <th className="win-grid-header">Observação</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, idx) => (
              <tr 
                key={record.id} 
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer select-none`}
              >
                <td className="border-r border-b border-gray-300 px-1 text-center">
                   <input 
                    type="checkbox" 
                    checked={record.selected || false} 
                    onChange={() => toggleSelection(record.id)}
                  />
                </td>
                <td className="border-r border-b border-gray-300 px-2 font-medium">{record.embarcador}</td>
                <td className="border-r border-b border-gray-300 px-2 font-medium">{record.transportadora}</td>
                <td className="border-r border-b border-gray-300 px-2 font-medium">{record.origemDestino}</td>
                <td className="border-r border-b border-gray-300 px-2 font-bold text-blue-900">{record.codigo}</td>
                <td className="border-r border-b border-gray-300 px-2 text-right font-bold">{formatBRL(record.totalCalculado)}</td>
                <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.valueInformed)}</td>
                <td className="border-r border-b border-gray-300 px-2">
                  <div className="flex items-center gap-2">
                    {renderStatusIcon(record.status)}
                    <span className={record.status === 'Erro na Conciliação' ? 'text-red-700 font-bold' : ''}>{record.status}</span>
                  </div>
                </td>
                <td className="border-r border-b border-gray-300 px-2 italic text-gray-600">{record.observacao}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500 italic">Nenhum registro processado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
