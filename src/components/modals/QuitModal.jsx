import React from "react";
import Modal from "../Modal";
import QuitConfirmDialog from "../../gameScreens/dialogs/QuitConfirmDialog";

/*
HOW THIS FILE WORKS
Confirmation gate before abandoning a run. Mounts only when `open` so game
logic does not need extra guards. User either confirms (onConfirm) which the
parent interprets as abort, or cancels (onCancel) and play resumes. Uses the
shared Modal wrapper for consistent styling / focus trapping.
*/
export function QuitModal({ open, onConfirm, onCancel }) {
	if (!open) return null;
	return (
		<Modal open onClose={onCancel}>
			<QuitConfirmDialog onConfirm={onConfirm} onCancel={onCancel} />
		</Modal>
	);
}
