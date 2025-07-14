const MainMenu = ({ setGameState }) => {
	return (
		<div style={{ textAlign: "center", marginTop: 80 }}>
			<h1>ReactDivers</h1>
			<p>
				Welcome to the dungeon crawler! Select your options and start your run.
			</p>
			<button onClick={() => setGameState("run_settings")}>New Run</button>
			<button onClick={() => setGameState("settings")}>Settings</button>
			<button onClick={() => setGameState("highscores")}>Highscores</button>
		</div>
	);
};

export default MainMenu;
