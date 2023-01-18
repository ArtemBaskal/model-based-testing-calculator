import type { GuardFunc } from "./type";
import type { EventObject } from "xstate";

export const everyGuard =
  <T extends EventObject>(...guards: GuardFunc<T>[]) =>
    (...args: Parameters<GuardFunc<T>>) =>
      guards.every(guard => guard(...args));
