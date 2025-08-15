import React from "react";
import Modal from "../Modal";
import OptionsDialog from "../../gameScreens/dialogs/OptionsDialog";

/*
HOW THIS FILE WORKS
Simple conditional wrapper that mounts the options/settings dialog inside the
generic Modal shell. Parent provides `onClose` which is wired both to the
Modal close affordance and passed into the dialog for internal buttons.

Why separate wrapper? Keeps higher level screens agnostic of dialog markup
and lets us swap dialog implementation without touching callers.
*/
export function OptionsModal({ open, onClose }) {
	if (!open) return null;
	return (
		<Modal open onClose={onClose}>
			<OptionsDialog onClose={onClose} />
		</Modal>
	);
}
