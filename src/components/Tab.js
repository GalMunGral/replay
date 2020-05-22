import { Box, Icon } from "../elements/Tab";

const iconMap = {
  primary: "inbox",
  social: "user-friends",
  promotions: "tag",
};

const Tab = ({ name, key, onclick, active }) =>
  // use-transform
  Box((active = active), (name = name), (key = key), (onclick = onclick), [
    Icon((className = `fas fa-${iconMap[name]}`)),
    p(name),
  ]);

export default Tab;
