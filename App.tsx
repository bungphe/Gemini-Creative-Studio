import React, { useState } from 'react';
import { 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  MessageSquare, 
  LayoutDashboard 
} from 'lucide-react';
import VideoGenerator from './components/VideoGenerator';
import ImageAnimator from './components/ImageAnimator';
import ImageAnalyzer from './components/ImageAnalyzer';
import ChatAssistant from './components/ChatAssistant';

// Navigation items
enum View {
  DASHBOARD = 'dashboard',
  VEO_TEXT = 'veo-text',
  VEO_IMAGE = 'veo-image',
  ANALYSIS = 'analysis',
  CHAT = 'chat'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.VEO_TEXT);

  const renderContent = () => {
    switch (currentView) {
      case View.VEO_TEXT:
        return <VideoGenerator />;
      case View.VEO_IMAGE:
        return <ImageAnimator />;
      case View.ANALYSIS:
        return <ImageAnalyzer />;
      case View.CHAT:
        return <ChatAssistant />;
      default:
        return <VideoGenerator />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Gemini Studio
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-2">
            Creation
          </div>
          <NavItem 
            icon={<Video size={20} />} 
            label="Generate Video" 
            active={currentView === View.VEO_TEXT}
            onClick={() => setCurrentView(View.VEO_TEXT)} 
          />
          <NavItem 
            icon={<ImageIcon size={20} />} 
            label="Animate Image" 
            active={currentView === View.VEO_IMAGE}
            onClick={() => setCurrentView(View.VEO_IMAGE)} 
          />
          
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">
            Intelligence
          </div>
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Analyze Images" 
            active={currentView === View.ANALYSIS}
            onClick={() => setCurrentView(View.ANALYSIS)} 
          />
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="Chat Assistant" 
            active={currentView === View.CHAT}
            onClick={() => setCurrentView(View.CHAT)} 
          />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 text-center">
            Powered by Gemini 2.5 & 3.0
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 flex justify-around p-3">
        <MobileNavItem icon={<Video size={20} />} active={currentView === View.VEO_TEXT} onClick={() => setCurrentView(View.VEO_TEXT)} />
        <MobileNavItem icon={<ImageIcon size={20} />} active={currentView === View.VEO_IMAGE} onClick={() => setCurrentView(View.VEO_IMAGE)} />
        <MobileNavItem icon={<LayoutDashboard size={20} />} active={currentView === View.ANALYSIS} onClick={() => setCurrentView(View.ANALYSIS)} />
        <MobileNavItem icon={<MessageSquare size={20} />} active={currentView === View.CHAT} onClick={() => setCurrentView(View.CHAT)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
          <h2 className="text-lg font-medium text-gray-200">
            {currentView === View.VEO_TEXT && "Text to Video (Veo)"}
            {currentView === View.VEO_IMAGE && "Image to Video (Veo)"}
            {currentView === View.ANALYSIS && "Visual Analysis"}
            {currentView === View.CHAT && "AI Assistant"}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
          <div className="max-w-5xl mx-auto w-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ 
  icon, label, active, onClick 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group ${
      active 
        ? 'bg-blue-600/10 text-blue-400' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
    }`}
  >
    <span className={`${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
      {icon}
    </span>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ 
  icon, active, onClick 
}) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-xl transition-all ${
      active ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
    }`}
  >
    {icon}
  </button>
);

export default App;