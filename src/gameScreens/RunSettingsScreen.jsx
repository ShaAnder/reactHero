import React from "react";

const RunSettingsScreen = ({
	setGameState,
	environment,
	setEnvironment,
	adventureLength,
	setAdventureLength,
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
		<div className="settings-option" style={{ marginTop: 20 }}>
			<label className="settings-label">Adventure Length:</label>
			<div style={{ display: "flex", gap: 16, marginTop: 8 }}>
				<label>
					<input
						type="radio"
						name="adventureLength"
						value={1}
						checked={adventureLength === 1}
						onChange={() => setAdventureLength(1)}
					/>
					XShort (1 map)
				</label>
				<label>
					<input
						type="radio"
						name="adventureLength"
						value={3}
						checked={adventureLength === 3}
						onChange={() => setAdventureLength(3)}
					/>
					Short (3 maps)
				</label>
				<label>
					<input
						type="radio"
						name="adventureLength"
						value={5}
						checked={adventureLength === 5}
						onChange={() => setAdventureLength(5)}
					/>
					Medium (5 maps)
				</label>
				<label>
					<input
						type="radio"
						name="adventureLength"
						value={10}
						checked={adventureLength === 10}
						onChange={() => setAdventureLength(10)}
					/>
					Long (10 maps)
				</label>
			</div>
		</div>
		<button
			className="screen-button"
			style={{ marginTop: 24 }}
			onClick={() => {
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
