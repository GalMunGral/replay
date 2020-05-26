# Actre
I wrote this project to formalize my intuition about React


```clojure
(defn eval-children [children]
  (map (fn [c] (if (seq? c) (eval c) c)) children))
 
(defn div [attrs children]
   {:tag "div" :attrs attrs :children (eval-children children)})
   
(defn name-box [name]
  (div {:font-weight "bold"} `(~name)))
  
(defn fancy-box [children]
  (div {:border-style "1px solid blue"} children))
  
(defn user-box [user]
  (let [name (str (get user :first) " " (get user :last))]
    (fancy-box `("Name: " (name-box ~name)))))
    
(let [me {:first "Wenqi" :last "He"}]
  (user-box me))
```
