import React, { useState } from 'react';
import { Play, Loader2, Download, AlertCircle } from 'lucide-react';
import { generateVideo } from '../services/geminiService';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing Veo model...');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    
    // Cycle messages to keep user engaged during long gen times
    const messages = [
      "Dreaming up your scene...",
      "Rendering pixels with light...",
      "Consulting the creative muse...",
      "Applying cinematic filters...",
      "Almost there, polishing frames..."
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingMessage(messages[msgIdx]);
    }, 4000);

    try {
      setLoadingMessage("Connecting to Veo...");
      const url = await generateVideo(prompt, aspectRatio);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate video");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Prompt to Video</h2>
        <p className="text-gray-400 mb-6">Create high-quality videos from text descriptions using Veo 3.1.</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Describe your video
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cyberpunk city with neon lights reflecting in rain puddles, 8k resolution, cinematic lighting..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Aspect Ratio
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-3.5 border-2 border-current rounded-sm"></div>
                  <span>Landscape (16:9)</span>
                </div>
              </button>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-6 border-2 border-current rounded-sm"></div>
                  <span>Portrait (9:16)</span>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
              loading || !prompt.trim()
                ? 'bg-gray-800 cursor-not-allowed text-gray-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingMessage}
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Generate Video
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-300 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {videoUrl && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8 animate-in fade-in duration-500">
          <h3 className="text-lg font-semibold text-white mb-4">Generated Result</h3>
          <div className={`relative rounded-xl overflow-hidden bg-black shadow-2xl ${aspectRatio === '9:16' ? 'max-w-xs mx-auto' : 'w-full'}`}>
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop 
              className="w-full h-auto block"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <a 
              href={videoUrl} 
              download={`veo-generation-${Date.now()}.mp4`}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Download MP4
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;