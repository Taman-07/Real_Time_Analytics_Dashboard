import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Activity,
  Settings,
  Zap,
} from "lucide-react";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "live-events", label: "Live Events", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];

/**
 * Optional props:
 *  - active:   id of the active item (controlled). Falls back to internal state.
 *  - onSelect: called with the item id when a link is clicked.
 *  - isLive:   connection state for the status card (default true).
 */
function Sidebar({ active, onSelect, isLive = true }) {
  const [internal, setInternal] = useState("overview");
  const current = active ?? internal;

  const select = (id) => {
    setInternal(id);
    onSelect?.(id);
  };

  return (
    <>
      <style>{css}</style>

      <aside className="app-sidebar">
        <div className="app-logo">
          <div className="app-logo-icon">
            <Zap size={20} />
          </div>
          <div className="app-logo-text">
            <strong>Analytics</strong>
            <span>Live dashboard</span>
          </div>
        </div>

        <nav className="app-nav" aria-label="Main navigation">
          {ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`app-nav-item ${current === id ? "active" : ""}`}
              onClick={() => select(id)}
              aria-current={current === id ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="app-sidebar-bottom">
          <div className="app-status">
            <span className={`app-status-dot ${isLive ? "on" : "off"}`} />
            <div>
              <strong>{isLive ? "System live" : "Disconnected"}</strong>
              <small>{isLive ? "Real-time active" : "Trying to reconnect"}</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

const css = `
.app-sidebar {
  --sb-bg: rgba(8, 13, 28, 0.92);
  --sb-surface: #0e1629;
  --sb-line: #1c2740;
  --sb-text: #e8edf7;
  --sb-muted: #8794b3;
  --sb-primary: #5b8cff;
  --sb-indigo: #6d5dfc;

  position: fixed;
  inset: 0 auto 0 0;
  width: 236px;
  padding: 24px 14px 18px;
  display: flex;
  flex-direction: column;
  background: var(--sb-bg);
  border-right: 1px solid var(--sb-line);
  backdrop-filter: blur(14px);
  font-family: "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  z-index: 50;
}

.app-logo { display: flex; align-items: center; gap: 12px; padding: 0 8px 26px; }

.app-logo-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-items: center;
  color: #fff;
  background: linear-gradient(135deg, var(--sb-primary), var(--sb-indigo));
  box-shadow: 0 8px 24px rgba(91, 140, 255, 0.3);
}

.app-logo-text strong {
  display: block; color: var(--sb-text);
  font-size: 18px; font-weight: 700; letter-spacing: -0.3px;
}
.app-logo-text span { font-size: 12px; color: var(--sb-muted); }

.app-nav { display: flex; flex-direction: column; gap: 4px; }

.app-nav-item {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 11px 12px;
  border: 0; border-radius: 10px;
  background: transparent;
  color: var(--sb-muted);
  font-family: inherit; font-size: 14px; font-weight: 500;
  text-align: left; cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.app-nav-item:hover { color: var(--sb-text); background: rgba(255, 255, 255, 0.04); }
.app-nav-item:focus-visible { outline: 2px solid var(--sb-primary); outline-offset: 2px; }
.app-nav-item.active {
  color: #8fb0ff;
  background: rgba(91, 140, 255, 0.12);
  box-shadow: inset 3px 0 0 var(--sb-primary);
}

.app-sidebar-bottom { margin-top: auto; }

.app-status {
  display: flex; align-items: center; gap: 10px;
  padding: 12px; border-radius: 12px;
  border: 1px solid var(--sb-line); background: var(--sb-surface);
}
.app-status strong { display: block; color: var(--sb-text); font-size: 13px; }
.app-status small { font-size: 11px; color: var(--sb-muted); }

.app-status-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; background: #fb7185; }
.app-status-dot.on { background: #34d399; animation: sbPulse 1.8s infinite; }

@keyframes sbPulse {
  0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}

@media (max-width: 900px) {
  .app-sidebar { width: 72px; padding: 20px 10px; }
  .app-logo { justify-content: center; padding: 0 0 22px; }
  .app-logo-text, .app-nav-item span, .app-status div { display: none; }
  .app-nav-item { justify-content: center; padding: 12px 0; }
  .app-status { justify-content: center; padding: 12px 0; }
}

@media (prefers-reduced-motion: reduce) {
  .app-status-dot.on { animation: none; }
  .app-nav-item { transition: none; }
}
`;

export default Sidebar;