import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Filter, Upload, FileUp, Download } from 'lucide-react';

interface TableRowData {
  'ID EMBARC': string;
  'ID TRANSPORT': string;
  'CÓDIGO': string;
  'SOLTRANSP': string;
  'ORIGEM': string;
  'DESTINO': string;
  'ICMS': number;
  'PEDÁGIOS': number;
  'SEGURO': number;
  'FRETE PESO': number;
  'FRETE ALL IN': number;
}

interface ImportRecord {
  id: number;
  status: 'Pendente' | 'Validado' | 'Com Erros' | 'Processado';
  dataImportacao: string;
  arquivo: string;
  usuario: string;
  dataValidacao: string;
  dataProcessamento: string;
  qtdeImportados: number;
  qtdeErros: number;
  qtdeTotal: number;
  data?: TableRowData[]; // Store the parsed data
  validationErrors?: string[]; // Store validation errors
}

interface TabelaFreteImportacaoProps {
  onImportSuccess: (data: TableRowData[], embarcadorId: string, transportadoraId: string, filename: string, status: 'Validado' | 'Com Erros') => void;
}

const TabelaFreteImportacao: React.FC<TabelaFreteImportacaoProps> = ({ onImportSuccess }) => {
  const [records, setRecords] = useState<ImportRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportExcelTemplate = () => {
    const headers = [['ID EMBARC', 'ID TRANSPORT', 'CÓDIGO', 'SOLTRANSP', 'ORIGEM', 'DESTINO', 'ICMS', 'PEDÁGIOS', 'SEGURO', 'FRETE PESO', 'FRETE ALL IN']];
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo");
    XLSX.writeFile(workbook, "Modelo_Tabela_Frete.xlsx");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: TableRowData[] = XLSX.utils.sheet_to_json(worksheet);

      const now = new Date();
      let qtdeErros = 0;
      const validationErrors: string[] = [];

      // Basic validation: check if essential columns are filled
      const requiredColumns: (keyof TableRowData)[] = ['ID EMBARC', 'ID TRANSPORT', 'CÓDIGO', 'ORIGEM', 'DESTINO', 'FRETE ALL IN'];
      const validatedData = json.filter((row, index) => {
        let isValidRow = true;
        for (const col of requiredColumns) {
          if (!row[col] || String(row[col]).trim() === '') {
            isValidRow = false;
            validationErrors.push(`Linha ${index + 2}: Coluna '${col}' está vazia.`);
            break;
          }
        }
        if (!isValidRow) qtdeErros++;
        return isValidRow;
      });

      const status: 'Validado' | 'Com Erros' = qtdeErros === 0 ? 'Validado' : 'Com Erros';

      const newRecord: ImportRecord = {
        id: Date.now(),
        status: status,
        dataImportacao: now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        arquivo: file.name,
        usuario: 'user1', // Placeholder, replace with actual user logic
        dataValidacao: now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        dataProcessamento: '',
        qtdeImportados: validatedData.length,
        qtdeErros: qtdeErros,
        qtdeTotal: json.length,
        data: validatedData,
        validationErrors: validationErrors,
      };
      setRecords(prevRecords => [newRecord, ...prevRecords]);

      if (status === 'Validado') {
        // Assuming all rows in validatedData have the same embarcadorId and transportadoraId
        const embarcadorId = validatedData[0]?.['ID EMBARC'];
        const transportadoraId = validatedData[0]?.['ID TRANSPORT'];
        if (embarcadorId && transportadoraId) {
          onImportSuccess(validatedData, embarcadorId, transportadoraId, file.name, status);
        } else {
          alert('Erro: ID EMBARC ou ID TRANSPORT não encontrados na primeira linha da tabela.');
        }
      } else {
        alert(`Arquivo ${file.name} importado com ${qtdeErros} erros de validação.`);
      }
    };
    reader.readAsBinaryString(file);

    // Reset file input to allow selecting the same file again
    if(event.target) {
      event.target.value = '';
    }
  };

  const renderStatus = (status: 'Pendente' | 'Validado' | 'Com Erros' | 'Processado') => {
    switch (status) {
      case 'Validado':
        return <div className="w-3 h-3 rounded-full bg-green-500 border border-black mx-auto" title="Validado"></div>;
      case 'Com Erros':
        return <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black mx-auto" title="Com Erros"></div>;
      case 'Processado':
        return <div className="w-3 h-3 rounded-full bg-blue-500 border border-black mx-auto" title="Processado"></div>;
      case 'Pendente':
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400 border border-black mx-auto" title="Pendente"></div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
       <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
        accept=".xlsx, .xls"
      />
      <div className="win-outset p-1 mb-2 bg-[#C0C0C0] flex items-center justify-between">
        <button className="win-button flex items-center gap-1 px-2 py-0.5">
          <Filter size={14} />
          <span>Filtros</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleImportClick} className="win-button flex items-center gap-1 px-2 py-0.5">
            <Upload size={14} className="text-green-700" />
            <span>Importar Tabela Frete</span>
          </button>
          <button className="win-button flex items-center gap-1 px-2 py-0.5">
            <FileUp size={14} className="text-blue-700" />
            <span>Importar Tabela Frete (Lote)</span>
          </button>
          <div className="w-[1px] h-4 bg-[#808080] mx-1" />
          <button onClick={exportExcelTemplate} className="win-button flex items-center gap-1 px-2 py-0.5">
            <Download size={14} className="text-blue-800" />
            <span>Exportar Modelo</span>
          </button>
        </div>
      </div>
      <div className="flex-1 win-inset bg-white overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="win-grid-header w-12">Status</th>
              <th className="win-grid-header">Data Importação</th>
              <th className="win-grid-header">Arquivo</th>
              <th className="win-grid-header">Usuário</th>
              <th className="win-grid-header">Data Validação</th>
              <th className="win-grid-header">Data Processamento</th>
              <th className="win-grid-header">Qtd. Importados</th>
              <th className="win-grid-header">Qtd. com Erros</th>
              <th className="win-grid-header">Qtd. Total</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={rec.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <td className="border-r border-b border-gray-300 p-1 text-center">{renderStatus(rec.status)}</td>
                <td className="border-r border-b border-gray-300 px-2">{rec.dataImportacao}</td>
                <td className="border-r border-b border-gray-300 px-2 font-medium text-blue-800">{rec.arquivo}</td>
                <td className="border-r border-b border-gray-300 px-2">{rec.usuario}</td>
                <td className="border-r border-b border-gray-300 px-2">{rec.dataValidacao}</td>
                <td className="border-r border-b border-gray-300 px-2">{rec.dataProcessamento}</td>
                <td className="border-r border-b border-gray-300 px-2 text-right font-bold text-green-700">{rec.qtdeImportados}</td>
                <td className="border-r border-b border-gray-300 px-2 text-right font-bold text-red-700">{rec.qtdeErros}</td>
                <td className="border-r border-b border-gray-300 px-2 text-right font-bold">{rec.qtdeTotal}</td>
              </tr>
            ))}
             {records.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500 italic">Nenhuma tabela importada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaFreteImportacao;
