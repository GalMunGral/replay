# Actre
I wrote this project to formalize my intuition about React


```clojure
(defn render [comp]
  (if (seq? comp)
    ; functional component
    (render (eval comp))
    (if (map? comp) 
      ; host component
      (let [
        children (get comp :children)
        children (if (seq? children) (map render children) (render children))]
        (assoc comp :children children))
      comp)))

(defn name-box [name]
  {:font-weight "bold" :children name})
  
(defn fancy-box [children]
  {:border-style "1px solid blue" :children children})
  
(defn user-box [user]
  (let [name (str (get user :first) " " (get user :last))]
    `(fancy-box `("Name: " (name-box ~~name)))))

(let [user {:first "Wenqi" :last "He"}]
  (render (user-box user)))

;;Output:
;;  {
;;    :border-style "1px solid blue",
;;    :children (
;;      "Name: "
;;      {
;;        :font-weight "bold",
;;        :children "Wenqi He"
;;      }
;;    )
;;  }```
