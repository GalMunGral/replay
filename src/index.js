import { render } from "lib";
import App from "./components/App";

const app = /* use-transform */ App();
const container = document.querySelector("#app");

render(app, container);
