import { render, hydrate } from "@replay/dom";
import App from "./components/App";

const f = true ? render : hydrate;

f([App], document.querySelector("#app"), {});
