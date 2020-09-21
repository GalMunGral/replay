# Replay

This project is highly inspired by React and MobX.

The basic idea is that rendering is a compilation process consisting of expanding macros (functional compoennts) into composition of primitives (DOM componnts) and translating them into DOM operations. The component instances are essentially managed stack frames that store arguments (props) and local variables (state) so that this process could be rolled back to any given point and start again from there.

Dependencies form a directed graph where stored properties are the sources, component instances are the sinks, and computed properties are internal nodes. The paths of this graph coincides with the state of the actual call stack at some point during the evaluation. Mutations invalidate all previous computations (represented by nodes on the graph) reachable from the mutated source. The recursive dependency tracking and invalidation mechanism is implemented using the obserer pattern with an additional observer stack. The subscriptions need only be one-time (akin to long-polling), because the observers are not observing for new _data_ but for _invalidation_ of old data

## Demo Project

![screenshot](screenshots/demo.png)

#### Render phase (idle callbacks) and commit phase (animation frame)

![perf-0](screenshots/perf-0.png)

#### Interleaving of long-running render tasks and hover events

![perf-1](screenshots/perf-1.png)

### Supports async components

![bundles](screenshots/bundles.png)

One could easily simulate normal-order evaluation with quoting, i.e. in Clojure:

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
