import { useReducer } from "react";

// Our run status which will be utilized throughout the app
export const RUN_STATUS = {
	IDLE: "idle",
	IN_PROGRESS: "inProgress",
	WON: "won",
	ABORTED: "aborted",
};

// Initial unified application state shape, which will be passed to reducer
// - run: data about the current adventure/run
// - ui: overlay / modal visibility flags
// - exit: whether player stands on the exit tile (edge detection helper)
// - meta: debug & timing metadata
const initialState = {
	run: {
		environment: null,
		length: null,
		level: null,
		status: RUN_STATUS.IDLE,
	},
	ui: {
		// 'pause' | 'options' | 'quit' | 'delve' | null
		activeModal: null,
	},
	exit: {
		onExitTile: false,
	},
	meta: {
		loadingStartAt: null,
		lastAction: null,
	},
};

// Pure Reducer to allow us to utilize initial state without mutating it
function appStateMachineReducer(state, action) {
	switch (action.type) {
		// ================= RUN LIFECYCLE =================
		case "START_RUN": {
			// this means run already started
			if (state.run.status === RUN_STATUS.IN_PROGRESS) {
				console.log(
					"[REDUCER] START_RUN ignored (already in progress)",
					state.run
				);
				return state;
			}
			console.log("[REDUCER] START_RUN", {
				env: action.env,
				length: action.length,
			});
			return {
				...state,
				run: {
					environment: action.env,
					length: action.length,
					level: 1,
					status: RUN_STATUS.IN_PROGRESS,
				},
				ui: { activeModal: null },
				exit: { onExitTile: false },
				meta: { ...state.meta, lastAction: action.type },
			};
		}
		case "ABORT_RUN":
			console.log("[REDUCER] ABORT_RUN");
			return {
				...state,
				run: { ...state.run, status: RUN_STATUS.ABORTED },
				meta: { ...state.meta, lastAction: action.type },
			};
		case "WIN_RUN":
			console.log("[REDUCER] WIN_RUN");
			return {
				...state,
				run: { ...state.run, status: RUN_STATUS.WON },
				meta: { ...state.meta, lastAction: action.type },
			};
		case "RESET_RUN":
			console.log("[REDUCER] RESET_RUN");
			return {
				...initialState,
				meta: { ...initialState.meta, lastAction: action.type },
			};

		// ================= PAUSE / OPTIONS / QUIT UI =================
		case "SET_ACTIVE_MODAL":
			// we can keep applying this without changing result (idempotent)
			if (state.ui.activeModal === action.modal) {
				console.log("[REDUCER] SET_ACTIVE_MODAL noop", action.modal);
				return state;
			}
			console.log("[REDUCER] SET_ACTIVE_MODAL", {
				from: state.ui.activeModal,
				to: action.modal,
			});
			return {
				...state,
				ui: { ...state.ui, activeModal: action.modal },
				meta: { ...state.meta, lastAction: action.type },
			};

		// ================= EXIT TILE & DELVE =================
		case "PLAYER_STEPPED_ON_EXIT":
			console.log("[REDUCER] PLAYER_STEPPED_ON_EXIT");
			return {
				...state,
				exit: { onExitTile: true },
				meta: { ...state.meta, lastAction: action.type },
			};
		case "PLAYER_LEFT_EXIT":
			console.log("[REDUCER] PLAYER_LEFT_EXIT");
			return {
				...state,
				exit: { onExitTile: false },
				meta: { ...state.meta, lastAction: action.type },
			};
		case "ADVANCE_LEVEL": {
			if (
				state.run.level == null ||
				state.run.length == null ||
				state.run.level >= state.run.length
			)
				return state;
			const nextLevel = state.run.level + 1;
			const finished = nextLevel > state.run.length;
			console.log("[REDUCER] ADVANCE_LEVEL", {
				current: state.run.level,
				next: nextLevel,
				finished,
			});
			return {
				...state,
				run: {
					...state.run,
					level: finished ? state.run.level : nextLevel,
					status: finished ? RUN_STATUS.WON : RUN_STATUS.IN_PROGRESS,
				},
				meta: { ...state.meta, lastAction: action.type },
			};
		}

		// ================= LOADING META =================
		case "SET_LOADING_START":
			console.log("[REDUCER] SET_LOADING_START", action.at);
			return {
				...state,
				meta: {
					...state.meta,
					loadingStartAt: action.at,
					lastAction: action.type,
				},
			};
		case "CLEAR_LOADING_START":
			console.log("[REDUCER] CLEAR_LOADING_START");
			return {
				...state,
				meta: { ...state.meta, loadingStartAt: null, lastAction: action.type },
			};

		default:
			return state;
	}
}

// Hook wrapper: provides state + semantic action creators + derived helpers
export function useAppStateMachine() {
	const [state, dispatch] = useReducer(appStateMachineReducer, initialState);

	const actions = {
		// Run lifecycle
		startRun: (env, length) => dispatch({ type: "START_RUN", env, length }),
		abortRun: () => dispatch({ type: "ABORT_RUN" }),
		win: () => dispatch({ type: "WIN_RUN" }),
		resetRun: () => dispatch({ type: "RESET_RUN" }),
		// Unified modal control
		setActiveModal: (modal) => dispatch({ type: "SET_ACTIVE_MODAL", modal }), // modal null closes
		// Exit tile detection
		playerSteppedOnExit: () => dispatch({ type: "PLAYER_STEPPED_ON_EXIT" }),
		playerLeftExit: () => dispatch({ type: "PLAYER_LEFT_EXIT" }),
		advanceLevel: () => dispatch({ type: "ADVANCE_LEVEL" }),
		// Loading meta
		setLoadingStart: (at = Date.now()) =>
			dispatch({ type: "SET_LOADING_START", at }),
		clearLoadingStart: () => dispatch({ type: "CLEAR_LOADING_START" }),
	};

	// Derived convenience flags
	const isRunActive = state.run.status === RUN_STATUS.IN_PROGRESS;
	const isFinalLevel =
		state.run.level != null &&
		state.run.length != null &&
		state.run.level === state.run.length;

	return { state, actions, isRunActive, isFinalLevel };
}
