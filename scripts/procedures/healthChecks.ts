import { healthUtil, types as T, util } from "../deps.ts";

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
  // Real liveness: probe the node's REST API (via nginx's exact /version proxy) instead of just
  // checking a file exists — so a node that HANGS after publishing its pairing file no longer shows
  // green. Unlike healthUtil.checkWebUrl (which ignores HTTP status), we inspect it: any response
  // below 500 means the API answered and the node is up (a 401 from the auth filter still proves
  // the server is alive); a 5xx — including nginx's 502 when the node is down — or a network error
  // (nginx itself down) means not-ready. This probe also covers the nginx interface, since it rides
  // through it, so it replaces the old existence-only status-page check.
  async "node-alive"(effects, duration) {
    const guard = healthUtil.guardDurationAboveMinimum({ duration, minimumTime: 5000 });
    if (guard) return guard;
    try {
      const res = await effects.fetch("http://bisq-node.embassy:8091/api/v1/settings/version");
      return res.status < 500
        ? util.ok
        : util.errorCode(60, `Node API not ready yet (HTTP ${res.status})`);
    } catch (_e) {
      return util.errorCode(60, "Node API not reachable yet");
    }
  },
};
