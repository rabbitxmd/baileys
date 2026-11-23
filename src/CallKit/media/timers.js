/** Lets a timer stop holding a Node process open; a no-op on a browser's numeric id. */
export function unrefTimer(timer) {
    ;
    timer.unref?.();
}
