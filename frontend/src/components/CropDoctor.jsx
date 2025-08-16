import React, { useState } from 'react';
import { UploadCloud, FileImage, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';

// FIX: Added a default value for the 't' prop to prevent crashes.
export default function CropDoctor({ t = (key) => key, language }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleDiagnose = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', image);
    formData.append('language', language);

    try {
      const response = await fetch('http://localhost:5000/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
      
      const data = await response.json();
      
      setResult({
        disease: data.disease.replace(/___/g, ' ').replace(/_/g, ' '),
        confidence: `${(data.confidence * 100).toFixed(2)}%`,
        recommendation: data.recommendation
      });

    } catch (err) {
      console.error("Diagnosis failed:", err);
      if (err instanceof TypeError) setError(t('errorNetwork'));
      else setError(t('errorProcessing'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">{t('aiCropDoctorTitle')}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t('aiCropDoctorSubtitle')}</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">{t('uploadTitle')}</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
            {preview ? (
              <div className="relative"><img src={preview} alt="Selected leaf" className="max-h-64 mx-auto rounded-lg" /><button onClick={() => { setPreview(null); setImage(null); setResult(null); setError(null); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"><X size={16} /></button></div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center"><UploadCloud size={48} className="text-gray-400 dark:text-gray-500 mb-2" /><span className="font-semibold text-purple-600 dark:text-purple-400">{t('uploadButton')}</span><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or drag and drop (PNG, JPG)</p></label>
            )}
          </div>
          <button onClick={handleDiagnose} disabled={!image || isLoading} className="w-full mt-6 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
            {isLoading ? <><Loader2 size={20} className="animate-spin mr-2" />{t('diagnosing')}</> : t('diagnoseButton')}
          </button>
        </div>
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">{t('resultTitle')}</h2>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full"><Loader2 size={48} className="animate-spin text-purple-500" /><p className="mt-4 text-gray-500 dark:text-gray-400">Analyzing image...</p></div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                <AlertTriangle size={48} className="text-red-500" />
                <h3 className="mt-4 font-bold text-red-600 dark:text-red-400">{t('errorTitle')}</h3>
                <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : result ? (
            <div>
              <div className="flex items-center bg-green-100 dark:bg-green-900/50 p-4 rounded-lg"><CheckCircle size={24} className="text-green-600 dark:text-green-400" /><div className="ml-3"><h3 className="text-lg font-bold text-gray-800 dark:text-white">{result.disease}</h3><p className="text-sm text-green-700 dark:text-green-300">Confidence: {result.confidence}</p></div></div>
              <div className="mt-6"><h4 className="font-bold text-gray-800 dark:text-white">{t('organicTreatment')}</h4><p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{result.recommendation}</p></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center"><FileImage size={48} className="text-gray-400 dark:text-gray-500" /><p className="mt-4 text-gray-500 dark:text-gray-400">{t('resultPlaceholder')}</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
