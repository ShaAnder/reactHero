import React from "react";

const PauseScreen = ({ setGameState }) => (
	<div style={{ textAlign: "center", marginTop: 80 }}>
		<h2>Game Paused</h2>
		<button onClick={() => setGameState("playing")}>Resume</button>
		<button onClick={() => setGameState("main_menu")}>Main Menu</button>
	</div>
);

export default PauseScreen;
