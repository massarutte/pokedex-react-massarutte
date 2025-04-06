import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pokedex from "./components/Pokedex";
import Jogo from "./pages/Jogo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Pokedex />} />
        <Route path="/jogo" element={<Jogo />} />
      </Routes>
    </Router>
  );
}

export default App;
