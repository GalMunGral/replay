# Actre
I wrote this project to formalize my intuition about React


```jsx
function Page({ title, body, className }) {
  return (
    <Container className={className}>
      <Header>{title}</Header>
      <Main>{body}</Main>
    </Container>
}
```

```clojure
(defmacro Page [title body class-name]
  `(Container ((class-name ~class-name))
    (Header ~title)
    (Main ~body)))
```
