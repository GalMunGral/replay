import { createStore, thunkMiddleware } from "replay/utils";
import mails from "./mails";
import editor from "./editor";
import selection from "./selection";

const loggerMiddleware = (store) => (next) => (action, ...args) => {
  next(action, ...args);
  console.log(`[Logger] ${action} =>`, store.getSnapshot());
};

const store = createStore({
  modules: { mails, selection, editor },
  middlewares: [thunkMiddleware, loggerMiddleware],
});

store.dispatch(async (dispatch) => {
  const res = await fetch("/data.json");
  const data = await res.json();
  dispatch("mails/load", { folder: "inbox", data });
});

export default store;
