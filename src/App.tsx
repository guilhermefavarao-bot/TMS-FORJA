/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { 
  FileText, 
  RefreshCcw, 
  CheckSquare, 
  BarChart2, 
  Plus, 
  Trash2, 
  Download, 
  Search,
  ChevronDown,
  Folder,
  Filter,
  Upload,
  FileUp,
  Users,
  Truck
} from 'lucide-react';

import TabelaFreteImportacao from './components/TabelaFreteImportacao';
import Embarcadores from './components/Embarcadores';
import CadastroTabelaFrete from './components/CadastroTabelaFrete';
import Transportadora from './components/Transportadora';
import useLocalStorage from './hooks/useLocalStorage';

// --- Types ---

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

// --- Components ---

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('reprocessar');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabelaFreteOpen, setTabelaFreteOpen] = useState(true);
  const [backofficeOpen, setBackofficeOpen] = useState(true);
  const [records, setRecords] = useState<XMLRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [detailRecord, setDetailRecord] = useState<XMLRecord | null>(null);
  const [modalComment, setModalComment] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [memoryMap, setMemoryMap] = useState<Record<string, number>>({});
  const [sidebarSearch, setSidebarSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memoryInputRef = useRef<HTMLInputElement>(null);
  const zipFileInputRef = useRef<HTMLInputElement>(null);

  const [embarcadores, setEmbarcadores] = useLocalStorage<Embarcador[]>('embarcadores', []);
  const [transportadoras, setTransportadoras] = useLocalStorage<Transportadora[]>('transportadoras', []);
  const [importedFreightTables, setImportedFreightTables] = useLocalStorage<ImportedFreightTable[]>('importedFreightTables', []);

  // --- Logic ---

  const parseNumeric = (val: any): number => {
    if (typeof val === 'number') return val;
    if (val === undefined || val === null || val === '') return 0;
    let s = String(val).trim().replace(/[R$\s]/g, '');
    if (!s) return 0;

    // Find all separators (dots and commas)
    const separators = s.match(/[.,]/g);
    if (!separators) return parseFloat(s) || 0;

    // If there's only one type of separator and it appears multiple times, 
    // they are definitely thousands separators (e.g., 1.000.000)
    if (separators.every(sep => sep === separators[0]) && separators.length > 1) {
      return parseFloat(s.replace(/[.,]/g, '')) || 0;
    }

    // Identify the last separator - this is most likely the decimal separator
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    const lastIndex = Math.max(lastDot, lastComma);

    // The part before the last separator is the integer part (remove any thousands separators)
    // The part after is the decimal part
    const integerPart = s.substring(0, lastIndex).replace(/[.,]/g, '');
    const decimalPart = s.substring(lastIndex + 1);

    // Special case: if the "decimal" part has exactly 3 digits and there are no other separators,
    // it's ambiguous (could be 3.331 or 3,331). 
    // However, for freight values, we usually expect 2 decimal places.
    // If it's 3 digits, and it's the only separator, let's assume it's a thousands separator
    // if the value is common in that range.
    if (separators.length === 1 && decimalPart.length === 3 && integerPart.length > 0 && integerPart.length <= 3) {
       // e.g., "3.331" -> 3331
       return parseFloat(integerPart + decimalPart);
    }

    const result = parseFloat(integerPart + '.' + decimalPart);
    return isNaN(result) ? 0 : result;
  };

  const handleMemoryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      // Use raw: false to get formatted strings from Excel, which is safer for our parser
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];

      const newMap: Record<string, number> = {};
      json.slice(1).forEach(row => {
        const code = String(row[1] || '').trim();
        const allIn = parseNumeric(row[11] !== undefined ? row[11] : row[5]);
        if (code && !isNaN(allIn)) {
          newMap[code] = allIn;
        }
      });

      setMemoryMap(newMap);
      alert(`${Object.keys(newMap).length} registros carregados da Memória de Cálculo.`);
    };
    reader.readAsBinaryString(file);
    if (memoryInputRef.current) memoryInputRef.current.value = '';
  };

  const processXmlFile = (filename: string, text: string): XMLRecord | null => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    const getCompValue = (name: string) => {
      const comps = xmlDoc.getElementsByTagNameNS("*", 'Comp');
      for (let j = 0; j < comps.length; j++) {
        const xNomeNode = comps[j].getElementsByTagNameNS("*", 'xNome')[0];
        const xNome = xNomeNode?.textContent?.trim().toUpperCase();
        if (xNome === name.toUpperCase()) {
          const vCompNode = comps[j].getElementsByTagNameNS("*", 'vComp')[0];
          return parseNumeric(vCompNode?.textContent);
        }
      }
      return 0;
    };

    // Extract components
    const icms = getCompValue('ICMS') || parseNumeric(xmlDoc.getElementsByTagNameNS("*", 'vICMS')[0]?.textContent);
    const pedagio = getCompValue('PEDAGIO');
    const seguro = getCompValue('GRIS') || getCompValue('SEGURO');
    const fretePeso = getCompValue('FRETE');

    // Extract Origin and Destination
    const xMunIni = xmlDoc.getElementsByTagNameNS("*", 'xMunIni')[0]?.textContent || '';
    const xMunFim = xmlDoc.getElementsByTagNameNS("*", 'xMunFim')[0]?.textContent || '';
    const origemDestino = `${xMunIni} / ${xMunFim}`.trim();

    // Extract Embarcador (Remetente)
    const embarcador = xmlDoc.getElementsByTagNameNS("*", 'rem')[0]?.getElementsByTagNameNS("*", 'xNome')[0]?.textContent || '';

    // Extract NF-e Keys
    const chaves: string[] = [];
    const infNFeNodes = xmlDoc.getElementsByTagNameNS("*", 'infNFe');
    for (let i = 0; i < infNFeNodes.length; i++) {
      const chave = infNFeNodes[i].getElementsByTagNameNS("*", 'chave')[0]?.textContent;
      if (chave) chaves.push(chave);
    }
    
    // Calculation: Use vBC tag for reconciliation
    const vBCNode = xmlDoc.getElementsByTagNameNS("*", 'vBC')[0];
    const totalCalculado = vBCNode ? parseNumeric(vBCNode.textContent) : (icms + pedagio + seguro + fretePeso);
    const valorLiquido = totalCalculado - icms;

    // Try to find the code in xObs to match with memory map
    const xObs = xmlDoc.getElementsByTagNameNS("*", 'xObs')[0]?.textContent || '';
    
    // Extract SOLTRANSP (Universal regex to handle spaces, hyphens, etc.)
    // Matches: SOLTRANSP-2026-00231, SOLTRANSP - 2026-00231, SOLTRANSP 2026 00231, etc.
    const solMatch = xObs.match(/SOLTRANSP\s*[- ]*\s*[0-9]{4}\s*[- ]*\s*[0-9]+/i);
    const soltransp = solMatch ? solMatch[0].trim().toUpperCase() : '';

    // Extract Código (10-digit sequence)
    const codeMatch = xObs.match(/\d{10}/);
    const codigo = codeMatch ? codeMatch[0] : '';
    
    const informed = memoryMap[codigo] || 0;

    // Rule: If sum matches informed -> Conciliado
    const isMatch = Math.abs(totalCalculado - informed) < 0.01;
    const status = isMatch ? 'Conciliado' : 'Erro na Conciliação';

    return {
      id: Math.random().toString(36).substr(2, 9),
      filename,
      origemDestino,
      icms,
      pedagio,
      seguro,
      fretePeso,
      valorLiquido,
      totalCalculado,
      valueInformed: informed,
      status: status,
      selected: false,
      codigo,
      soltransp,
      embarcador,
      chaves
    };
  };

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

  const handleImportSuccess = (data: any[], embarcadorId: string, transportadoraId: string, filename: string, status: 'Validado' | 'Com Erros') => {
    const newImportedTable: ImportedFreightTable = {
      id: Math.random().toString(36).substr(2, 9),
      embarcadorId,
      transportadoraId,
      filename,
      status,
      data,
    };
    setImportedFreightTables(prev => [...prev, newImportedTable]);
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

  const openAbonoModal = (id: string) => {
    const record = records.find(r => r.id === id);
    setSelectedRecordId(id);
    setModalComment(record?.observacao || '');
    setModalOpen(true);
  };

  const openDetailModal = (record: XMLRecord) => {
    setDetailRecord(record);
    setDetailModalOpen(true);
  };

  const exportToExcel = (data: XMLRecord[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(r => ({
      'Embarcador': r.embarcador,
      'Origem/Destino': r.origemDestino,
      'Arquivo': r.filename,
      'Código': r.codigo || '',
      'SOLTRANSP': r.soltransp || '',
      'Chaves NF-e (9d)': r.chaves?.map(c => c.substring(25, 34)).join(', ') || '',
      'ICMS': r.icms,
      'Pedágio': r.pedagio,
      'Seguro': r.seguro,
      'Frete Peso': r.fretePeso,
      'Vlr Líquido (s/ ICMS)': r.valorLiquido,
      'Total Calculado': r.totalCalculado,
      'Valor Esperado': r.valueInformed,
      'Status': r.status,
      'Observação': r.observacao || ''
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoria");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleAbonoAction = (action: 'Aprovado' | 'Reprovado') => {
    if (!selectedRecordId) return;
    
    const updatedRecords = records.map(r => 
      r.id === selectedRecordId ? { ...r, status: action, observacao: modalComment } : r
    );
    
    setRecords(updatedRecords);
    
    // Auto generate Excel for this specific abono
    const record = updatedRecords.find(r => r.id === selectedRecordId);
    if (record) {
      exportToExcel([record], `Abono_${record.filename.split('.')[0]}`);
    }

    setModalOpen(false);
    setSelectedRecordId(null);
    setModalComment('');
  };

  const toggleSelection = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setRecords(prev => prev.map(r => {
      // Only select visible records in the active tab if needed, 
      // but usually select all in the current list is expected.
      if (activeTab === 'abono' && (r.status === 'Conciliado')) return r;
      return { ...r, selected: checked };
    }));
  };

  const handleExportSelected = () => {
    const selected = records.filter(r => r.selected);
    if (selected.length === 0) {
      alert("Selecione ao menos um registro para exportar.");
      return;
    }
    exportToExcel(selected, "Auditoria_Export");
  };

  // --- Render Helpers ---

  const renderStatusIcon = (status: string) => {
    if (status === 'Conciliado' || status === 'Aprovado') {
      return <div className="w-3 h-3 rounded-full bg-green-600 border border-black" />;
    }
    if (status === 'Erro na Conciliação' || status === 'Reprovado') {
      return <div className="w-3 h-3 rounded-full bg-red-600 border border-black" />;
    }
    return null;
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#C0C0C0] text-[11px] select-none">
      {/* --- Top Bar (Title Bar) --- */}
      <div className="win-titlebar h-6 shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-white/20 flex items-center justify-center rounded-sm">
            {
              {
                'romaneio': <FileText size={10} />,
                'reprocessar': <RefreshCcw size={10} />,
                'abono': <CheckSquare size={10} />,
                'relatorios': <BarChart2 size={10} />
              }[activeTab]
            }
          </div>
          <span>
            TMS Auditoria de Frete - [
            {
              {
                'romaneio': 'Romaneio',
                'reprocessar': 'Reprocessamento de XML',
                'abono': 'Abono de Divergências',
                'relatorios': 'Relatórios'
              }[activeTab]
            }
            ]
          </span>
        </div>
        <div className="flex gap-1">
          <button className="win-button w-5 h-4 flex items-center justify-center text-xs font-bold leading-none" onClick={() => setSidebarOpen(!sidebarOpen)}>↔</button>
          <button className="win-button w-5 h-4 flex items-center justify-center text-xs font-bold leading-none">_</button>
          <button className="win-button w-5 h-4 flex items-center justify-center text-xs font-bold leading-none">□</button>
          <button className="win-button w-5 h-4 flex items-center justify-center text-xs font-bold leading-none bg-red-200">X</button>
        </div>
      </div>

      {/* --- Toolbar --- */}
      <div className="flex items-center gap-1 p-1 border-b border-[#808080] bg-[#C0C0C0] shrink-0">
        <button className="win-button flex items-center gap-1 px-2 py-0.5" onClick={() => fileInputRef.current?.click()}>
          <Plus size={12} className="text-green-700" />
          <span>Novo</span>
        </button>
        <button className="win-button flex items-center gap-1 px-2 py-0.5" onClick={() => setRecords([])}>
          <Trash2 size={12} className="text-red-700" />
          <span>Limpar</span>
        </button>
        <div className="w-[1px] h-4 bg-[#808080] mx-1" />
        <button className="win-button flex items-center gap-1 px-2 py-0.5" onClick={handleExportSelected}>
          <Download size={12} className="text-blue-700" />
          <span>Exportar Selecionados</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* --- Sidebar (TreeView) --- */}
        {sidebarOpen && (
          <div className="w-48 bg-white win-inset m-1 flex flex-col shrink-0">
            <div className="p-1 border-b border-gray-300">
              <div className="win-inset flex items-center bg-white">
                <input 
                  type="text" 
                  placeholder="Pesquisar..."
                  className="w-full bg-transparent text-xs px-1 outline-none"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                />
                <button className="win-button p-0.5">
                  <Search size={12} />
                </button>
              </div>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              <div className="flex items-center gap-1 mb-1 cursor-pointer">
                <ChevronDown size={14} />
                <Folder size={14} className="text-yellow-600" />
                <span className="font-bold">TMS Auditoria</span>
              </div>
              <div className="ml-4 space-y-1">
                {[
                  { id: 'romaneio', label: 'Romaneio', icon: <FileText size={14} /> },
                  { id: 'reprocessar', label: 'Reprocessar XML', icon: <RefreshCcw size={14} /> },
                  { id: 'abono', label: 'Abono', icon: <CheckSquare size={14} /> },
                  { id: 'relatorios', label: 'Relatórios', icon: <BarChart2 size={14} /> },
                ].filter(item => item.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
                .map(item => (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-1 p-0.5 cursor-default ${activeTab === item.id ? 'bg-[#000080] text-white' : 'hover:bg-blue-100'}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1 mt-2 mb-1 cursor-pointer" onClick={() => setTabelaFreteOpen(!tabelaFreteOpen)}>
                <ChevronDown size={14} className={`transform transition-transform ${tabelaFreteOpen ? '' : '-rotate-90'}`} />
                <Folder size={14} className="text-yellow-600" />
                <span className="font-bold">Tabela Frete</span>
              </div>
              {tabelaFreteOpen && (
                <div className="ml-4 space-y-1">
                  {[ 'Aprovação Tabela de Frete',
                    'Cadastro Tabela Frete',
                    'Consulta Tabela de Frete',
                    'Controle de Tabelas Frete',
                    'Importação de Tabela Frete',
                    'Importação de Tabela Frete Vtex (XLSX)',
                  ].filter(item => item.toLowerCase().includes(sidebarSearch.toLowerCase())).map(item => {
                    const iconMap: Record<string, React.ReactNode> = {
                      'Importação de Tabela Frete': <Upload size={14} />,
                      'Importação de Tabela Frete Vtex (XLSX)': <FileUp size={14} />,
                    };
                    return (
                    <div 
                      key={item}
                      className={`flex items-center gap-1 p-0.5 cursor-default ${activeTab === item ? 'bg-[#000080] text-white' : 'hover:bg-blue-100'}`}
                      onClick={() => setActiveTab(item)}
                    >
                      {iconMap[item] || <FileText size={14} />}
                      <span>{item}</span>
                    </div>
                  )})}
                </div>
              )}

              <div className="flex items-center gap-1 mt-2 mb-1 cursor-pointer" onClick={() => setBackofficeOpen(!backofficeOpen)}>
                <ChevronDown size={14} className={`transform transition-transform ${backofficeOpen ? '' : '-rotate-90'}`} />
                <Folder size={14} className="text-yellow-600" />
                <span className="font-bold">BackOffice</span>
              </div>
              {backofficeOpen && (
                <div className="ml-4 space-y-1">
                  {[ 
                    {id: 'Embarcadores', label: 'Embarcadores', icon: <Users size={14} />},
                    {id: 'Transportadora', label: 'Transportadora', icon: <Truck size={14} />}
                  ].filter(item => item.label.toLowerCase().includes(sidebarSearch.toLowerCase())).map(item => (
                    <div 
                      key={item.id}
                      className={`flex items-center gap-1 p-0.5 cursor-default ${activeTab === item.id ? 'bg-[#000080] text-white' : 'hover:bg-blue-100'}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Main Content --- */}
        <div className="flex-1 flex flex-col m-1 overflow-hidden">
          {activeTab === 'reprocessar' && (
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
                    <label className="font-bold">Memória de Cálculo (Excel/CSV):</label>
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        accept=".xlsx,.xls,.csv" 
                        className="hidden" 
                        ref={memoryInputRef}
                        onChange={handleMemoryUpload}
                      />
                      <button 
                        className="win-button px-4 py-1 font-bold bg-blue-50"
                        onClick={() => memoryInputRef.current?.click()}
                      >
                        Importar Memória...
                      </button>
                      {Object.keys(memoryMap).length > 0 && (
                        <span className="text-green-700 font-bold self-center">✓ {Object.keys(memoryMap).length} itens</span>
                      )}
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
                      <th className="win-grid-header">Origem/Destino</th>
                      <th className="win-grid-header">Código</th>
                      <th className="win-grid-header">SOLTRANSP</th>
                      <th className="win-grid-header w-20">ICMS</th>
                      <th className="win-grid-header w-20">Pedágio</th>
                      <th className="win-grid-header w-20">Seguro</th>
                      <th className="win-grid-header w-20">Frete Peso</th>
                      <th className="win-grid-header w-24">Vlr Líquido</th>
                      <th className="win-grid-header w-24">Total Calc.</th>
                      <th className="win-grid-header w-24">All In (Exp.)</th>
                      <th className="win-grid-header w-32">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, idx) => (
                      <tr 
                        key={record.id} 
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer select-none`}
                        onDoubleClick={() => openDetailModal(record)}
                      >
                        <td className="border-r border-b border-gray-300 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                           <input 
                            type="checkbox" 
                            checked={record.selected || false} 
                            onChange={() => toggleSelection(record.id)}
                          />
                        </td>
                        <td className="border-r border-b border-gray-300 px-2 font-medium">{record.origemDestino}</td>
                        <td className="border-r border-b border-gray-300 px-2 font-bold text-blue-900">{record.codigo}</td>
                        <td className="border-r border-b border-gray-300 px-2 font-bold text-green-900">{record.soltransp}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.icms)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.pedagio)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.seguro)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.fretePeso)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right text-blue-800 font-medium">{formatBRL(record.valorLiquido)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right font-bold">{formatBRL(record.totalCalculado)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.valueInformed)}</td>
                        <td className="border-r border-b border-gray-300 px-2">
                          <div className="flex items-center gap-2">
                            {renderStatusIcon(record.status)}
                            <span className={record.status === 'Erro na Conciliação' ? 'text-red-700 font-bold' : ''}>{record.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={12} className="p-4 text-center text-gray-500 italic">Nenhum registro processado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'abono' && (
            <div className="flex flex-col h-full">
              <div className="win-outset p-2 mb-2 bg-[#C0C0C0]">
                <span className="font-bold">Listagem de Divergências para Abono</span>
              </div>
              <div className="flex-1 win-inset bg-white overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="win-grid-header w-8">
                        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                      </th>
                      <th className="win-grid-header">Origem/Destino</th>
                      <th className="win-grid-header">Código</th>
                      <th className="win-grid-header">SOLTRANSP</th>
                      <th className="win-grid-header w-20">ICMS</th>
                      <th className="win-grid-header w-20">Pedágio</th>
                      <th className="win-grid-header w-20">Seguro</th>
                      <th className="win-grid-header w-20">Frete Peso</th>
                      <th className="win-grid-header w-24">Vlr Líquido</th>
                      <th className="win-grid-header w-24">Total Calc.</th>
                      <th className="win-grid-header w-24">All In (Exp.)</th>
                      <th className="win-grid-header w-32">Status</th>
                      <th className="win-grid-header">Observação</th>
                      <th className="win-grid-header w-12">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.filter(r => r.status === 'Erro na Conciliação' || r.status === 'Aprovado' || r.status === 'Reprovado').map((record, idx) => (
                      <tr 
                        key={record.id} 
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer select-none`}
                        onDoubleClick={() => openDetailModal(record)}
                      >
                        <td className="border-r border-b border-gray-300 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={record.selected || false} 
                            onChange={() => toggleSelection(record.id)}
                          />
                        </td>
                        <td className="border-r border-b border-gray-300 px-2 font-medium">{record.origemDestino}</td>
                        <td className="border-r border-b border-gray-300 px-2 font-bold text-blue-900">{record.codigo}</td>
                        <td className="border-r border-b border-gray-300 px-2 font-bold text-green-900">{record.soltransp}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.icms)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.pedagio)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.seguro)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.fretePeso)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right text-blue-800 font-medium">{formatBRL(record.valorLiquido)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right font-bold">{formatBRL(record.totalCalculado)}</td>
                        <td className="border-r border-b border-gray-300 px-2 text-right">{formatBRL(record.valueInformed)}</td>
                        <td className="border-r border-b border-gray-300 px-2">
                          <div className="flex items-center gap-2">
                            {renderStatusIcon(record.status)}
                            <span className={record.status === 'Erro na Conciliação' ? 'text-red-700 font-bold' : ''}>{record.status}</span>
                          </div>
                        </td>
                        <td className="border-r border-b border-gray-300 px-2 italic text-gray-600">{record.observacao}</td>
                        <td className="border-r border-b border-gray-300 px-1 text-center">
                          <button 
                            className="win-button p-0.5"
                            onClick={() => openAbonoModal(record.id)}
                          >
                            <Search size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {records.filter(r => r.status === 'Erro na Conciliação' || r.status === 'Aprovado' || r.status === 'Reprovado').length === 0 && (
                      <tr>
                        <td colSpan={14} className="p-4 text-center text-gray-500 italic">Nenhuma divergência encontrada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Importação de Tabela Frete' && <TabelaFreteImportacao onImportSuccess={handleImportSuccess} />}

          {activeTab === 'Embarcadores' && <Embarcadores setActiveTab={setActiveTab} embarcadores={embarcadores} setEmbarcadores={setEmbarcadores} />}

          {activeTab === 'Transportadora' && <Transportadora setActiveTab={setActiveTab} transportadoras={transportadoras} setTransportadoras={setTransportadoras} />}

          {activeTab === 'Cadastro Tabela Frete' && <CadastroTabelaFrete embarcadores={embarcadores} transportadoras={transportadoras} importedFreightTables={importedFreightTables} />}

          {['Aprovação Tabela de Frete', 'Consulta Tabela de Frete', 'Controle de Tabelas Frete', 'Importação de Tabela Frete Vtex (XLSX)'].includes(activeTab) && activeTab !== 'Importação de Tabela Frete' && activeTab !== 'Cadastro Tabela Frete' && (
            <div className="flex items-center justify-center h-full win-inset bg-white">
              <div className="text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Módulo {activeTab} em desenvolvimento.</p>
              </div>
            </div>
          )}

          {activeTab === 'romaneio' && (
            <div className="flex items-center justify-center h-full win-inset bg-white">
              <div className="text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Módulo de Romaneio em desenvolvimento.</p>
              </div>
            </div>
          )}

          {activeTab === 'relatorios' && (
            <div className="flex items-center justify-center h-full win-inset bg-white">
              <div className="text-center">
                <BarChart2 size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Módulo de Relatórios em desenvolvimento.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Status Bar --- */}
      <div className="h-5 bg-[#C0C0C0] border-t border-[#808080] flex items-center px-2 gap-4 shrink-0">
        <div className="win-inset px-2 flex-1">Pronto</div>
        <div className="win-inset px-2 w-32">NUM</div>
        <div className="win-inset px-2 w-32">CAPS</div>
        <div className="win-inset px-2 w-32">SCRL</div>
      </div>

      {/* Modal de Detalhes (Double Click) */}
      {detailModalOpen && detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="win-outset w-[600px] bg-[#C0C0C0] shadow-2xl">
            <div className="win-title-bar flex justify-between items-center p-1 bg-blue-900 text-white">
              <span className="font-bold text-sm">Detalhes do Documento - {detailRecord.filename}</span>
              <button className="win-button px-2 py-0" onClick={() => setDetailModalOpen(false)}>X</button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="win-inset bg-white p-3">
                <h3 className="font-bold text-blue-900 border-b border-gray-300 mb-2">Informações Gerais</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-bold">Embarcador:</span></div>
                  <div className="text-gray-800">{detailRecord.embarcador || 'Não identificado'}</div>
                  
                  <div><span className="font-bold">Origem/Destino:</span></div>
                  <div>{detailRecord.origemDestino}</div>

                  <div><span className="font-bold">Código:</span></div>
                  <div>{detailRecord.codigo}</div>

                  <div><span className="font-bold">SOLTRANSP:</span></div>
                  <div>{detailRecord.soltransp}</div>
                </div>
              </div>

              <div className="win-inset bg-white p-3 flex-1 overflow-auto max-h-[300px]">
                <h3 className="font-bold text-blue-900 border-b border-gray-300 mb-2">Chaves NF-e Vinculadas</h3>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-1 text-left">Chave Completa</th>
                      <th className="border border-gray-300 p-1 text-center w-24">Número (9d)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRecord.chaves && detailRecord.chaves.length > 0 ? (
                      detailRecord.chaves.map((chave, i) => (
                        <tr key={i}>
                          <td className="border border-gray-300 p-1 font-mono">{chave}</td>
                          <td className="border border-gray-300 p-1 text-center font-bold text-blue-700">
                            {chave.length >= 34 ? chave.substring(25, 34) : '---'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="p-2 text-center text-gray-400 italic">Nenhuma chave encontrada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button 
                  className="win-button px-6 py-1 font-bold"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal (Abono Authorization) --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="win-outset bg-[#C0C0C0] w-80 shadow-2xl">
            <div className="win-titlebar h-6">
              <span>Autorização de Abono</span>
              <button onClick={() => setModalOpen(false)} className="win-button w-4 h-4 flex items-center justify-center text-[10px]">X</button>
            </div>
            <div className="p-4">
              <div className="flex gap-3 mb-4">
                <Search size={32} className="text-blue-800 shrink-0" />
                <p className="font-bold">Aprovar divergência deste XML?</p>
              </div>
              <p className="mb-4 text-gray-700">
                Arquivo: {records.find(r => r.id === selectedRecordId)?.filename}
              </p>
              <div className="flex flex-col gap-1 mb-4">
                <label className="font-bold">Observações / Justificativa:</label>
                <textarea 
                  className="win-input w-full h-20 resize-none"
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  placeholder="Digite o motivo do abono ou reprovação..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="win-button px-4 py-1 font-bold min-w-[80px]"
                  onClick={() => handleAbonoAction('Aprovado')}
                >
                  Aprovar
                </button>
                <button 
                  className="win-button px-4 py-1 font-bold min-w-[80px]"
                  onClick={() => handleAbonoAction('Reprovado')}
                >
                  Reprovar
                </button>
                <button 
                  className="win-button px-4 py-1 min-w-[80px]"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
