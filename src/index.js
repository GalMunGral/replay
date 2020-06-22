import { render } from "@runtime";
import App from "@components/App/App";

const app = /* use-transform */ App();
const container = document.querySelector("#app");

render(app, container);
