import { type EventObject } from "xstate";
import { type GuardFunc } from "./type";

export const everyGuard =
  <T extends EventObject>(...guards: GuardFunc<T>[]) =>
    (...args: Parameters<GuardFunc<T>>) =>
      guards.every(guard => guard(...args));
