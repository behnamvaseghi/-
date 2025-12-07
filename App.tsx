import React, { useState } from 'react';
import { AppState } from './types';
import Intro from './components/Intro';
import Book from './components/Book';
import Exit from './components/Exit';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);

  const handleIntroComplete = () => {
    setAppState(AppState.CATALOG);
  };

  const handleExit = () => {
    setAppState(AppState.EXIT);
  };

  const handleRestart = () => {
    setAppState(AppState.INTRO);
  };

  return (
    <div className="w-full h-screen bg-black text-gray-800 font-sans select-none overflow-hidden touch-none">
      {appState === AppState.INTRO && (
        <Intro onComplete={handleIntroComplete} />
      )}
      
      {appState === AppState.CATALOG && (
        <Book 
            onExit={handleExit} 
            onRestart={handleRestart}
        />
      )}
      
      {appState === AppState.EXIT && (
        <Exit onRestart={handleRestart} />
      )}
    </div>
  );
};

export default App;