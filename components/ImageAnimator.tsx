import React, { useState, useRef } from 'react';
import { Upload, Play, Loader2, Download, AlertCircle, X } from 'lucide-react';
import { generateVideo } from '../services/geminiService';

const ImageAnimator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // base64
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip data:image/...;base64, prefix for the API call later
        const rawBase64 = base64String.split(',')[1];
        setSelectedImage(rawBase64);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    
    try {
      const url = await generateVideo(prompt, aspectRatio, selectedImage);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to animate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Animate Image</h2>
        <p className="text-gray-400 mb-6">Bring your photos to life using Veo's image-to-video capabilities.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Image
              </label>
              {!selectedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 hover:border-blue-500 hover:bg-gray-800/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-64"
                >
                  <Upload className="w-10 h-10 text-gray-500 mb-4" />
                  <p className="text-gray-300 font-medium">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-800 h-64 group bg-black">
                  <img 
                    src={`data:image/png;base64,${selectedImage}`} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt (Optional)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how the image should move (e.g., 'Camera pans right, leaves blowing in wind')"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
              />
            </div>
            
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Aspect Ratio
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                      aspectRatio === '16:9' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-950 border-gray-800 text-gray-400'
                    }`}
                  >
                    Landscape (16:9)
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                      aspectRatio === '9:16' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-950 border-gray-800 text-gray-400'
                    }`}
                  >
                    Portrait (9:16)
                  </button>
                </div>
              </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedImage}
              className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                loading || !selectedImage
                  ? 'bg-gray-800 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Animating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Generate Video
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          <div className="bg-gray-950 rounded-xl border border-gray-800 p-4 flex flex-col items-center justify-center min-h-[400px]">
             {error && (
                <div className="text-center text-red-400 max-w-xs mb-4">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>{error}</p>
                </div>
              )}
            
            {loading && (
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400 animate-pulse">Veo is dreaming...</p>
                <p className="text-xs text-gray-600 mt-2">This may take 1-2 minutes</p>
              </div>
            )}

            {!loading && !videoUrl && !error && (
              <div className="text-center text-gray-600">
                <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Generated video will appear here</p>
              </div>
            )}

            {videoUrl && (
               <div className="w-full h-full flex flex-col">
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg"
                  />
                  <a 
                    href={videoUrl}
                    download={`veo-animated-${Date.now()}.mp4`}
                    className="mt-4 mx-auto flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                  >
                    <Download className="w-4 h-4" />
                    Download Video
                  </a>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnimator;