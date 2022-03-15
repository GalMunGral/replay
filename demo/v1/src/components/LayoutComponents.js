import { decor } from "@replay/common";

export const Container = decor.div`
  grid-area: c;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const ToolbarContainer = decor.div`
  flex: 0 0 50px;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: start;
  align-items: center;
  padding-left: 10px;
  padding-right: 30px;
`;

export const Scrollable = decor.div`
  flex: 1 1 auto;
  overflow-y: auto;
  padding-bottom: 80px;

`.and`::-webkit-scrollbar-thumb {
    background: var(--gray);
  }
`.and`::-webkit-scrollbar {
    width: 10px;
  }
`;
