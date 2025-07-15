import React from "react";

const LoadingScreen = ({ error, message }) => (
	<div className="screen-container">
		{error ? (
			<>
				<h2 className="screen-error">Error</h2>
				<p className="screen-text">{error}</p>
			</>
		) : (
			<>
				<h2 className="screen-subtitle">Loading...</h2>
				<p className="screen-text">
					{message || "Generating dungeon, please wait."}
				</p>
			</>
		)}
	</div>
);

export default LoadingScreen;
