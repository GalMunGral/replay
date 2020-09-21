# Replay

This project is highly inspired by React and MobX.

The basic idea is that rendering is a compilation process consisting of expanding macros (functional components) into a composition of `hostRenderFunction`s (DOM components) and translating them into DOM operations (add/remove/update). The component instances are essentially managed stack frames that store arguments (props) and local variables (state) so that this process could be rolled back to any given point and start again from there, erasing previous effects that are invalidated and reusing completed work whenever possible.

Dependencies form a directed graph where stored properties are the sources, computed properties are internal nodes, and component instances are the sinks. Each path on this graph coincides with the state of the actual call stack at some point during the evaluation. Mutations invalidate all previous computations (represented by nodes) reachable from the affected source. This recursive dependency tracking and invalidation mechanism is implemented using the obserer pattern, with an additional observer stack. The subscriptions need only be one-time (analagous to long-polling), because the observers are actually observing for _invalidation_ of previously obtained value rather than what the new value is.

## Demo Project

![screenshot](screenshots/demo.png)
