import React from "react";

const LoadingScreen = ({ error, loading, message }) => (
	<div className="screen-container">
		{error ? (
			<>
				<h2 className="screen-error">Error</h2>
				<p className="screen-text">{error}</p>
			</>
		) : loading ? (
			<>
				<h2 className="screen-subtitle">Loading...</h2>
				<p className="screen-text">
					{message || "Generating dungeon, please wait."}
				</p>
			</>
		) : null}
	</div>
);

export default LoadingScreen;
