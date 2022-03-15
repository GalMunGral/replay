import { decor } from "@replay/common";

export const Button = decor.button`
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

`.and`:hover {
    background: var(--light-gray);
  }
`.and`:hover i {
    filter: brightness(0.8);
  }
`.and`:active {
    background: var(--gray);
  }
`;

export const Icon = decor.i`
  color: gray;
`;
