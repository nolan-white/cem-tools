import type { ScopedElements } from "lit-app/solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements
      extends ScopedElements<'test-'>, ScopedElements<'', '_test'> {}
  }
}