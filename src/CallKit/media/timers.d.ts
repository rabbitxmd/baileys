/** Lets a timer stop holding a Node process open; a no-op on a browser's numeric id. */
export declare function unrefTimer(timer: ReturnType<typeof setTimeout>): void;
