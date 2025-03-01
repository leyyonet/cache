import {CacheHub} from "./types";
import {CacheHubImpl} from "./cache-hub-impl";

export * from './types';
export const cacheHub: CacheHub = new CacheHubImpl();