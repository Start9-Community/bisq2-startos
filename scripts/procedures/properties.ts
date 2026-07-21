// Surfaces the service "properties" (the pairing code, with a scannable QR) from the stats.yaml the
// container writes to <volume>/start9/stats.yaml. The node's onion address is encoded inside the
// pairing code, not published separately. compat.properties reads + renders it.
import { compat, types as T } from "../deps.ts";

export const properties: T.ExpectedExports.properties = compat.properties;
