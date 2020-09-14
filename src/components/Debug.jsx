import { decorator as $$ } from "replay/utils";
import googleLogo from "../assets/images/google.png";
import robotImage from "../assets/images/robot.png";

const Debug = () => {
  return [
    <div />,
    <Centered>
      <Logo src={googleLogo} />
      <PullRight src={robotImage} />
      <p>
        <strong>404. </strong>
        <Hint>That’s an error.</Hint>
      </p>
      <p>
        The requested URL <code>{location.pathname}</code> was not found on this
        server.
      </p>
      <Hint>That’s all we know.</Hint>
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
  color: gray;
`;
