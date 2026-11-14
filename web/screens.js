import {createRegistry} from './screen-registry.js';
import {screenModules} from './screens/catalog.js';
// Removed product functions are migration tombstones, never launchable screens.
export const screens=createRegistry(screenModules,['readiness','event-oms','attribution','correlation','diagnostics']);
