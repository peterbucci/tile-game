import React from "react";
import "./App.css";
import Game from "./components/Game";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React, TypeScript, Redux, and Phaser App</h1>
      </header>
      <Game backgroundColor="#000000" />
    </div>
  );
};

export default App;
