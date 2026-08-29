import {
    LayoutDashboard,
    FileText,
    Activity,
    Settings,
    Zap
} from "lucide-react";

function Sidebar() {

    return (
        <aside className="sidebar">

            <div className="logo">
                <div className="logo-icon">
                    <Zap size={20} />
                </div>

                <span>Analytics</span>
            </div>


            <nav className="sidebar-nav">

                <div className="nav-item active">
                    <LayoutDashboard size={19} />
                    <span>Overview</span>
                </div>


                <div className="nav-item">
                    <FileText size={19} />
                    <span>Documents</span>
                </div>


                <div className="nav-item">
                    <Activity size={19} />
                    <span>Live Events</span>
                </div>


                <div className="nav-item">
                    <Settings size={19} />
                    <span>Settings</span>
                </div>

            </nav>


            <div className="sidebar-bottom">

                <div className="live-status">

                    <span className="status-dot"></span>

                    <div>
                        <strong>System Live</strong>
                        <small>Real-time active</small>
                    </div>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;