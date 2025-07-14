import React from "react";

const RunSettingsScreen = ({
	setGameState,
	environment,
	setEnvironment,
	setRegenKey,
}) => (
	<div style={{ textAlign: "center", marginTop: 80 }}>
		<h2>Run Settings</h2>
		<div style={{ margin: 16 }}>
			<label>Environment: </label>
			<select
				value={environment}
				onChange={(e) => setEnvironment(e.target.value)}
			>
				<option value="forest">Forest</option>
				<option value="cavern">Cavern</option>
			</select>
		</div>
		{/* Add more run settings as needed */}
		<button
			onClick={() => {
				setRegenKey((prev) => prev + 1);
				setGameState("loading");
			}}
		>
			Start Run
		</button>
		<button onClick={() => setGameState("main_menu")}>Back</button>
	</div>
);

export default RunSettingsScreen;
