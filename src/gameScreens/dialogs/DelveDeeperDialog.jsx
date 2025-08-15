import React from "react";

const DelveDeeperDialog = ({ onYes, onNo, isFinalLevel }) => (
	<div className="screen-container">
		<h2 className="screen-subtitle" style={{ textAlign: "center" }}>
			{isFinalLevel ? "End Your Adventure?" : "Delve Deeper?"}
		</h2>
		<p style={{ textAlign: "center", margin: "16px 0" }}>
			{isFinalLevel
				? "You've come a long way. Time to end your adventure?"
				: "Do you want to proceed to the next level?"}
		</p>
		<button className="screen-button" onClick={onYes}>
			{isFinalLevel ? "End Adventure" : "Yes"}
		</button>
		<button className="screen-button" onClick={onNo}>
			{isFinalLevel ? "Stay" : "No"}
		</button>
	</div>
);

export default DelveDeeperDialog;
