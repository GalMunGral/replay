# Actre
I wrote this project to formalize my intuition about React


```clojure
(defn name-box [name]
  {:font-weight "bold" :children name})
  
(defn fancy-box [children]
  {:border-style "1px solid blue" :children children})
  
(defn user-box [user]
  (let [name (str (get user :first) " " (get user :last))]
    `(fancy-box `("Name: " (name-box ~~name)))))

(defn render [comp]
  (println "HE" comp)
  (if (seq? comp)
    (render (eval comp))
    (if (map? comp)
      (let [
        children (get comp :children)
        rendered (if (seq? children) (map render children) (render children))]
        (assoc comp :children rendered))
      comp)))


(def user {:first "Wenqi" :last "He"})
(render (user-box user))
```
