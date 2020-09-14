import { decorator as $$ } from "replay/utils";

const IconButton = ({ type, onclick }) => [
  <Button
    onclick={onclick}
    onmousedown={(e) => e.stopPropagation()}
    onmouseup={(e) => e.stopPropagation()}
  >
    <Icon className={`fas fa-${type}`} />
  </Button>,
];

export default IconButton;

const Button = $$.button`
  --size: 40px;
  border: none;
  outline: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  width: var(--size);
  height: var(--size);
  border-radius: calc(0.5 * var(--size));
  cursor: pointer;

`.$`:hover {
    background: var(--light-gray);
  }
`.$`:hover i {
    filter: brightness(0.8);
  }
`.$`:active {
    background: var(--gray);
  }
`;

const Icon = $$.i`
  color: gray;
`;
