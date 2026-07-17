// Surfaces the service "properties" (pairing code + QR, onion address) from the stats.yaml the
// container writes to <volume>/start9/stats.yaml. compat.properties reads + renders it.
import { compat, types as T } from "../deps.ts";

export const properties: T.ExpectedExports.properties = compat.properties;
