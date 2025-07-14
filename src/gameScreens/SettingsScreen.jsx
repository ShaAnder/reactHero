import React from "react";

const SettingsScreen = ({ setGameState }) => (
	<div className="settings-screen">
		<h2>Settings</h2>
		{/* Add settings controls here */}
		<button onClick={() => setGameState("main_menu")}>Back</button>
	</div>
);

export default SettingsScreen;
