import { useEffect, useState } from "react";
import { ScanLog } from "../types";

const Dashboard = () => {
    const [logs, setLogs] = useState<ScanLog[]>([]);
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    useEffect(() => {
        chrome.storage.local.get({ scanLogs: [] }, (data) => {
            setLogs(data.scanLogs);
        });
    }, []);

    const handleToggle = (idx: number) => {
        setOpenIdx(openIdx === idx ? null : idx);
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4 text-start" style={{ color: "#40259c" }}>Scan Logs</h2>
            {logs.length === 0 && <div className="alert alert-info">No scans yet.</div>}
            <div className="accordion" id="scanLogsAccordion">
                {logs.map((log, idx) => (
                    <div className="accordion-item mb-2"
                        key={idx}
                        style={{
                            background: "#f4f1fa",
                            color: "#5D3FD3",
                            border: "1.5px solid #5D3FD3"
                        }}
                    >
                        <h2 className="accordion-header" id={`heading${idx}`}>
                            <button
                                className={`accordion-button ${openIdx === idx ? "" : "collapsed"}`}
                                type="button"
                                onClick={() => handleToggle(idx)}
                                aria-expanded={openIdx === idx}
                                aria-controls={`collapse${idx}`}
                                style={{
                                    background: "#f4f1fa",
                                    color: "#40259c",
                                    fontWeight: 700
                                }}
                            >
                                <div className="d-flex flex-column w-100">
                                    <span>
                                        <b style={{ color: "#40259c" }}>Time:</b> {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                    <span>
                                        <b style={{ color: "#40259c" }}>Result:</b> {log.result} ({log.confidence})
                                    </span>
                                </div>
                            </button>
                        </h2>
                        <div
                            id={`collapse${idx}`}
                            className={`accordion-collapse collapse${openIdx === idx ? " show" : ""}`}
                            aria-labelledby={`heading${idx}`}
                            data-bs-parent="#scanLogsAccordion"
                        >
                            <div className="accordion-body" style={{ background: "#fff", color: "#5D3FD3" }}>
                                <div className="mb-2">
                                    <b style={{ color: "#40259c" }}>Email:</b>
                                    <pre className="p-2 rounded" style={{ background: "#f4f1fa", color: "#5D3FD3", whiteSpace: "pre-wrap" }}>{log.emailText}</pre>
                                </div>
                                <div className="mb-2">
                                    <b style={{ color: "#40259c" }}>Top Tokens:</b>
                                    <ul className="list-group list-group-flush">
                                        {log.topTokens.map((t, i) => (
                                            <li className="list-group-item" key={i} style={{ background: "#f4f1fa", color: "#5D3FD3", border: "none" }}>
                                                <span className="fw-bold" style={{ color: "#40259c" }}>{t.token}</span>: {t.shap_value.toFixed(4)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <b style={{ color: "#40259c" }}>Attachments:</b>
                                    {log.attachments && log.attachments.length > 0 ? (
                                        <ul className="list-group list-group-flush">
                                            {log.attachments.map((att, i) => (
                                                <li className="list-group-item" key={i} style={{ background: "#f4f1fa", color: "#5D3FD3", border: "none" }}>
                                                    <b style={{ color: "#40259c" }}>{att.name}:</b><br />
                                                    Threat Category: {att.threatCategory}<br />
                                                    Threat Family: {att.threatFamily}<br />
                                                    Analysis Stats:
                                                    <div style={{ marginLeft: 16 }}>
                                                        <div>Malicious: {att.malicious}</div>
                                                        <div>Undetected: {att.undetected}</div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-muted ms-2">No attachments</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;