import React from "react";

const GameOverScreen = ({ result, setGameState }) => (
	<div className="screen-container">
		<h2 className="screen-subtitle">
			{result === "win" ? "You Win!" : "Game Over"}
		</h2>
		<button className="screen-button" onClick={() => setGameState("main_menu")}>
			Main Menu
		</button>
		<button className="screen-button" onClick={() => setGameState("run_settings")}>
			Play Again
		</button>
	</div>
);

export default GameOverScreen;
