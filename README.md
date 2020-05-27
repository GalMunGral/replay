# Actre

I wrote this project to formalize my intuition about React. The basic idea is to construct UI as composition of *expressions* derived from state (i.e. FP) as opposed to *entities* that hold state (i.e. OOP). 

![equation](https://latex.codecogs.com/svg.latex?view^n_i({\bf%20Args}^n_i,%20{\bf%20F}^n_i)%20=%20\Big\\{%20view^{n+1}_j\big({\bf%20Args}^{n+1}_j,{\bf%20F}^n_i%20%20\cup%20%20{\bf%20Free}^{n+1}_j%20\big)%20\Big\\})


Another core idea is that each invocation of the same component function creates sdf
if we view component instance identity and stack frames.
 React Fiber [this article](https://github.com/acdlite/react-fiber-architecture) on and [this article](https://github.com/reactjs/react-basic)).


Here are some of the important fields that belong to a fiber. (This list is not exhaustive.)

However to express the idea more clearly there are two missing ingredients that's missing in JavaScript:  **normal-order evaluation** and **dynamic scope**.

```clojure
(defn name-box [name]
  {:font-weight "bold" :label-content name})

(defn fancy-box [children]
  {:border-style "1px solid blue" :children children})

(defn user-box [user]
  (let [name (str (get user :first-name) " " (get user :last-name))]
    `(fancy-box ["Name: "
                 `(name-box ~~name)])))

(defn render [comp]
  (if (seq? comp)
    ; functional component
    (render (eval comp))
    (if (map? comp)
      ; host component
      (if (contains? comp :children)
        (let [children (get comp :children)
              rendered (if (vector? children)
                         (map render children) (render children))]
          (assoc comp :children rendered))
        comp)
      comp)))

(let [user {:first-name "Wenqi" :last-name "He"}]
  (render (user-box user)))

;;  Output:
;;  {
;;    :border-style "1px solid blue",
;;    :children (
;;      "Name: "
;;      {
;;        :font-weight "bold",
;;        :label-content "Wenqi He"
;;      }
;;    )
;;  }
```
