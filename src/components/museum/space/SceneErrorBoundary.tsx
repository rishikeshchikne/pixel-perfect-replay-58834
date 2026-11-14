import { Component, type ReactNode } from "react";

type Props = { fallback: ReactNode; children: ReactNode };
type State = { failed: boolean };

/**
 * Keeps a 3D failure (WebGL context, texture download, lazy chunk) inside the map frame,
 * so the rest of the page keeps working and visitors get the schematic map instead.
 */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Ghost Map 3D scene unavailable, showing schematic map instead.", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
