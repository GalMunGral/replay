import { decorator as $$ } from "replay/utils";

const Tab = ({ name, key, active, onclick }) => [
  <Box {...{ name, key, active, onclick }}>
    <Icon className={`fas fa-${iconMap[name]}`} />
    <p>{name}</p>{" "}
  </Box>,
];

const Tabs = (__, { $route, $mails }) => {
  const { folder } = $route.params;
  const activeTab = $mails.tab;
  if (folder !== "inbox") return [null];
  return [
    <TabBar>
      {...allTabs.map((tab) => (
        <Tab
          name={tab}
          key={tab}
          active={tab === activeTab}
          onclick={() => {
            $mails.tab = tab;
            $mails.pageIndex = 0;
          }}
        />
      ))}
    </TabBar>,
  ];
};

export default Tabs;

const allTabs = ["primary", "social", "promotions"];

const iconMap = {
  primary: "inbox",
  social: "user-friends",
  promotions: "tag",
};

const colorMap = {
  primary: "#f44336",
  social: "#2962ff",
  promotions: "#2e7d32",
};

const TabBar = $$.div`
  flex: 0 0 50px;
  display: flex;
  justify-content: start;
  border-bottom: 1px solid var(--light-gray);
`;

const Icon = $$.i`
  margin: 0 20px;
`;

const Box = $$.div`
  --height: 55px;
  display: inline-block;
  position: relative;
  height: var(--height);
  line-height: var(--height);
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: start;
  text-transform: capitalize;
  width: 250px;
  color: ${({ active, name }) => (active ? colorMap[name] : "gray")};
  cursor: pointer;
  transition: background 0.02s ease-in-out;
  
`.$`::after {
    content: "";
    position: absolute;
    left: 5%;
    bottom: 0;
    border-radius: 3px 3px 0 0;
    width: 90%;
    height: 3px;
    background: ${({ active, name }) =>
      active ? colorMap[name] : "transparent"};
  }
`.$`:hover {
    background: var(--light-gray);
  }
`;
