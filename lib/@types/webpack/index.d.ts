declare var __DEBUG__: boolean;
declare module "window" {
  global {
    interface Window {
      requestIdleCallback(callback: Function, options?: Object): number;
      cancelIdleCallback(handle: number): void;
    }
  }
}
