# Actre

This project is highly inspired by React. The basic idea is to construct UI as composition of *expressions* derived from state (i.e. FP) as opposed to *entities* that hold state (i.e. OOP). The model can be summarized as follows: Each component depends solely on its arguments and context, and evaluates to a sequence of child components. The arguments to each child component is derived from the arguments passed to the parent as well as the parent's context. The local variables taht the child component introduces, along with the parent's existing context, comprises the child's context. This could be expressed a bit more formally as:

![equation](https://latex.codecogs.com/svg.latex?view^n_i({\bf%20Args},%20{\bf%20C})%20\rightarrow%20\Big\\{%20view^{n+1}_j\big(f({\bf%20Args},%20{\bf%20C}),{\bf%20C}%20%20\cup%20%20{\bf%20L}^{n+1}_j%20\big)%20\Big\\}),


There are two implications of this model.

### Normal order evaluation

Another core idea is that each invocation of the same component function creates 

Here are some of the important fields that belong to a fiber. (This list is not exhaustive.)

However to express the idea more clearly there are two missing ingredients that's missing in JavaScript:  **normal-order evaluation** and **dynamic scope**.

Here is my rewrite in Clojure of a snippet from [this article](https://github.com/reactjs/react-basic) about the conceptual model of React

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
