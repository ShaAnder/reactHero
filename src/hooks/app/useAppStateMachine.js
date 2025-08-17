import { useReducer } from "react";

// Run lifecycle statuses (kept small & explicit for clarity)
export const RUN_STATUS = {
	IDLE: "idle",
	IN_PROGRESS: "inProgress",
	WON: "won",
	ABORTED: "aborted",
};

// Unified reducer state:
// run  – current adventure configuration + progression
// ui   – transient overlay/modal state
// exit – tiny helper slice (player standing on exit tile?)
// meta – instrumentation (last action, timing markers) for effects
const initialState = {
	run: {
		environment: null,
		length: null,
		level: null,
		status: RUN_STATUS.IDLE,
		// Added during state normalization
		seed: null, // deterministic seed for reproducible map sequence
		mapRevision: 0, // bump to reroll current level without advancing
		startedAt: null, // timestamp (ms) when run actually began
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

// Pure reducer (central transition table)
function appStateMachineReducer(state, action) {
	switch (action.type) {
		// ================= RUN LIFECYCLE =================
		case "START_RUN": {
			// Ignore duplicate start attempts
			if (state.run.status === RUN_STATUS.IN_PROGRESS) return state;
			return {
				...state,
				run: {
					environment: action.env,
					length: action.length,
					level: 1,
					status: RUN_STATUS.IN_PROGRESS,
					seed: action.seed ?? Math.floor(Math.random() * 1e9),
					mapRevision: 0,
					startedAt: Date.now(),
				},
				ui: { activeModal: null },
				exit: { onExitTile: false },
				meta: { ...state.meta, lastAction: action.type },
			};
		}
		case "ABORT_RUN":
			return {
				...state,
				run: { ...state.run, status: RUN_STATUS.ABORTED },
				meta: { ...state.meta, lastAction: action.type },
			};
		case "WIN_RUN":
			return {
				...state,
				run: { ...state.run, status: RUN_STATUS.WON },
				meta: { ...state.meta, lastAction: action.type },
			};
		case "RESET_RUN":
			return {
				...initialState,
				meta: { ...initialState.meta, lastAction: action.type },
			};

		// ================= RUN CONFIG (pre-run adjustments) =================
		case "SET_RUN_ENVIRONMENT": {
			if (state.run.status !== RUN_STATUS.IDLE) return state; // lock during active run
			if (state.run.environment === action.env) return state;
			return {
				...state,
				run: { ...state.run, environment: action.env },
				meta: { ...state.meta, lastAction: action.type },
			};
		}
		case "SET_RUN_LENGTH": {
			if (state.run.status !== RUN_STATUS.IDLE) return state;
			if (state.run.length === action.length) return state;
			return {
				...state,
				run: { ...state.run, length: action.length },
				meta: { ...state.meta, lastAction: action.type },
			};
		}

		// ================= PAUSE / OPTIONS / QUIT UI =================
		case "SET_ACTIVE_MODAL":
			// Idempotent: re‑setting same modal returns previous state
			if (state.ui.activeModal === action.modal) return state;
			return {
				...state,
				ui: { ...state.ui, activeModal: action.modal },
				meta: { ...state.meta, lastAction: action.type },
			};

		// ================= EXIT TILE & DELVE =================
		case "PLAYER_STEPPED_ON_EXIT":
			return {
				...state,
				exit: { onExitTile: true },
				meta: { ...state.meta, lastAction: action.type },
			};
		case "PLAYER_LEFT_EXIT":
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
			return {
				...state,
				run: {
					...state.run,
					level: finished ? state.run.level : nextLevel,
					status: finished ? RUN_STATUS.WON : RUN_STATUS.IN_PROGRESS,
					mapRevision: finished ? state.run.mapRevision : 0, // reset reroll counter on new level
				},
				meta: { ...state.meta, lastAction: action.type },
			};
		}

		// ================= MAP REROLL (same level) =================
		case "REGENERATE_MAP": {
			if (state.run.status !== RUN_STATUS.IN_PROGRESS) return state;
			if (state.run.level == null) return state;
			return {
				...state,
				run: {
					...state.run,
					mapRevision: state.run.mapRevision + 1,
				},
				meta: { ...state.meta, lastAction: action.type },
			};
		}

		// ================= LOADING META =================
		case "SET_LOADING_START":
			return {
				...state,
				meta: {
					...state.meta,
					loadingStartAt: action.at,
					lastAction: action.type,
				},
			};
		case "CLEAR_LOADING_START":
			return {
				...state,
				meta: { ...state.meta, loadingStartAt: null, lastAction: action.type },
			};

		default:
			return state;
	}
}

// Hook wrapper: exposes state, semantic action creators, and a few derived flags
export function useAppStateMachine() {
	const [state, dispatch] = useReducer(appStateMachineReducer, initialState);

	const actions = {
		// Run lifecycle
		startRun: (env, length) => dispatch({ type: "START_RUN", env, length }),
		abortRun: () => dispatch({ type: "ABORT_RUN" }),
		win: () => dispatch({ type: "WIN_RUN" }),
		resetRun: () => dispatch({ type: "RESET_RUN" }),
		// Pre-run configuration (only effective while IDLE)
		setRunEnvironment: (env) => dispatch({ type: "SET_RUN_ENVIRONMENT", env }),
		setRunLength: (length) => dispatch({ type: "SET_RUN_LENGTH", length }),
		// Unified modal control
		setActiveModal: (modal) => dispatch({ type: "SET_ACTIVE_MODAL", modal }), // modal null closes
		// Exit tile detection
		playerSteppedOnExit: () => dispatch({ type: "PLAYER_STEPPED_ON_EXIT" }),
		playerLeftExit: () => dispatch({ type: "PLAYER_LEFT_EXIT" }),
		advanceLevel: () => dispatch({ type: "ADVANCE_LEVEL" }),
		regenerateMap: () => dispatch({ type: "REGENERATE_MAP" }), // reroll current level layout
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

/*
HOW THIS FILE WORKS

We centralize all coarse app transitions (run lifecycle + modal visibility)
in a reducer so effects (loading, exit detection, pause logic) have one
authoritative source of truth. Side‑effect hooks dispatch small semantic
actions (e.g. playerSteppedOnExit) and UI consumes derived flags.

Slices
- run: adventure config + progression state
- ui: which modal (if any) should be visible
- exit: transient flag used to debounce exit tile logic
- meta: timing / lastAction for orchestration hooks

Why a reducer?
- Predictable transitions, easier to test.
- Enables time‑travel / debugging later if we add dev tooling.
 
Quick mental model
- initialState defines slices: run (config + progress), ui (current modal), exit (player standing on exit), meta (timing + lastAction only; not gameplay rules).
- dispatch(action) -> reducer(oldState, action) -> newState (returns same object if nothing changed).
- Some actions carry data (env, length); others are just a type.
- meta.lastAction updates only when state really changes; hooks can watch it to react once per transition.
- Pause is inferred from ui.activeModal === 'pause'; level lives in run.level; neither belong in meta.
- If removing a field would break core gameplay/UI, it belongs in run/ui/exit; if not, it can live in meta.
*/
