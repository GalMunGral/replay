import { decor } from "@replay/common";

export const Container = decor.div`
  grid-area: a;
  padding: 2px 10px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--light-gray);
`;

export const Group = decor.div`
  flex: 0 0 auto;
  min-width: 200px;
  height: 100%;
  display: flex;
  align-items: center;
`;

export const MenuButton = decor.button`
  --size: 48px;
  border: none;
  width: var(--size);
  height: var(--size);
  border-radius: calc(0.5 * var(--size));
  margin: 5px;
  background: none;
  outline: none;
  cursor: pointer;\

`.and`:hover {
    background: var(--light-gray);
  }
`;

export const AppLogo = decor.img`
  height: 40px;
`;

export const MenuIcon = decor.i`
  font-size: 1rem;
  color: var(--dark-gray);
`;

export const SearchInput = decor.input`
  height: 100%;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 1rem;
`;

export const SearchBar = decor.div`
  width: 50vw;
  height: calc(100% - 20px);
  padding: 5px;
  background: var(--light-gray);
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  align-items: center;

`.and`:focus-within {
    box-shadow: 0 1px 4px 0px var(--gray);
    background: white;
  }
`;

export const SearchIcon = decor.i`
  font-size: 1rem;
  color: var(--dark-gray);
  margin: 20px;
`;
