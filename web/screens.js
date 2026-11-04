import {createRegistry} from './screen-registry.js';
import {screenModules} from './screens/catalog.js';
export const screens=createRegistry(screenModules);

