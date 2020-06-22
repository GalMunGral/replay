export const Menu = decor.div`
  grid-area: b;
  overflow: auto;
  transition: width 0.05s ease-out;
  background: white;
  overflow: hidden;
  width: ${({ collapsed }) => (collapsed ? 72 : 250)}px;
  display: flex;
  flex-direction: column;
  align-items: ${({ collapsed }) => (collapsed ? "center" : "start")};
`;

export const MenuIcon = decor.i`
  width: 1rem;
  font-size: 1rem;
`;
export const EditorButtonIcon = decor.img`
  --size: 32px;
  width: var(--size);
  height: var(--size);
`;

export const EditorButton = decor.button`
  --size: 50px;
  width: ${({ collapsed }) => (collapsed ? "var(--size)" : "150px")};
  height: var(--size);
  min-height: var(--size);
  margin: 15px 10px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  outline: none;
  border: none;
  border-radius: calc(0.5 * var(--size));
  box-shadow: 0 1px 3px 1px var(--gray);
  transition: width 0.2s;
  font-family: inherit;
  cursor: pointer;
  transition: box-shadow 0.2s;

`.and`:hover {
    box-shadow: 0 5px 10px 0 var(--gray);
  }
`.and`:active {
    background: var(--light-gray);
  }
`;

export const EditorButtonText = decor.span`
  margin-left: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dark-gray);
`;

export const MenuItem = decor.div`
  --size: 35px;
  height: var(--size);
  min-height: var(--size);
  line-height: 1rem;
  width: ${({ collapsed }) => (collapsed ? "var(--size)" : "80%")};
  padding: 0 ${({ collapsed }) => (collapsed ? "0" : "10px")};
  margin: 0 ${({ collapsed }) => (collapsed ? "10px" : "0")};
  display: flex;
  align-items: center;
  justify-content: ${({ collapsed }) => (collapsed ? "center" : "start")};
  border-top-right-radius: calc(0.5 * var(--size));
  border-bottom-right-radius: calc(0.5 * var(--size));
  border-top-left-radius: ${({ collapsed }) =>
    collapsed ? "calc(0.5 * var(--size))" : "0"};
  border-bottom-left-radius: ${({ collapsed }) =>
    collapsed ? "calc(0.5 * var(--size))" : "0"};
  background: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: ${({ activated }) => (activated ? "700" : "600")};
  color: ${({ activated }) => (activated ? "var(--theme)" : "gray")};
  background: ${({ activated }) =>
    activated ? "var(--theme-light)" : "white"};
  cursor: pointer;
  transition: all 0.2s;

`.and`:hover {
    background: ${({ activated }) =>
      activated ? "var(--theme-light)" : "var(--light-gray)"};
  }
`.and`:active {
    background: ${({ activated }) =>
      activated ? "var(--theme-light)" : "var(--gray)"};
  }
`.and` > i {
    margin: 0 ${({ collapsed }) => (collapsed ? "0" : "20px")};
    color: inherit;
  }
`.and` * {
    pointer-events: none;
  }
`;
