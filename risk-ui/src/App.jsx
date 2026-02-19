import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LobbyScreen from './Screens/LobbyScreen';
import GameScreen from './Screens/GameScreen';

function App() {
  const [gameState, setGameState] = useState(null);
  const [screenPlayer, setScreenPlayer] = useState("")

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<LobbyScreen setScreenPlayer={setScreenPlayer} onGameStart={(state) => setGameState(state)} />} 
        />

        <Route 
          path="/GameScreen" 
          element={<GameScreen initialData={gameState} screenPlayer={screenPlayer} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;