import { randomUUID } from "node:crypto";

const globalForInstance = globalThis as unknown as {
  instanceId?: string;
};

export const INSTANCE_ID = globalForInstance.instanceId ?? randomUUID();

globalForInstance.instanceId = INSTANCE_ID;
