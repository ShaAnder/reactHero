/**
 * MainMenu
 * Entry screen: start new run, open settings, view highscores.
 */
const MainMenu = ({ setGameState }) => {
	return (
		<div className="screen-container">
			<h1 className="screen-title">ReactDivers</h1>
			<p className="screen-text">
				Welcome to the dungeon crawler! Select your options and start your run.
			</p>
			<button
				className="screen-button"
				onClick={() => setGameState("run_settings")}
			>
				New Run
			</button>
			<button
				className="screen-button"
				onClick={() => setGameState("settings")}
			>
				Settings
			</button>
			<button
				className="screen-button"
				onClick={() => setGameState("highscores")}
			>
				Highscores
			</button>
		</div>
	);
};

export default MainMenu;
