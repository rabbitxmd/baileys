let wrtcModule = null;
/** Loads `@roamhq/wrtc` lazily, so only a process that dials a relay loads the native addon. */
function loadWrtc() {
    if (!wrtcModule) {
        wrtcModule = import('@roamhq/wrtc')
            .then((mod) => mod.default ?? mod)
            .catch((err) => {
            wrtcModule = null;
            throw err;
        });
    }
    return wrtcModule;
}
/** Builds a relay leg's peer connection on `@roamhq/wrtc`. */
export async function createWrtcPeerConnection(configuration) {
    const wrtc = await loadWrtc();
    return new wrtc.RTCPeerConnection(configuration);
}
