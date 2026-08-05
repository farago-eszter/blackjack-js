import { randomUUID } from "crypto";

export const utils = {
  generateId(): string {
    return randomUUID();
  },
};
