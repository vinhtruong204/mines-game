import { EventEmitter } from "events";

export const globalEmitter = new EventEmitter();

globalEmitter.setMaxListeners(20);