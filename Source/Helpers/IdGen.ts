import { randomBytes } from "crypto";


export function RequestIdGen() {
  return "req_" + randomBytes(16).toString("hex");
}