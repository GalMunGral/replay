# Actre
I wrote this project to formalize my intuition about React


```clojure

 
(defn div [attrs children]
   {:tag "div" :attrs attrs :children children})
   
(defn name-box [name]
  `(div {:font-weight "bold"} '~name))
  
(defn fancy-box [children]
  `(div {:border-style "1px solid blue"} '~children))
  
(defn user-box [user]
  (let [name (str (get user :first) " " (get user :last))]
    `(fancy-box `("Name: " (name-box ~~name)))))

(defn render-children [children]
  (if (seq? children)
    (map render children)
    children))

(defn render [comp]
  (println "HE" comp)
  (if (seq? comp)
    (render (eval comp))
    (if (map? comp)
      (let [children (get comp :children)]
        (assoc comp :children (render-children children)))
      comp)))


(def me {:first "Wenqi" :last "He"})

(render (user-box me))
```
