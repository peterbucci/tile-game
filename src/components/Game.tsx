import React, { useEffect } from "react";
import Phaser from "phaser";
import MenuScene from "../scenes/MenuScene";
import GridScene from "../scenes/GridScene";
import { useSelector } from "react-redux";
import AppState from "../store/types";

interface GameProps {
  backgroundColor: string;
}

const Game: React.FC<GameProps> = ({ backgroundColor }) => {
  const gameRef = React.useRef<HTMLDivElement>(null);
  const gameInstance = React.useRef<Phaser.Game | null>(null);
  const state = useSelector((state: AppState) => state);
  const {
    tilesheets,
    selectedTilesheet,
    tileSize,
    tilesheetWidth,
    activeLayer,
    layers,
  } = state;

  const resizeGame = () => {
    if (!gameInstance.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    gameInstance.current.scale.resize(width, height);
    gameInstance.current.renderer.resize(width, height); // Add this line

    gameInstance.current.scene.scenes.forEach((scene) => {
      if (scene instanceof GridScene) {
        scene.resize(width, height);
      }
    });
  };

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor,
      parent: gameRef.current,
      scene: [GridScene, MenuScene],
      render: {
        pixelArt: true, // Add this line
      },
      scale: {
        mode: Phaser.Scale.NONE, // Change from Phaser.Scale.RESIZE to Phaser.Scale.NONE
      },
      callbacks: {
        preBoot: (game: Phaser.Game) => {
          game.registry.set("tilesheets", tilesheets);
          game.registry.set("selectedTilesheet", selectedTilesheet);
          game.registry.set("tileSize", tileSize);
          game.registry.set("tilesheetWidth", tilesheetWidth);
          game.registry.set("layers", layers);
          game.registry.set("activeLayer", activeLayer);
          game.registry.set("eventEmitter", new Phaser.Events.EventEmitter());
        },
      },
    };

    gameInstance.current = new Phaser.Game(config);
    gameInstance.current.scene.start("MenuScene");

    window.addEventListener("resize", resizeGame);

    return () => {
      gameInstance.current?.destroy(true);
      window.removeEventListener("resize", resizeGame);
    };
  }, [backgroundColor]);

  return <div ref={gameRef} id="Game-container"></div>;
};

export default Game;
