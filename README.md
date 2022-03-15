# REPLAY

Rendering is a recursive process consisting of expanding macros/templates into data structures to be interpreted as a series of insertion/removal/update operations and/or further expansions. The "interpreter" caches code ("render functions") and data -- some determined by expansion ("props") while others completely independent ("state") -- of previous execution in "component instances" such that the process could be rolled back and restarted from those checkpoints.

Data dependencies form an acyclic directed graph where stored properties are sources, component instances are sinks, and computed properties are internal nodes. When a source is accessed during the derivation of some other data, the shape of the call stack corresponds to some path on this graph. Mutations invalidate all derived data reachable from the updated sources. The recursive dependency tracking and invalidation mechanism could be implemented using the observer pattern with an observer stack. The subscriptions need only be one-time (like long-polling), because the observers are observing not new data but invalidation of old data.

## Features:

- Code Splitting (initial, async, vendor, common)
- Incremental DOM (v3 only)
- Async Components (v1 only)
- Server-Side Rendering & Hydration (v1 only)
- Live Reload
