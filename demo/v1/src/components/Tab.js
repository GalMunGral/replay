import { Box, Icon } from "./TabComponents";

const iconMap = {
  primary: "inbox",
  social: "user-friends",
  promotions: "tag",
};

const Tab = () => ({ name, key, onclick, active }) => {
  return (
    // use-transform
    // prettier-ignore
    Box(active=active, name=name, key=key, onclick=onclick, [
      Icon(className=`fas fa-${iconMap[name]}`),
      p(name),
    ])
  );
};

export default Tab;
