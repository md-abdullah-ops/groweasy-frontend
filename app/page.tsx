"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function CsvImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Consolidated file processing function
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

  // Drag and Drop Handlers
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 font-sans text-zinc-300 selection:bg-red-500/30">
      <div className="max-w-6xl mx-auto bg-[#121212] rounded-2xl border border-zinc-800 shadow-2xl p-6 md:p-8">
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">CRM_DATA_IMPORTER</h1>
          <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">v1.0.0</span>
        </div>
        
        {/* Step 1: Drag & Drop Upload */}
        {!results && !previewData.length && (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 md:p-20 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-red-500 bg-red-500/5' 
                : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50'
            }`}
          >
            <UploadCloud className={`mx-auto h-12 w-12 mb-4 ${isDragging ? 'text-red-500' : 'text-zinc-500'}`} />
            <p className="text-zinc-400 mb-6 font-medium">Drag and drop your CSV file here, or</p>
            <label className="cursor-pointer bg-zinc-100 text-zinc-900 px-6 py-2.5 rounded font-semibold hover:bg-white transition-colors">
              Browse Files
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <p className="mt-6 text-xs text-zinc-600 font-mono">SUPPORTED FORMATS: .CSV ONLY</p>
          </div>
        )}

        {/* Step 2: Preview & Confirm */}
        {previewData.length > 0 && !results && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-medium text-zinc-100">Dataset Preview</h2>
            </div>
            
            <div className="overflow-x-auto border border-zinc-800 rounded-lg max-h-96 custom-scrollbar">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
                <thead className="bg-[#1a1a1a] sticky top-0">
                  <tr>
                    {previewHeaders.map((header, i) => (
                      <th key={i} className="px-6 py-3 text-left font-mono text-xs font-medium text-zinc-500 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-[#121212] divide-y divide-zinc-800 font-mono text-xs">
                  {previewData.map((row, i) => (
                    <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                      {previewHeaders.map((header, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap text-zinc-400">{row[header]}</td>
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

        {/* Step 3: Results */}
        {results && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <div className="flex items-center text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-4 py-2 rounded">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="font-mono text-sm">IMPORTED: {results.total_imported}</span>
              </div>
              <div className="flex items-center text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="font-mono text-sm">SKIPPED: {results.total_skipped}</span>
              </div>
            </div>

            <h2 className="text-lg font-medium text-zinc-100 mb-4">Mapped CRM Records</h2>
            <div className="overflow-x-auto border border-zinc-800 rounded-lg max-h-[500px] custom-scrollbar">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
                <thead className="bg-[#1a1a1a] sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left font-mono text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left font-mono text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left font-mono text-xs font-medium text-zinc-500 uppercase tracking-wider">Mobile</th>
                    <th className="px-6 py-3 text-left font-mono text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left font-mono text-xs font-medium text-zinc-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-[#121212] divide-y divide-zinc-800 font-mono text-xs">
                  {results.data?.map((record: any, i: number) => (
                    <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-200">{record.name || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">{record.email || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">{record.mobile_without_country_code || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.crm_status ? (
                           <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700 text-[10px]">{record.crm_status}</span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 truncate max-w-xs">{record.crm_note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}