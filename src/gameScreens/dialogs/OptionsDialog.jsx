import React from "react";

const OptionsDialog = ({ onClose }) => (
	<div className="screen-container">
		<h2 className="screen-subtitle" style={{ textAlign: "center" }}>
			Options
		</h2>
		{/* Add options controls here, e.g., sound sliders, etc. */}
		<button className="screen-button" onClick={onClose}>
			Back
		</button>
	</div>
);

export default OptionsDialog;
