"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

export default function CsvImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setPreviewHeaders(result.meta.fields || []);
        setPreviewData(result.data.slice(0, 5)); // Show 5 rows for preview
      }
    });
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:3001/api/upload', {
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
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold mb-6">Import Leads via CSV</h1>
        
        {/* Step 1: Upload */}
        {!results && !previewData.length && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700">
              Browse Files
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <p className="mt-4 text-sm text-gray-500">Supported files: .csv</p>
          </div>
        )}

        {/* Step 2: Preview & Confirm */}
        {previewData.length > 0 && !results && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Preview Data (First 5 Rows)</h2>
            <div className="overflow-x-auto border rounded-lg max-h-96">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {previewHeaders.map((header, i) => (
                      <th key={i} className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, i) => (
                    <tr key={i}>
                      {previewHeaders.map((header, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap text-gray-600">{row[header]}</td>
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
                className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? 'AI is mapping fields...' : 'Confirm & Import with AI'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {results && (
          <div className="mt-8">
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center text-green-700 bg-green-50 px-4 py-2 rounded-md">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-semibold">Imported: {results.total_imported}</span>
              </div>
              <div className="flex items-center text-yellow-700 bg-yellow-50 px-4 py-2 rounded-md">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-semibold">Skipped: {results.total_skipped}</span>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-4">Mapped CRM Records</h2>
            <div className="overflow-x-auto border rounded-lg max-h-[500px]">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Mobile</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.data?.map((record: any, i: number) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{record.name || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.email || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.mobile_without_country_code || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{record.crm_status || '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{record.crm_note || '—'}</td>
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