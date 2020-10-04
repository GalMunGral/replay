import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "./assets/style.css";
import "./assets/favicon.ico";

import { render } from "replay/core";
import App from "./components/App";

render([<App />], document.body);
