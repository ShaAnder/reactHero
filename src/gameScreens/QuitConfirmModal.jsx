import React from "react";

const QuitConfirmModal = ({ onConfirm, onCancel }) => (
	<div className="quit-confirm-modal">
		<h3>Are you sure you want to quit?</h3>
		<button onClick={onConfirm}>Yes</button>
		<button onClick={onCancel}>No</button>
	</div>
);

export default QuitConfirmModal;
