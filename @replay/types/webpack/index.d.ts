declare const __DEBUG__: boolean;
declare const LOG: Function;

declare module "window" {
  global {
    interface IdleDeadline {
      didTimeout: boolean;
      timeRemaining(): DOMHighResTimeStamp;
    }

    type IdleCallback = (deadline: IdleDeadline) => any;

    interface Window {
      requestIdleCallback(callback: IdleCallback, options?: Object): number;
      cancelIdleCallback(handle: number): void;
    }
  }
}
