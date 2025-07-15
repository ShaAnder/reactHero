import React from "react";

const RunSettingsScreen = ({
	setGameState,
	environment,
	setEnvironment,
	setRegenKey,
}) => (
	<div className="screen-container">
		<h2 className="screen-subtitle">Run Settings</h2>
		<div className="settings-option">
			<label className="settings-label">Environment: </label>
			<select
				className="settings-select"
				value={environment}
				onChange={(e) => setEnvironment(e.target.value)}
			>
				<option value="forest">Forest</option>
				<option value="cavern">Cavern</option>
			</select>
		</div>
		{/* Add more run settings as needed */}
		<button
			className="screen-button"
			onClick={() => {
				setRegenKey((prev) => prev + 1);
				setGameState("loading");
			}}
		>
			Start Run
		</button>
		<button className="screen-button" onClick={() => setGameState("main_menu")}>
			Back
		</button>
	</div>
);

export default RunSettingsScreen;
