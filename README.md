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
The aforementioned equivalence of  the view tree and the tree of virtual stack frames relies on a subtle premise that functions calls are evaluated in [**normal order**](https://mitpress.mit.edu/sites/default/files/sicp/full-text/sicp/book/node85.html). In *normal-order* evaluation, expressions are reduced *from the outside in* &mdash; that is, operators/functions are evaluated before operands/arguments &mdash; whereas in *applicative-order* evaluation, arguments are fully evaluated before they are passed to functions. JavaScript, as the majority of programming languages, uses applicative order.

Consider this example code:
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
which is not what we want.
## Metaprogramming
In a [homoiconic language](https://en.wikipedia.org/wiki/Homoiconicity) such as Lisp, one could easily simulate normal-order evaluation with [quoting](https://clojure.org/guides/learn/syntax#_delaying_evaluation_with_quoting). To illustrate what I mean, here is my adaptation of a snippet from [this article](https://github.com/reactjs/react-basic) in Clojure:

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
Obviously JavaScript doesn't represent code as data within the language itself, but we could always create our own representations &mdash; this is how I see React elements. In my own implementation, I used arrays instead of objects with string keys so that it is possible to write readable code without resorting to a DSL that requires transpilation (read: JSX):
```js
[type, { ...props }, [...children]] // suspended evaluation

// evaluates to
type({ ...props, children: [...children] }); // immediate evaluation
```
## Syntactic Sugar
To provide better readability, you can my `babel-plugin-transform-elements` which allows you to express the same idea more clearly:

```js
const Component = () =>
  // use-transform
  Container(
    id="container"
    className="fancy",
    [
      Box(id="box", "Hello World")
    ]);

// transpiles to
const Component = () => 
  [
    [Container, {
      id: "container",
      className:"fancy",
      children: [
        [Box, { id: "box", children: "Hello World" }]
      ]
    }]
  ];
```

## Auxiliary Modules
### Observable: Reactivity
```js
const bindings = () =>  ({
  Observable({
    count: 10
  })
});

const App = withContext(bindings)(
  () => /* ... */
);
```
The `Observable` function takes an object and converts each property into a getter/setter pair. The getter registers the *stack frames (instances)* of the calling component functions as dependents (observers), while the setter schedules re-renders starting from those observing frames.

### Decorator: Styling
```js
import { decor } from "lib";

const RedButton = decor.button`
  background: red;
`;

const InvisibleRedButton = decor(RedButton)`
  visibility: hidden;
`;
```
This is inspired by styled-components. The name refers to the fact it "decorates" the component both in the sense that it creates a higher-order function that enhances the wrapped
component function, and in the sense that it applies styles to the wrapped component.

## Implementation Details: Scheduling
### Batched Updates 
The setters of `Observable`'s do not trigger re-renders synchronously. Instead, it addes all observing instances to a "update queue" that will be flushed *at the end of current event loop tick/iteration (i.e. after current task/macrotask)*. This is implemented using `queueMicrotask`. The update queue is implemented using a `Set` so that each instance will only be added once no matter how many of its dependencies have changed or how many times those dependencies have changed.
### Priority Queue
All render requests submitted are handled by the `scheduler` module, which queues pending tasks in a *priority queue based on node depth* &mdash; specifically, the ones closer to the root are always rendered first. This was designed to prevent the following scenario: Imagine a component uses a dynamic variable `a` declared by an ancestor, and it also takes an argument `b`, which is derived from `a`, from its parent. Now if `a` is updated and the child is updated before its parent, it will use the latest value of `a` but a value of `b` that's computed from the original value of `a` &mdash; this would be an error.
### Generators and Effects
Another important design choice is that all functions involved in the rendering process, whether the library's internal functions, or user-defined component functions, should not perform side effects (e.g. DOM updates) themselves. Instead, all side effects need to be delegated to the scheduler. This is implemented by using *generators* in place of functions with side effects. The scheduler runs a loop that drives these generators, which `yield` their side effects as *thunks*. For example, inside the wrapper component created by `decor`:
```js
const decor = (component) => (...args) => {
  // ...
  const StyleWrapper = function* (props) {
    if (!classCache.has(computedDeclarations)) {
      // ...
      yield () => addCSSRule(rule);
    }
    // ...
  }
  // ...
}
``` 
The scheduler can decide what to do with those thunks. For example, it could execute them synchronously, or it could add them to a *effect list* to be commited later.
### Cooperative Scheduling
Using generators also allows for asynchronous rendering &mdash; which means that long-running render tasks could be split into chunks and spread across multiple frames &mdash; using the [Cooperative Scheduling of Background Tasks API](https://www.w3.org/TR/requestidlecallback/) (i.e. [`window.requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)) and batching DOM updates using [`window.requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame). My implementation is as follows:
```js
// scheduler.js

// ...
function doWork(deadline) {
  while (deadline.timeRemaining() > THRESHOLD) {
    const { done, value } = currentTask.next();
    if (done) {
      return window.requestAnimationFrame(commit);
    } else {
      if (Array.isArray(value)) {
        effects.push(...value);
      } else {
        effects.push(value);
      }
    }
  }
  return window.requestIdleCallback(doWork);
}

function commit() {
  for (let effect of effects) {
    effect();
  }
  effects = [];
  currentTask = null;

  // Poll next task
}

// ...
```
## Demo Project
![screenshot](screenshots/demo.png)

### Sample code
```js
import IconButton from "./IconButton";
import Space from "./Space";
import EditorInput from "./EditorInput";
import {
  Window,
  Header,
  CloseButton,
  Body,
  TextArea,
  ButtonGroup,
  SendButton,
} from "../elements/Editor";

const Editor = (__, { editorPopup$, editor$ }) => {
  const { minimized } = editorPopup$;
  const { recipientEmail, subject, content } = editor$;

  if (!editorPopup$.open) return [null];

  return (
    // use-transform
    Window([
      Header((onclick = () => (editorPopup$.minimized = !minimized)), [
        span("New Message"),
        CloseButton(
          (onclick = () => {
            editor$.saveDraft();
            editorPopup$.open = false;
          }),
          [i((className = "fas fa-times"))]
        ),
      ]),
      Body({ minimized }, [
        EditorInput(
          (label = "To:"),
          (placeholder = "Recipient"),
          (value = recipientEmail),
          (setValue = (v) => (editor$.recipientEmail = v))
        ),
        EditorInput(
          (label = "Subject:"),
          (placeholder = "Subject"),
          (value = subject),
          (setValue = (v) => (editor$.subject = v))
        ),
        TextArea(
          (value = content),
          (oninput = (e) => editor$.updateHistory(e.target.value))
        ),
        ButtonGroup([
          SendButton(
            (onclick = () => {
              editor$.send();
              editorPopup$.open = false;
            }),
            "Send"
          ),
          IconButton((type = "undo"), (onclick = () => editor$.undo())),
          IconButton((type = "redo"), (onclick = () => editor$.redo())),
          Space(),
        ]),
      ]),
    ])
  );
};

export default Editor;
```
### Performance
#### Render phase (idle callbacks) and commit phase (animation frame)
![perf-0](screenshots/perf-0.png)
#### Interleaving of long-running render tasks and hover events
![perf-1](screenshots/perf-1.png)
