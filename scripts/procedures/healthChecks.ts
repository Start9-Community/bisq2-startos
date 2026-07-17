import { types as T, util } from "../deps.ts";

// Healthy ("passing") once the node has published a pairing code — i.e. the container has written
// start9/stats.yaml (see write-stats.sh). Until then, report "starting" (errorCode 60).
//
// StartOS 0.3.x health results use the SDK's ResultType: `util.ok` for passing, `util.errorCode(60,
// msg)` for the "Starting" state, `util.error(msg)` for a failure — NOT a raw {result,message}.
export const health: T.ExpectedExports.health = {
  async "pairing-ready"(effects, _duration) {
    return effects
      .metadata({ volumeId: "main", path: "start9/stats.yaml" })
      .then(() => util.ok)
      .catch(() =>
        util.errorCode(60, "Node is starting — waiting for the pairing code to be published"),
      );
  },
};
