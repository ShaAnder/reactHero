import React from "react";

const SettingsScreen = ({ setGameState, onClose }) => (
	<div className="settings-screen">
		<h2>Settings</h2>
		{/* Add settings controls here */}
		<button
			className="screen-button"
			onClick={() => {
				if (onClose) {
					onClose();
				} else if (setGameState) {
					setGameState("main_menu");
				}
			}}
		>
			Back
		</button>
	</div>
);

export default SettingsScreen;
