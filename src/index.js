import { render } from "@runtime";
import App from "@components/App/App";
import "@assets/style.css";
import "@assets/favicon.ico";

if (process.env.NODE_ENV === "production") {
  import("@fortawesome/fontawesome-free/css/all.min.css");
} else {
  import("@fortawesome/fontawesome-free/css/all.css");
}

window.addEventListener("load", () => {
  render(/* use-transform */ App(), document.body);
});
