# Actre
I wrote this project to formalize my intuition about React


```clojure
(defmacro div [attrs children]
   `{:tag "div" :attrs ~attrs :children '~(map macroexpand children)})
   
(defmacro name-box [name]
  `(div {:font-weight "bold"} (~name)))
  
(defmacro fancy-box [children]
  `(div {:border-style "1px solid blue"} ~children))
  
(defmacro user-box [user]
  (let [name (str (get user :first) " " (get user :last))]
    `(fancy-box 
      ("Name: " (name-box ~name)))))

(user-box {:first "Wenqi" :last "He"})
```
