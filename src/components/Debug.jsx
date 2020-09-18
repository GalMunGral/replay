import throttle from "lodash/throttle";
import { decorator as $$ } from "replay/utils";
import googleLogo from "../assets/images/google.png";
import robotImage from "../assets/images/robot.png";

var someColor = "gray";

const Debug = function () {
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
      <p>
        <Hint color={someColor}>That’s all we know.</Hint>
      </p>
      <input
        type="color"
        oninput={throttle((e) => {
          someColor = e.target.value;
          this.forceUpdate();
        }, 30)}
      />
    </Centered>,
  ];
};

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
`;
