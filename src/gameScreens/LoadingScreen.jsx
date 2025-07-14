import React from "react";

const LoadingScreen = ({ error, loading, message }) => (
	<div style={{ textAlign: "center", marginTop: 80 }}>
		{error ? (
			<>
				<h2 style={{ color: "red" }}>Error</h2>
				<p>{error}</p>
			</>
		) : loading ? (
			<>
				<h2>Loading...</h2>
				<p>{message || "Generating dungeon, please wait."}</p>
			</>
		) : null}
	</div>
);

export default LoadingScreen;
