import React from "react";
import Modal from "../Modal";

/*
HOW THIS FILE WORKS
Pause overlay with three primary actions: resume, open options, or quit.
Rendered only while `open` so keyboard/game loop can remain unaware of its
presence. onContinue resumes play (caller usually re-locks pointer). onQuit
routes to a higher-level confirmation modal or state change. Simple vertical
button stack keeps interaction fast.
*/
export function PauseMenu({ open, onContinue, onOptions, onQuit }) {
	if (!open) return null;
	return (
		<Modal open onClose={onContinue}>
			<h2>Game Paused</h2>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 16,
					alignItems: "stretch",
					marginTop: 24,
				}}
			>
				<button className="screen-button" onClick={onContinue}>
					Continue
				</button>
				<button className="screen-button" onClick={onOptions}>
					Options
				</button>
				<button className="screen-button" onClick={onQuit}>
					Quit
				</button>
			</div>
		</Modal>
	);
}
