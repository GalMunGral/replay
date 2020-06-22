import { Box, Icon } from "./Tab.decor";

const iconMap = {
  primary: "inbox",
  social: "user-friends",
  promotions: "tag",
};

const Tab = ({ name, key, onclick, active }) =>
  // use-transform
  Box({ active, name, key, onclick }, [
    Icon({ className: `fas fa-${iconMap[name]}` }),
    p(name),
  ]);

export default Tab;
