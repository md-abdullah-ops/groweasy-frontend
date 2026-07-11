"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, CheckCircle, AlertCircle, FileText, Sun, Moon, RotateCcw } from 'lucide-react';
import { TableVirtuoso } from 'react-virtuoso';

export default function CsvImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(true);

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setPreviewHeaders(result.meta.fields || []);
        setPreviewData(result.data.slice(0, 5));
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      processFile(droppedFile);
    } else {
      alert("Please upload a valid .csv file");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) processFile(uploadedFile);
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('https://groweasy-backend-kseo.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to process the file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setPreviewHeaders([]);
    setResults(null);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans selection:bg-red-500/30 transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0a] text-zinc-300' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`max-w-6xl mx-auto rounded-2xl border shadow-2xl p-6 md:p-8 transition-colors duration-300 ${isDarkMode ? 'bg-[#121212] border-zinc-800' : 'bg-white border-gray-300'}`}>
        
        <div className={`flex items-center justify-between mb-8 pb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-4">
            <h1 className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-gray-900'}`}>CRM_DATA_IMPORTER</h1>
            <span className={`text-xs font-mono px-2 py-1 rounded ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600'}`}>v1.2.0</span>
          </div>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'bg-gray-200 text-gray-600 hover:text-gray-900'}`}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        {!results && !previewData.length && (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 md:p-20 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-red-500 bg-red-500/5' 
                : isDarkMode 
                  ? 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <UploadCloud className={`mx-auto h-12 w-12 mb-4 ${isDragging ? 'text-red-500' : isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} />
            <p className={`mb-6 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Drag and drop your CSV file here, or</p>
            <label className={`cursor-pointer px-6 py-2.5 rounded font-semibold transition-colors ${isDarkMode ? 'bg-zinc-100 text-zinc-900 hover:bg-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
              Browse Files
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <p className={`mt-6 text-xs font-mono ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>SUPPORTED FORMATS: .CSV ONLY</p>
          </div>
        )}

        {previewData.length > 0 && !results && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`} />
              <h2 className={`text-lg font-medium ${isDarkMode ? 'text-zinc-100' : 'text-gray-900'}`}>Dataset Preview</h2>
            </div>
            
            <div className={`overflow-x-auto border rounded-lg max-h-96 custom-scrollbar ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
              <table className={`min-w-full divide-y text-sm ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-200'}`}>
                <thead className={`sticky top-0 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'}`}>
                  <tr>
                    {previewHeaders.map((header, i) => (
                      <th key={i} className={`px-6 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono text-xs ${isDarkMode ? 'bg-[#121212] divide-zinc-800' : 'bg-white divide-gray-200'}`}>
                  {previewData.map((row, i) => (
                    <tr key={i} className={`transition-colors ${isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-gray-50'}`}>
                      {previewHeaders.map((header, j) => (
                        <td key={j} className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleConfirmImport} 
                disabled={isProcessing}
                className="bg-red-600 text-white px-8 py-3 rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    INITIALIZING AI MAPPING...
                  </>
                ) : 'CONFIRM & EXECUTE IMPORT'}
              </button>
            </div>
          </div>
        )}

        {results && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 px-4 py-2 rounded">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="font-mono text-sm font-semibold">IMPORTED: {results.total_imported}</span>
              </div>
              <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 px-4 py-2 rounded">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="font-mono text-sm font-semibold">SKIPPED: {results.total_skipped}</span>
              </div>
            </div>

            <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-zinc-100' : 'text-gray-900'}`}>Mapped CRM Records (Virtualized)</h2>
            
              {/* VIRTUALIZED TABLE CONTAINER */}
            <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
              <TableVirtuoso
                style={{ height: '400px', width: '100%' }}
                data={results.data}
                fixedHeaderContent={() => (
                  <tr className={`text-left font-mono text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'bg-[#1a1a1a] text-zinc-500' : 'bg-gray-100 text-gray-500'}`}>
                    <th className="px-6 py-3 border-b border-inherit">Name</th>
                    <th className="px-6 py-3 border-b border-inherit">Email</th>
                    <th className="px-6 py-3 border-b border-inherit">Mobile</th>
                    <th className="px-6 py-3 border-b border-inherit">Source</th>
                    <th className="px-6 py-3 border-b border-inherit">Status</th>
                    <th className="px-6 py-3 border-b border-inherit">Notes</th>
                  </tr>
                )}
                itemContent={(_index, record: any) => (
                  <>
                    <td className={`px-6 py-4 whitespace-nowrap border-b ${isDarkMode ? 'text-zinc-200 border-zinc-800/50' : 'text-gray-800 border-gray-100'}`}>{record.name || '—'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap border-b ${isDarkMode ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-600 border-gray-100'}`}>{record.email || '—'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap border-b ${isDarkMode ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-600 border-gray-100'}`}>{record.mobile_without_country_code || '—'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap border-b ${isDarkMode ? 'text-zinc-400 border-zinc-800/50' : 'text-gray-600 border-gray-100'}`}>
                      {record.data_source ? (
                         <span className={`px-2 py-1 rounded border text-[10px] ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{record.data_source}</span>
                      ) : '—'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap border-b ${isDarkMode ? 'border-zinc-800/50' : 'border-gray-100'}`}>
                      {record.crm_status ? (
                         <span className={`px-2 py-1 rounded border text-[10px] ${isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>{record.crm_status}</span>
                      ) : '—'}
                    </td>
                    <td className={`px-6 py-4 truncate max-w-xs border-b ${isDarkMode ? 'text-zinc-500 border-zinc-800/50' : 'text-gray-500 border-gray-100'}`}>{record.crm_note || '—'}</td>
                  </>
                )}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleReset}
                className={`flex items-center px-6 py-2.5 rounded font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                }`}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Import Another CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}