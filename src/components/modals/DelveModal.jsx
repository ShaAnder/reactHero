import React from "react";
import Modal from "../Modal";
import DelveDeeperDialog from "../../gameScreens/dialogs/DelveDeeperDialog";

/*
HOW THIS FILE WORKS
Gate wrapper around the DelveDeeperDialog. Only renders when `open` is true.
Used when the player stands on the exit before the final level so they can
decide to advance (onYes) or remain exploring (onNo). For the final level the
flow bypasses this modal and triggers win state elsewhere.

Props
- open: boolean flag controlling mount/unmount.
- isFinalLevel: forwarded so dialog copy can change if needed.
- onYes / onNo: callbacks from parent state machine layer.

Thin by design to keep presentation and state separate.
*/
export function DelveModal({ open, isFinalLevel, onYes, onNo }) {
	if (!open) return null;
	return (
		<Modal open onClose={onNo}>
			<DelveDeeperDialog
				isFinalLevel={isFinalLevel}
				onYes={onYes}
				onNo={onNo}
			/>
		</Modal>
	);
}
