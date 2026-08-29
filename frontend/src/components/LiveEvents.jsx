import {
    Activity,
    Eye,
    Edit3,
    FolderOpen,
    Download,
    Plus,
    Trash2
} from "lucide-react";

const eventIcons = {
    view: Eye,
    open: FolderOpen,
    edit: Edit3,
    download: Download,
    create: Plus,
    delete: Trash2
};

function LiveEvents({ events }) {

    return (

        <div className="events-card">

            <div className="section-header">

                <div>
                    <h2>Live Events</h2>
                    <p>Latest activity</p>
                </div>

                <span className="live-badge">
                    LIVE
                </span>

            </div>


            <div className="events-list">

                {events.slice(0, 8).map((event) => {

                    const Icon =
                        eventIcons[event.eventType] || Activity;

                    return (

                        <div
                            className="event-row"
                            key={event._id}
                        >

                            <div className="event-icon">
                                <Icon size={17} />
                            </div>


                            <div className="event-info">

                                <strong>
                                    {event.eventType}
                                </strong>

                                <span>
                                    {event.userId}
                                </span>

                            </div>


                            <div className="event-time">

                                {new Date(
                                    event.createdAt
                                ).toLocaleTimeString()}

                            </div>

                        </div>
                    );

                })}

            </div>

        </div>
    );
}

export default LiveEvents;