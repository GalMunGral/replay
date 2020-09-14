import { decorator as $$ } from "replay/utils";

export const MenuIcon = $$.i`
  width: 1rem;
  font-size: 1rem;
`;

export const MenuItem = $$.div`
  --size: 35px;
  height: var(--size);
  min-height: var(--size);
  line-height: 1rem;
  width: ${({ hidden }) => (hidden ? "var(--size)" : "80%")};
  padding: 0 ${({ hidden }) => (hidden ? "0" : "10px")};
  margin: 0 ${({ hidden }) => (hidden ? "10px" : "0")};
  display: flex;
  align-items: center;
  justify-content: ${({ hidden }) => (hidden ? "center" : "start")};
  border-top-right-radius: calc(0.5 * var(--size));
  border-bottom-right-radius: calc(0.5 * var(--size));
  border-top-left-radius: ${({ hidden }) =>
    hidden ? "calc(0.5 * var(--size))" : "0"};
  border-bottom-left-radius: ${({ hidden }) =>
    hidden ? "calc(0.5 * var(--size))" : "0"};
  background: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: ${({ activated }) => (activated ? "700" : "600")};
  color: ${({ activated }) => (activated ? "var(--theme)" : "gray")};
  background: ${({ activated }) =>
    activated ? "var(--theme-light)" : "white"};
  transition: all 0.2s;

`.$`:hover {
    background: ${({ activated }) =>
      activated ? "var(--theme-light)" : "var(--light-gray)"};
  }
`.$`:active {
    background: ${({ activated }) =>
      activated ? "var(--theme-light)" : "var(--gray)"};
  }
`.$` > i {
    margin: 0 ${({ hidden }) => (hidden ? "0" : "20px")};
    color: inherit;
  }
`.$` * {
    pointer-events: none;
  }
`;
