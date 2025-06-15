import { useState, useEffect } from "react";
import AttachmentHandler from "./attachmentHandler";
import { parseVTResult } from "./vtStats/parseVTResult";

const Popup = () => {
    const [inputText, setInputText] = useState("");
    const [result, setResult] = useState("");
    const [topTokens, setTopTokens] = useState<{ token: string; shap_value: number }[]>([]);
    const [confidence, setConfidence] = useState<string>("");
    const [attachmentsResult, setAttachmentsResult] = useState<ReturnType<typeof parseVTResult> | null>(null);

    useEffect(() => {
        chrome.storage.local.get("emailText", (data) => {
            if (data.emailText) {
                setInputText(data.emailText);
                handleCheck(data.emailText);
            }
        });
    }, []);

    const handleCheck = async (text: string) => {
        setResult("Checking...");
        setConfidence("");
        setTopTokens([]);
        setAttachmentsResult({
            threatCategory: "Loading.",
            threatFamily: "",
            malicious: NaN,
            undetected: NaN
        });

        try {
            const response = await fetch("http://localhost:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            setResult(data.prediction);
            setConfidence(data.confidence);
            if (data.top_tokens) setTopTokens(data.top_tokens);

            chrome.storage.local.get({ scanLogs: [] }, (storage) => {
                const logEntry = {
                    timestamp: Date.now(),
                    emailText: text,
                    result: data.prediction,
                    confidence: data.confidence,
                    topTokens: data.top_tokens || [],
                    attachments: attachmentsResult
                };
                const updatedLogs = [logEntry, ...storage.scanLogs];
                chrome.storage.local.set({ scanLogs: updatedLogs });
            });
        } catch (error) {
            console.error("An error occurred:", error);
            setResult("Error: Unable to connect to the server.");
        }
    };

    return (
        <div className="container py-4" style={{ minWidth: 400, maxWidth: 600, background: "#f4f1fa", borderRadius: 16 }}>
            <h2 className="text-center mb-4" style={{ color: "#000" }}>Phishing Detector</h2>

            <div className="mb-3">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Extracted email content"
                    rows={4}
                    className="form-control"
                    style={{
                        background: "#f4f1fa",
                        color: "#5D3FD3",
                        border: "1.5px solid #5D3FD3",
                        fontWeight: 500
                    }}
                />
            </div>

            <div className="d-flex justify-content-center mb-3">
                <button
                    onClick={() => handleCheck(inputText)}
                    className="btn fw-bold"
                    style={{
                        background: "#5D3FD3",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 32px"
                    }}
                >
                    Check
                </button>
            </div>

            <div className="mb-3">
                <div
                    className="p-3 rounded text-center fw-semibold"
                    style={{
                        background: "#fff",
                        border: `2px solid ${result.includes("Phishing") ? "#5D3FD3" : "#5D3FD3"}`,
                        color: "#5D3FD3"
                    }}
                >
                    <strong style={{ color: "#40259c" }}>Result:</strong> {result}
                    {confidence && (
                        <div className="mt-2">
                            <strong style={{ color: "#40259c" }}>Confidence:</strong> {confidence}
                        </div>
                    )}
                </div>
            </div>

            {topTokens.length > 0 && (
                <div className="mb-3">
                    <h5 className="text-center mb-2" style={{ color: "#40259c" }}>Top Influential Words</h5>
                    <ul className="list-group">
                        {topTokens.map((item, idx) => (
                            <li
                                key={idx}
                                className="list-group-item d-flex justify-content-between align-items-center"
                                style={{ background: "#f4f1fa", color: "#5D3FD3", border: "none" }}
                            >
                                <span className="fw-bold" style={{ color: "#40259c" }}>
                                    {item.token}
                                </span>
                                <span style={{ color: "#5D3FD3" }}>
                                    {item.shap_value.toFixed(4)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <hr className="my-4" />

            <div className="d-flex justify-content-center mb-3">
                <AttachmentHandler />
            </div>
            <div className="d-flex justify-content-center">
                <button
                    onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("index.html#/dashboard") })}
                    className="btn fw-bold"
                    style={{
                        background: "#5D3FD3",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 32px"
                    }}
                >
                    Open Dashboard
                </button>
            </div>
        </div>
    );
};

export default Popup;