import throttle from "lodash/throttle";
import { decorator as $$ } from "replay/utils";
import googleLogo from "../assets/images/google.png";
import robotImage from "../assets/images/robot.png";
import { observable, autorun } from "replay/core";

var someColor = "gray";

const a = observable({
  text: "",
});

const b = observable({
  get count() {
    return a.text.length;
  },
});

const c = observable({
  get formattedCount() {
    return ` (count: ${b.count})`;
  },
});

const d = observable({
  get reversed() {
    return a.text.split("").reverse().join("") + c.formattedCount;
  },
});

function Debug({}, {}, context) {
  context.emit(() => {
    autorun(() => {
      document.querySelector("#search").value = d.reversed;
    });
  });
  return [
    <div>{/* placeholder */}</div>,
    <Centered>
      <Logo src={googleLogo} />
      <PullRight src={robotImage} />
      <p>
        <strong>404. </strong>
        <Hint color={someColor}>That’s an error.</Hint>
      </p>
      <p>
        The requested URL <code>{location.pathname}</code> was not found on this
        server.
      </p>
      <p style={{ display: "flex", alignItems: "center" }}>
        <Hint id="editable" color={someColor}>
          That’s all we know.
        </Hint>
      </p>

      <h5>reactivity + direct DOM manipulation</h5>
      <input oninput={(e) => (a.text = e.target.value)} />

      <h5>renderer + manual invalidation (forced updates)</h5>
      <input
        type="color"
        oninput={throttle((e) => {
          someColor = e.target.value;
          this.invalidate();
        }, 30)}
      />
    </Centered>,
  ];
}

export default Debug;

const Centered = $$.div`
font-size: 1rem;
width: 500px;
margin: 100px auto;
`;

const Logo = $$.img`
  height: 50px
`;

const PullRight = $$.img`
  float: right;
`;

const Hint = $$.span`
  color: ${({ color }) => color};
  font-weight: 600;
`.$` code {
  font-family: Courier;
}`;
