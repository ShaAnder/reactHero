// Re-export the root gameConfig so imports can be centralized via constants/ if desired.
export * from "../../../gameConfig";

/*
HOW THIS FILE WORKS
This file is a pass-through to the root-level gameConfig.js. Keep the single
source of truth at the project root; import from here when you want to keep
paths consistent under src/constants.
*/

