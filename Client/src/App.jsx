import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuizGame from './components/QuizGame';
import MultiplayerMenu from './components/Multiplayer/MultiplayerMenu';
import CreateRoom from './components/Multiplayer/CreateRoom';
import JoinRoom from './components/Multiplayer/JoinRoom';
import Lobby from './components/Multiplayer/Lobby';
import MultiplayerGame from './components/Multiplayer/MultiplayerGame';
import Leaderboard from './components/Multiplayer/Leaderboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<QuizGame />} />
          <Route path="/multiplayer" element={<MultiplayerMenu />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/lobby/:roomCode" element={<Lobby />} />
          <Route path="/game/:roomCode" element={<MultiplayerGame />} />
          <Route path="/leaderboard/:roomCode" element={<Leaderboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
