# TODO

- [ ] Verify on `aarch64`. The port has been built, installed and exercised end to
      end on `x86_64` only. The image is multi-arch, but the cold-start timing
      differs enough on ARM that the daemon's five-minute `gracePeriod` is worth
      re-checking there.
- [ ] Backup and restore sanity check — confirm a restored node comes back on the
      same onion address and that an already-paired device still works.
- [ ] Decide whether to offer LAN access. The node supports a `CLEAR` access
      transport instead of Tor, which would let Bisq Connect reach it over the
      LAN, but it needs `application.api.accessTransportType` and `bind.host`
      overridden, and Bisq Connect's support for pairing that way has not been
      confirmed. Tor-only is the current, verified behavior.
- [ ] Consider surfacing the pairing-code lifetime as a config action. The image
      entrypoint reads `PAIRING_TTL_SECONDS` and this package leaves it at the
      entrypoint's 24-hour default.
