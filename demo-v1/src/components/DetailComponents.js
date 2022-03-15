import { decor } from "@replay/common";

export const Main = decor.main`
  margin: 0 50px;
`;

export const Header = decor.section`
  font-weight: 600;
  font-size: 1.8rem;
  margin: 20px 0;
  text-transform: capitalize;
`;

export const SenderInfo = decor.div`
  margin: 0;
  font-weight: bold;
  font-size: 0.9rem;
`;
export const RecipientInfo = decor.div`
  margin: 0;
  color: gray;
  font-size: 0.8rem;
`;

export const Body = decor.section`
  margin: 20px 0;
  text-align: justify;
`;
