import { useState } from "react";
import { parseVTResult } from "./vtStats/parseVTResult";

type Attachment = { name: string; url: string };

const AttachmentHandler = () => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [scanResult, setScanResult] = useState<ReturnType<typeof parseVTResult> | null>(null);

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
                        // Send hash to backend for VirusTotal lookup
                        const vtRes = await fetch("http://localhost:8000/virustotal", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ hash: response.hash }),
                        });

                        const vtData = await vtRes.json();
                        setScanResult(parseVTResult(vtData));
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
        <div>
            <h3 style={{ color: "white", marginBottom: "15px" }}>📎 Attachment Scanner</h3>
            <button
                onClick={handleGetAttachments}
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginBottom: "15px"
                }}
            >
                Get Attachments
            </button>

            {attachments.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {attachments.map((att, idx) => (
                        <li key={idx} style={{
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            marginBottom: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span>📄 {att.name}</span>
                            <button
                                onClick={() => handleDownloadAndScan(att)}
                                style={{
                                    padding: "5px 15px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                    fontSize: "12px"
                                }}
                            >
                                Scan
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {scanResult && (
                <div style={{
                    padding: "10px",
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeaa7",
                    borderRadius: "5px",
                    marginTop: "10px",
                    color: "black"
                }}>
                    {scanResult && (
                        <div style={{
                            padding: "10px",
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffeaa7",
                            borderRadius: "5px",
                            marginTop: "10px",
                            color: "black"
                        }}>
                            <strong>Scan Result:</strong>
                            <div>Threat Category: {scanResult.threatCategory}</div>
                            <div>Threat Family: {scanResult.threatFamily}</div>
                            <div>Analysis Stats: Malicious: {scanResult.malicious}, Undetected: {scanResult.undetected}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttachmentHandler;