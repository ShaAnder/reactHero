import React from "react";
import "../main.css";

const Modal = ({ open, children, className = "" }) => {
	if (!open) return null;
	return (
		<div className="modal-backdrop">
			<div
				className={`modal-content ${className}`}
				style={{
					position: "fixed",
					zIndex: 1000,
					left: "50%",
					top: "50%",
					transform: "translate(-50%, -50%)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
};

export default Modal;
