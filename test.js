function render(comp) {
  if (typeof comp == "function") {
    return render(comp());
  } else if (typeof comp == "object") {
    if (comp.children) {
      if (Array.isArray(comp.children)) {
        comp.children = comp.children.map(render);
      } else {
        comp.children = render(comp.children);
      }
    }
    return comp;
  } else {
    return comp;
  }
}

function NameBox(name) {
  return { fontWeight: "bold", labelContent: name };
}

function FancyBox(children) {
  return {
    borderStyle: "1px solid blue",
    children: children,
  };
}

function UserBox(user) {
  return FancyBox.bind(null, [
    "Name: ",
    NameBox.bind(null, user.firstName + " " + user.lastName),
  ]);
}

const user = { firstName: "Wenqi", lastName: "He" };
render(UserBox(user));

/*
  {
    borderStyle: '1px solid blue',
    children: [
      'Name: ',
      {
        fontWeight: 'bold',
        labelContent: 'Wenqi He'
      }
    ]
  }
*/
