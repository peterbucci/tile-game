import React, { useEffect } from "react";
import Phaser from "phaser";

interface GameProps {
  backgroundColor: string;
}

const Game: React.FC<GameProps> = ({ backgroundColor }) => {
  const gameRef = React.useRef<HTMLDivElement>(null);
  const gameInstance = React.useRef<Phaser.Game | null>(null);

  const resizeGame = () => {
    if (!gameInstance.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    gameInstance.current.scale.resize(width, height);
  };

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor,
      parent: gameRef.current,
    };

    gameInstance.current = new Phaser.Game(config);

    window.addEventListener("resize", resizeGame);

    return () => {
      gameInstance.current?.destroy(true);
      window.removeEventListener("resize", resizeGame);
    };
  }, [backgroundColor]);

  return <div ref={gameRef} id="Game-container"></div>;
};

export default Game;
