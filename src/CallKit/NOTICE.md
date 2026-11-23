# Notice

`src/CallKit/` is compiled from two MIT-licensed projects:

- `baileys-call-kit` 0.1.0 (`baileys/`, `compat/`, `index`): the Baileys adapter. License in `LICENSE.baileys-call-kit`.
- zapo (https://github.com/vinikjkkj/zapo), copyright (c) 2026 vinikjkkj, license in `LICENSE.zapo`:
  - `core/` is `@zapo-js/voip` 1.4.0.
  - `media/` is `@zapo-js/voip-media` 0.3.0 (relay transport, STUN, SRTP, RTP/RTCP, MLow codec), without its browser host.

The TypeScript was compiled to ES2022 modules. The only source edits were the imports of
`@zapo-js/voip-media`, which now point at `media/`. `@roamhq/wrtc` and `libmlow-wasm-fork` stay
optional peer dependencies, loaded when a call starts media.
