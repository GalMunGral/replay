declare const __DEBUG__: boolean;
declare const LOG: Function;

declare module "window" {
  global {
    interface Window {
      requestIdleCallback(callback: Function, options?: Object): number;
      cancelIdleCallback(handle: number): void;
    }
  }
}
