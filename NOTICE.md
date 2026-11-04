# RabbitXmd Baileys Notices

RabbitXmd Baileys is an independently maintained fork/distribution in the Baileys ecosystem.

The upstream copyright and permission notice are preserved in `LICENSE`. Portions of the codebase derive from or were influenced by upstream Baileys work and subsequent forks, including the ItsLia lineage used as a development base.

The integrated MessageBuilder retains its original author/watermark notice in `src/MessageBuilder/index.js`.

The VoIP calling stack in `src/Voip/` derives from work by ShellTear, whose `baileys-caller` project first showed the WhatsApp Web VoIP WASM engine could be driven from Node. It has been ported to ESM, reworked to run on the caller's existing socket, and maintained here since. The WhatsApp Web resources it drives are vendored unmodified under `src/assets/wasm/`, with their provenance, checksums and capability surface described in the README there.

RabbitXmd-specific maintenance, packaging, compatibility changes, integrations, and ongoing development are maintained under the `@whiskeysockets/baileys` import identity (package `rabbitxmd-baileys`).
