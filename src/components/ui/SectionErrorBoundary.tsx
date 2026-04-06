"use client";

import { Component, Suspense, type ComponentType } from "react";

interface Props {
  children: React.ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
}

class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[${this.props.sectionName ?? "Section"}]`, error);
    fetch("/api/report-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        section: this.props.sectionName,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      }),
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-text-muted/70 font-light">
            일시적으로 표시할 수 없습니다
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 text-xs text-primary underline underline-offset-4 decoration-primary/30"
            style={{ minHeight: "auto" }}
          >
            다시 시도
          </button>
        </div>
      );
    }

    // Suspense wrapper: React 19 hydrateRoot + Error Boundary 조합에서
    // hooks count 불일치 버그(#33580) 워크어라운드
    return <Suspense>{this.props.children}</Suspense>;
  }
}

export default SectionErrorBoundary;

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  sectionName?: string,
) {
  const displayName = sectionName ?? WrappedComponent.displayName ?? WrappedComponent.name ?? "Component";

  function WithBoundary(props: P) {
    return (
      <SectionErrorBoundary sectionName={displayName}>
        <WrappedComponent {...props} />
      </SectionErrorBoundary>
    );
  }

  WithBoundary.displayName = `withErrorBoundary(${displayName})`;
  return WithBoundary;
}
