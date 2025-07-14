import React from "react";

const GameOverScreen = ({ result, setGameState }) => (
	<div style={{ textAlign: "center", marginTop: 80 }}>
		<h2>{result === "win" ? "You Win!" : "Game Over"}</h2>
		<button onClick={() => setGameState("main_menu")}>Main Menu</button>
		<button onClick={() => setGameState("playing")}>Play Again</button>
	</div>
);

export default GameOverScreen;
