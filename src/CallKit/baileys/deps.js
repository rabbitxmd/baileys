import { parseSignalAddressFromJid, signalAddressToJid } from '../compat/protocol.js';
function userOf(jid) {
    const at = jid.indexOf('@');
    const head = at === -1 ? jid : jid.slice(0, at);
    const colon = head.indexOf(':');
    return colon === -1 ? head : head.slice(0, colon);
}
function serverOf(jid) {
    const at = jid.indexOf('@');
    return at === -1 ? 's.whatsapp.net' : jid.slice(at + 1);
}
/** Builds the host dependencies `WaVoipCoordinator` needs out of a live Baileys socket. */
export function createBaileysDeps(sock) {
    const deps = {
        authClient: {
            getCurrentCredentials: () => {
                const creds = sock.authState.creds;
                if (!creds.me?.id)
                    return null;
                const account = creds.account;
                return {
                    meJid: creds.me.id,
                    meLid: creds.me.lid ?? null,
                    // Same shape Baileys puts in a message's <device-identity>: the account
                    // signature key is left out.
                    signedIdentity: account
                        ? {
                            details: account.details,
                            accountSignature: account.accountSignature,
                            deviceSignature: account.deviceSignature
                        }
                        : null
                };
            }
        },
        lowLevelCoordinator: {
            sendNode: async (node) => {
                await sock.sendNode(node);
            }
        },
        signalDeviceSync: {
            async syncDeviceList(jids) {
                const devices = await sock.getUSyncDevices([...jids], false, false);
                const byUser = new Map();
                for (const jid of jids)
                    byUser.set(userOf(jid), []);
                for (const entry of devices) {
                    const list = byUser.get(entry.user);
                    if (!list)
                        continue;
                    const device = entry.device ?? 0;
                    const server = entry.server ??
                        serverOf(jids.find((jid) => userOf(jid) === entry.user) ?? '');
                    list.push(entry.jid ??
                        signalAddressToJid({ user: entry.user, server, device }));
                }
                return jids.map((jid) => ({
                    jid,
                    deviceJids: byUser.get(userOf(jid)) ?? []
                }));
            },
            async queryLidsByPhoneJids(jids) {
                const lookup = sock.signalRepository.lidMapping?.getLIDForPN;
                if (!lookup)
                    return jids.map(() => null);
                const mapping = sock.signalRepository.lidMapping;
                return Promise.all(jids.map(async (jid) => {
                    try {
                        const lid = await mapping.getLIDForPN(jid);
                        return lid ? { lidJid: lid } : null;
                    }
                    catch {
                        return null;
                    }
                }));
            }
        },
        sessionResolver: {
            async ensureSessionsBatch(jids) {
                await sock.assertSessions([...jids], false);
                return jids.map((jid) => ({
                    address: parseSignalAddressFromJid(jid),
                    session: null
                }));
            }
        },
        signalProtocol: {
            async encryptMessagesBatch(items) {
                return Promise.all(items.map(async (item) => {
                    const { type, ciphertext } = await sock.signalRepository.encryptMessage({
                        jid: signalAddressToJid(item.address),
                        data: item.plaintext
                    });
                    return { type, ciphertext };
                }));
            },
            decryptMessage: (address, input) => sock.signalRepository.decryptMessage({
                jid: signalAddressToJid(address),
                type: input.type,
                ciphertext: input.ciphertext
            })
        },
        messageDispatch: {
            syncSignalSession: (jid) => sock.assertSessions([jid], false)
        },
        // A Baileys socket is always a linked companion device.
        isMobilePrimary: () => false
    };
    const stores = {
        privacyToken: {
            async getByJid(jid) {
                try {
                    const user = userOf(jid);
                    const found = await sock.authState.keys.get('tctoken', [
                        `${user}@${serverOf(jid)}`
                    ]);
                    const entry = Object.values(found ?? {})[0];
                    const token = entry?.token ?? entry?.tcToken;
                    return token ? { tcToken: token } : null;
                }
                catch {
                    return null;
                }
            }
        }
    };
    return { deps, stores };
}
