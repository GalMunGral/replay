# Actre

This project is highly inspired by React. The basic idea is to construct UI as composition of *expressions* derived from state (i.e. FP) as opposed to *entities* that hold state (i.e. OOP). Using this model, there is no explicit *construction* of component instances; Rather, an instance corresponds to an *invocation* of the component function, which is reified as a *stack frame*.

My variation of this model can be summarized as follows: A component depends on its arguments and context, and evaluates to (the evaluation of) a sequence of child components. The arguments to each child component is derived solely from the parent's arguments and context, and the context for each child is formed by extending its parent's context with its own local variables. This could be expressed a bit more formally as:

![equation](https://latex.codecogs.com/svg.latex?view^n_i({\bf%20Args},%20{\bf%20C})%20\rightarrow%20\Big\\{%20view^{n+1}_j\big(f({\bf%20Args},%20{\bf%20C}),{\bf%20C}%20%20\cup%20%20{\bf%20L}^{n+1}_j%20\big)%20\Big\\}),

### Sample Code
```js
// src/components/Editor.js
import IconButton from "../components/IconButton";
import Space from "../components/Space";
import EditorInput from "../components/EditorInput";
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

There are two implications of this model.

### 1. Normal-order evaluation

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
