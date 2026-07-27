import React from "react";

// One render exception should not blank my entire application.
//
// My app holds a session's worth of unsaved work - no backend yet, so a white screen is data
// loss, not an inconvenience. I catch the throw, keep the page alive, and offer a diagnostic
// my goats can copy into a bug report before they reload.
type S = { error: Error | null; info: string };

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, S> {
  state: S = { error: null, info: "" };

  static getDerivedStateFromError(error: Error) { return { error, info: "" }; }

  componentDidCatch(error: Error, info: any) {
    this.setState({ error, info: String((info && info.componentStack) || "") });
    // eslint-disable-next-line no-console
    console.error("Unhandled render error:", error, info);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children as any;
    const report = [
      "Deep Grounds Exchange - error report",
      new Date().toISOString(),
      "",
      String(error && error.stack ? error.stack : error),
      "",
      "Component stack:",
      info,
    ].join("\n");
    return (
      <div style={{ padding: "2rem", maxWidth: 760, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ marginBottom: 8 }}>Something broke on this screen.</h1>
        <p style={{ opacity: 0.75 }}>
          The rest of the app is still running, but this view could not render. Nothing you have
          entered has been sent anywhere - this prototype keeps everything in the browser, so a
          reload starts fresh from the seeded state.
        </p>
        <pre style={{ background: "#00000010", padding: 12, borderRadius: 6, overflow: "auto", fontSize: "0.8rem", maxHeight: 260 }}>
          {String(error && error.message ? error.message : error)}
        </pre>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={() => this.setState({ error: null, info: "" })}>Try this screen again</button>
          <button onClick={() => location.reload()}>Reload the app</button>
          <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(report); }}>
            Copy diagnostic
          </button>
        </div>
      </div>
    );
  }
}
