# Actre
I wrote this project to formalize my intuition about React


```clojure
(defn render [comp]
  (if (seq? comp)
    ; functional component
    (render (eval comp))
    (if (map? comp)
      ; host component
      (let [children (get comp :children)
            rendered (if (vector? children)
                       (map render children) (render children))]
        (assoc comp :children rendered))
      comp)))

(defn name-box [name]
  {:font-weight "bold" :children name})

(defn fancy-box [children]
  {:border-style "1px solid blue" :children children})

(defn user-box [user]
  (let [name (str (get user :first-name) " " (get user :last-name))]
    `(fancy-box ["Name: "
                 `(name-box ~~name)])))

(let [user {:first-name "Wenqi" :last-name "He"}]
  (render (user-box user)))


;;  Output:
;;  {
;;    :border-style "1px solid blue",
;;    :children (
;;      "Name: "
;;      {
;;        :font-weight "bold",
;;        :children "Wenqi He"
;;      }
;;    )
;;  }
```

```js
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
```
