import React from "react";

/**
 * RunSettingsScreen
 * Choose environment + run length before starting a run.
 * Dispatches selections into the app state machine (only meaningful while run is IDLE).
 */

const RunSettingsScreen = ({
	setGameState, // screen state setter
	environment, // current environment selection
	setEnvironment, // dispatcher for environment
	length, // selected run length (levels)
	setLength, // dispatcher for length
}) => (
	<div className="screen-container">
		<h2 className="screen-subtitle">Run Settings</h2>
		{/* Environment selection */}
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
		{/* Run length radio group */}
		<div className="settings-option" style={{ marginTop: 20 }}>
			<label className="settings-label">Adventure Length:</label>
			<div style={{ display: "flex", gap: 16, marginTop: 8 }}>
				<label>
					<input
						type="radio"
						name="adventureLength"
						value={1}
						checked={length === 1}
						onChange={() => setLength(1)}
					/>
					XShort (1 map)
				</label>
				<label>
					<input
						type="radio"
						name="adventureLength"
						value={3}
						checked={length === 3}
						onChange={() => setLength(3)}
					/>
					Short (3 maps)
				</label>
				<label>
					<input
						type="radio"
						name="adventureLength"
						value={5}
						checked={length === 5}
						onChange={() => setLength(5)}
					/>
					Medium (5 maps)
				</label>
				<label>
					<input
						type="radio"
						name="adventureLength"
						value={10}
						checked={length === 10}
						onChange={() => setLength(10)}
					/>
					Long (10 maps)
				</label>
			</div>
		</div>
		{/* Moves app into LOADING; run actually starts inside loading transition hook */}
		<button
			className="screen-button"
			style={{ marginTop: 24 }}
			onClick={() => {
				setGameState("loading");
			}}
		>
			Start Run
		</button>
		{/* Return to main menu without starting a run */}
		<button className="screen-button" onClick={() => setGameState("main_menu")}>
			Back
		</button>
	</div>
);

export default RunSettingsScreen;
