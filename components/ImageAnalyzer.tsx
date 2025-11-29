import React, { useState, useRef } from 'react';
import { Upload, ScanEye, Loader2, X, RefreshCw } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';

const ImageAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Describe this image in detail and identify key elements.');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(''); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setResult('');
    
    try {
      const analysis = await analyzeImage(selectedImage, prompt);
      setResult(analysis);
    } catch (err) {
      setResult("Error analyzing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Column: Input */}
      <div className="flex flex-col gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ScanEye className="text-teal-400" />
            Visual Analysis
          </h2>
          
          <div className="space-y-4">
            <div 
              onClick={() => !selectedImage && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl transition-all h-64 flex flex-col items-center justify-center relative overflow-hidden ${
                selectedImage 
                  ? 'border-gray-700 bg-black' 
                  : 'border-gray-700 hover:border-teal-500 hover:bg-gray-800/50 cursor-pointer'
              }`}
            >
              {selectedImage ? (
                <>
                  <img 
                    src={selectedImage} 
                    alt="To analyze" 
                    className="w-full h-full object-contain"
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setResult(''); }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-500 mb-4" />
                  <p className="text-gray-300 font-medium">Upload Image to Analyze</p>
                </>
              )}
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                What would you like to know?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-gray-200 focus:border-teal-500 outline-none resize-none h-24"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !selectedImage}
              className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                loading || !selectedImage
                  ? 'bg-gray-800 cursor-not-allowed text-gray-500'
                  : 'bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-900/20'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <ScanEye />}
              {loading ? 'Analyzing...' : 'Analyze with Gemini Pro'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col">
        <h3 className="text-lg font-medium text-gray-300 mb-4">Analysis Result</h3>
        
        <div className="flex-1 bg-gray-950/50 rounded-xl p-6 overflow-y-auto min-h-[400px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              <p>Gemini is examining the pixels...</p>
            </div>
          ) : result ? (
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                {result}
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <ScanEye className="w-12 h-12 mb-3 opacity-20" />
              <p>Upload an image and click analyze to see insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;