import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MultiplayerMenu() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-8">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        Multiplayer Mode
      </h1>
      
      <div className="flex gap-6">
        <button 
          onClick={() => navigate('/create-room')}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
        >
          Create Room
        </button>
        
        <button 
          onClick={() => navigate('/join-room')}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg shadow-green-500/30"
        >
          Join Room
        </button>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="mt-8 text-gray-400 hover:text-white underline"
      >
        Back to Main Menu
      </button>
    </div>
  );
}
