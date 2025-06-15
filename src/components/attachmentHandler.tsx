import { useState } from "react";
import { parseVTResult } from "./vtStats/parseVTResult";
import { AttachmentResult } from "../types";

type Attachment = { name: string; url: string };

const AttachmentHandler = () => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [scanResult, setScanResult] = useState<ReturnType<typeof parseVTResult> | null>(null);

    const saveAttachmentResultToLatestLog = (attachmentResult: AttachmentResult) => {
        chrome.storage.local.get({ scanLogs: [] }, (storage) => {
            if (storage.scanLogs.length === 0) return;
            const latestLog = { ...storage.scanLogs[0] };
            latestLog.attachments = latestLog.attachments || [];
            latestLog.attachments.push(attachmentResult);
            const updatedLogs = [latestLog, ...storage.scanLogs.slice(1)];
            chrome.storage.local.set({ scanLogs: updatedLogs });
        });
    };

    const handleGetAttachments = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) return;
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "GET_ATTACHMENTS" },
                (response) => {
                    if (response && response.attachments) {
                        setAttachments(response.attachments);
                    } else {
                        setAttachments([]);
                        setScanResult({
                            threatCategory: "No attachments found.",
                            threatFamily: "",
                            malicious: NaN,
                            undetected: NaN
                        });
                    }
                }
            );
        });
    };

    const handleDownloadAndScan = (att: Attachment) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) return;
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "FETCH_AND_HASH_ATTACHMENT", url: att.url },
                async (response) => {
                    setScanResult({
                        threatCategory: "Loading.",
                        threatFamily: "",
                        malicious: NaN,
                        undetected: NaN
                    });

                    if (response && response.success) {
                        const vtRes = await fetch("http://localhost:8000/virustotal", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ hash: response.hash }),
                        });

                        const vtData = await vtRes.json();
                        const vtResult = parseVTResult(vtData);
                        setScanResult(vtResult);
                        saveAttachmentResultToLatestLog({
                            name: att.name,
                            ...vtResult
                        });
                    } else {
                        setScanResult({
                            threatCategory: "Failed to fetch or hash attachment.",
                            threatFamily: "",
                            malicious: NaN,
                            undetected: NaN
                        });
                    }
                }
            );
        });
    };

    return (
        <div
            className="rounded p-3"
            style={{
                maxWidth: 500,
                width: "100%",
                margin: "0 auto",
                background: "#f4f1fa",
                color: "#5D3FD3"
            }}
        >
            <h5 className="text-center mb-3" style={{ color: "#40259c" }}>📎 Attachment Scanner</h5>
            <div className="d-flex justify-content-center mb-3">
                <button
                    onClick={handleGetAttachments}
                    className="btn fw-bold"
                    style={{
                        background: "#5D3FD3",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 28px"
                    }}
                >
                    Get Attachments
                </button>
            </div>

            {attachments.length > 0 && (
                <ul className="list-group mb-3">
                    {attachments.map((att, idx) => (
                        <li
                            key={idx}
                            className="list-group-item d-flex justify-content-between align-items-center"
                            style={{ background: "#f4f1fa", color: "#5D3FD3", border: "none" }}
                        >
                            <span>📄 {att.name}</span>
                            <button
                                onClick={() => handleDownloadAndScan(att)}
                                className="btn btn-sm fw-bold"
                                style={{
                                    background: "#5D3FD3",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6
                                }}
                            >
                                Scan
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {scanResult && (
                <div
                    className="alert mt-3"
                    style={{
                        background: "#fff",
                        color: "#5D3FD3",
                        border: "2px solid #5D3FD3"
                    }}
                >
                    <strong style={{ color: "#40259c" }}>Scan Result:</strong>
                    <div>Threat Category: {scanResult.threatCategory}</div>
                    <div>Threat Family: {scanResult.threatFamily}</div>
                    <div>
                        Analysis Stats:
                        <div style={{ marginLeft: 16 }}>
                            <div>Malicious: {scanResult.malicious}</div>
                            <div>Undetected: {scanResult.undetected}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttachmentHandler;