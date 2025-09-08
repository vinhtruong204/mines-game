import { EventEmitter } from "events";

export const globalEmitter = new EventEmitter();

// listen
// globalEmitter.on("gameStateChange", (winner: string) => {
//     console.log("Game over! Winner:", winner);
// });

// emit
// globalEmitter.emit("gameStateChange", "Alice");
