import React from "react";

const LandingScreen = ({ setGameState }) => (
	<div className="landing-screen">
		<h1>reactDiver</h1>
		<button className="screen-button" onClick={() => setGameState("main_menu")}>
			Start Game
		</button>
	</div>
);

export default LandingScreen;
