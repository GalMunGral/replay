# Actre

This project is highly inspired by React.

The basic idea is to create UI as a composition of **expressions** derived from state (i.e. FP) as opposed to *entities* that manage state internally (i.e. OOP). Using this model, component instances are never explicitly constructed, rather, they correspond to *invocations* of the component function, reified as *stack frames*.

Just like how the generators need their stack frames kept alive so that execution could be paused and resumed, component are also "spcecial" functions whose stack frames need to be retained so that they could be re-evaluated (i.e. re-rendered) whenever their dependencies change as a result of event handling. Thus, we need to manually manage a tree of **simulated stack frames**, which at the same time functions as the *view tree*. In React, such frame are called ["fibers"](https://github.com/acdlite/react-fiber-architecture).

## Dynamic Scope
My formulation of this kind of model can be summarized as follows: A component depends on its *arguments* and *context* and evaluates to a sequence of child components. The arguments passed to each child component is derived solely from the parent's arguments and context, the context for each child constructed by extending the parent's context with the child's own local variables. Expressed more formally:

![equation](https://latex.codecogs.com/svg.latex?view^n_i({\bf%20Args},%20{\bf%20C})%20\rightarrow%20\Big\\{%20view^{n+1}_j\big(f({\bf%20Args},%20{\bf%20C}),{\bf%20C}%20%20\cup%20%20{\bf%20L}^{n+1}_j%20\big)%20\Big\\})

Here the free variables are **dynamically-scoped**. Since JavaScript only supports statical/lexical scoping, I had to simulate dynamic scoping by attaching a "local binding" object to each stack frame and using prototype chains to connect these objects.

To introduce dynamically-scoped local varaibles, you can define a function that returns the (initial) local bindings &mdash; It has to be a function since each instance needs a separate copy. Later when the component function is invoked, this binding object will be passed as the second argument:

```js
import { withContext } from 'lib';

const bindings = () => ({ /* Declare dynamic variables here */ });
const Component = ({ ...args}, { ...vars }) => [/* Child Components */];

export default withContext(bindings)(Component);
```

## Lazy (Normal-Order) Evaluation of Functions
The aforementioned equivalence of  the view tree and the tree of virtual stack frames relies on a subtle premise that functions calls are evaluated in [**normal order**](https://mitpress.mit.edu/sites/default/files/sicp/full-text/sicp/book/node85.html). In *normal-order* evaluation, expressions are reduced *from the outside in* &mdash; that is, operators/functions are evaluated before operands/arguments &mdash; whereas in *applicative-order* evaluation, arguments are fully evaluated before they are passed to functions. JavaScript, as the majority of programming languages, uses applicative order. Consider this example code:
```js
// Child.js
const Child = ({ text, onclick }, { color }) =>
  // use-transform
  [p({ style: { color }, onclick }, text)];

export default Child;
```
```js
// Parent.js
import { withContext } from 'lib';
import Child from './Child';

const local = () => ({
  color: '#4285f4',
  className: 'fancy'
});

const Parent = ({ onclick }, { className }) => 
  // use-transform
  [
    h1('Exmaple'),
    div({ className }, [
      Child({ text: 'Hello', onclick });
    ])
  ]

export default withContext(local)(Parent);
```
Using normal-order evaluation, the history of call stack would look like this (assuming that `div` calls `Child` internally):
```js
Parent
Parent, h1
Parent, div
Parent, div, Child 
Parent, div, Child p
```
Whereas in JavaScript, the actual order is:
```js
Parent
Parent, h1
Parent, Child
Parent, Child, p
Parent, div
```

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
## Example

