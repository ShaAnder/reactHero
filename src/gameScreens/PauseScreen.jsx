import React from "react";

const PauseScreen = ({ setGameState }) => (
	<div className="screen-container">
		<h2 className="screen-subtitle">Game Paused</h2>
		<button className="screen-button" onClick={() => setGameState("playing")}>
			Resume
		</button>
		<button className="screen-button" onClick={() => setGameState("main_menu")}>
			Main Menu
		</button>
	</div>
);

export default PauseScreen;
