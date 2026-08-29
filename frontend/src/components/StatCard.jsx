import {
    Activity,
    FileText,
    Eye,
    Edit3,
    Download
} from "lucide-react";

const icons = {
    events: Activity,
    documents: FileText,
    views: Eye,
    edits: Edit3,
    downloads: Download
};

function StatCard({
    title,
    value,
    type
}) {

    const Icon = icons[type];

    return (
        <div className="stat-card">

            <div className="stat-top">

                <div className="stat-icon">
                    <Icon size={20} />
                </div>

            </div>


            <div className="stat-value">
                {value}
            </div>


            <div className="stat-title">
                {title}
            </div>

        </div>
    );
}

export default StatCard;