import React from "react";
import { GAME_STATES } from "../../hooks/gameLogic/useGameStatus";

const PauseDialog = ({ setGameState }) => (
	<div className="screen-container">
		<h2 className="screen-subtitle" style={{ textAlign: "center" }}>
			Game Paused
		</h2>
		<button
			className="screen-button"
			onClick={() => setGameState(GAME_STATES.PLAYING)}
		>
			Resume
		</button>
		<button
			className="screen-button"
			onClick={() => setGameState(GAME_STATES.MAIN_MENU)}
		>
			Main Menu
		</button>
	</div>
);

export default PauseDialog;
