import { FileText } from "lucide-react";

function DocumentTable({ documents }) {

    return (

        <div className="documents-card">

            <div className="section-header">

                <div>
                    <h2>Documents</h2>
                    <p>Tracked documents</p>
                </div>

            </div>


            <div className="document-list">

                {documents.map((document) => (

                    <div
                        className="document-row"
                        key={document._id}
                    >

                        <div className="document-info">

                            <div className="document-icon">
                                <FileText size={18} />
                            </div>

                            <div>

                                <strong>
                                    {document.title}
                                </strong>

                                <span>
                                    Created{" "}
                                    {new Date(
                                        document.createdAt
                                    ).toLocaleDateString()}
                                </span>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default DocumentTable;