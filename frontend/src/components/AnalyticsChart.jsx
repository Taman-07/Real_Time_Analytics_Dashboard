import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function AnalyticsChart({ events }) {

    const data = events
        .slice()
        .reverse()
        .map((event, index) => ({
            name: index + 1,
            events: index + 1
        }));


    return (

        <div className="chart-card">

            <div className="section-header">

                <div>
                    <h2>Events Activity</h2>
                    <p>Real-time event activity</p>
                </div>

                <span className="chart-live">
                    ● Live
                </span>

            </div>


            <div className="chart-container">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <LineChart data={data}>

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="name"
                        />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="events"
                            strokeWidth={3}
                            dot={false}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default AnalyticsChart;