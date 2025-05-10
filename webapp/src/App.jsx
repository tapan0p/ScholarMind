import React, { useState } from 'react';
import Chat from './components/Chat';
import FileExplorer from './components/FileExplorer';
import PdfViewer from './components/PdfViewer';

function App() {
  const [showFolderSidebar, setShowFolderSidebar] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(true);
  const [researchPapers, setResearchPapers] = useState([]);
  const [paper,setPaper] = useState(null)

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden fixed inset-0">
      {/* Navbar */}
      <nav className="bg-slate-800 text-white p-2 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-4">ScholarMind</h1>
          
          {/* Toggle buttons */}
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowFolderSidebar(!showFolderSidebar)}
              className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${showFolderSidebar ? 'bg-slate-700' : ''}`}
              title="Toggle Folder Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
            
            <button 
              onClick={() => setShowChatSidebar(!showChatSidebar)}
              className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${showChatSidebar ? 'bg-slate-700' : ''}`}
              title="Toggle Chat Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Additional navbar items like user profile, settings, etc. */}
          <button className="p-1.5 rounded hover:bg-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main content area with sidebars */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Folder sidebar */}
        {showFolderSidebar && (
          <div className="w-64 bg-slate-700 text-white p-4 overflow-y-auto flex-shrink-0">
            <FileExplorer researchPapers={researchPapers} setPaper={setPaper} />
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 p-0 overflow-y-auto">
          <PdfViewer paper={paper}/>
        </div>

        {/* Chat sidebar */}
        {showChatSidebar && (
          <div className="w-96 border-l border-slate-200 flex flex-col overflow-hidden min-h-0 flex-shrink-0">
            <Chat researchPapers={researchPapers} setResearchPapers={setResearchPapers} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
