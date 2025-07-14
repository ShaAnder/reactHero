import React from "react";

const LandingScreen = ({ setGameState }) => (
	<div className="landing-screen">
		<h1>Raycasting Dungeon Crawler</h1>
		<button onClick={() => setGameState("main_menu")}>Start Game</button>
	</div>
);

export default LandingScreen;
