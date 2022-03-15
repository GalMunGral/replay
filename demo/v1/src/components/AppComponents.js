import { decor } from "@replay/common";

export const Container = decor.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template:
    "a a" 64px
    "b c" calc(100vh - 60px) / auto 1fr;
`;
