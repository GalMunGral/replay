import { decorator as $$, stop } from "replay/utils";

const Checkbox = ({ checked, onchange }) => [
  <Clickable onclick={stop()} onchange={onchange}>
    <div>
      <Background checked={checked} />
      <CheckMark checked={checked}>
        <i className="fas fa-check" />
      </CheckMark>
      <input type="checkbox" checked={checked} />
    </div>
  </Clickable>,
];

export default Checkbox;

const Background = $$.div`
  --border-size: 2px;
  margin: 0;
  position: absolute;
  width: 0.8rem;
  height: 0.8rem;
  left: calc(0px - var(--border-size));
  top: calc(0px - var(--border-size));
  border: var(--border-size) solid
    ${({ checked }) => (checked ? "gray" : "var(--gray)")};
  background: ${({ checked }) => (checked ? "gray" : "white")};
  border-radius: 3px;
  pointer-events: none;
  transform: scale(${({ checked }) => (checked ? 2 : 1)});
  opacity: ${({ checked }) => (checked ? 0 : 1)};
  transition: all ${({ checked }) => (checked ? "0.2s" : 0)};
`;

const CheckMark = $$.div`
  --border-size: 2px;
  margin: 0;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.8rem;
  height: 0.8rem;
  left: calc(0px - var(--border-size));
  top: calc(0px - var(--border-size));
  border: var(--border-size) solid
    ${({ checked }) => (checked ? "gray" : "var(--light-gray)")};
  background: ${({ checked }) => (checked ? "gray" : "white")};
  border-radius: 3px;
  pointer-events: none;
  color: var(--light-gray);
  font-size: 0.8rem;
  transform: scale(${({ checked }) => (checked ? 1 : 0)});
  transition: transform 0.2s;
`;

const Clickable = $$.div`
  --size: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: calc(0.5 * var(--size));
`.$`:hover {
  background: ${({ checked }) => (checked ? "none" : "var(--light-gray)")};
}
`.$` > div {
  flex: 0 0 auto;
  position: relative;
  width: 0.8rem;
  height: 0.8rem;
  margin: 5px;
}
`.$` > div > input {
  opacity: 0;
  width: 1rem;
  height: 1rem;
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  cursor: pointer;
}
`;
