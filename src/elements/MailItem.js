import { decor } from "lib";

export const ListItem = decor.div`
  --height: 40px;
  position: relative;
  height: var(--height);
  line-height: var(--height);
  padding: 0 10px;
  display: flex;
  border-bottom: 1px solid var(--light-gray);
  background-color: ${({ selected }) =>
    selected ? "var(--highlight)" : "white"};
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

`.and`:active {
    cursor: grabbing;
  }
`.and`:hover {
    background: ${({ selected }) => (selected ? "var(--highlight)" : "white")};
    filter: brightness(0.95);
  }
`.and`:hover * {
    visibility: visible;
  }
`;

export const SenderInfo = decor.div`
  flex: 0 0 200px;
  font-weight: 600;
`;

export const Summary = decor.div`
  flex: 1 1 auto;
  line-height: 1rem;
`;

export const Title = decor.span`
  font-weight: 600;
  font-size: 1rem;
  text-transform: capitalize;
`;

export const Preheader = decor.span`
  font-weight: 300;
  font-size: 1rem;
  color: gray;
`;

export const Actions = decor.div`
  margin-right: 30px;
  flex: 0 0 auto;
  visibility: hidden;
  color: var(--gray);
`;
