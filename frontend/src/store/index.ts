import { proxy } from "valtio";

// keep track of window state
export const windowStore = proxy({ menuActive: true });
