import React from "react";

const QuitConfirmDialog = ({ onConfirm, onCancel }) => (
	<div className="screen-container">
		<h2 className="screen-subtitle" style={{ textAlign: "center" }}>
			Are you sure you want to quit?
		</h2>
		<p style={{ textAlign: "center", margin: "16px 0" }}>
			All progress will be lost.
		</p>
		<button className="screen-button" onClick={onConfirm}>
			Yes, Quit
		</button>
		<button className="screen-button" onClick={onCancel}>
			No, Return to Pause
		</button>
	</div>
);

export default QuitConfirmDialog;
