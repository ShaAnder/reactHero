import React from "react";

const HighscoresScreen = ({ setGameState }) => (
	<div className="highscores-screen">
		<h2>Highscores</h2>
		<p>Coming soon...</p>
		<button onClick={() => setGameState("main_menu")}>Back</button>
	</div>
);

export default HighscoresScreen;
