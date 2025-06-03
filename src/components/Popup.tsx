import { useState, useEffect } from "react";
import AttachmentHandler from "./attachmentHandler";

const Popup = () => {
    const [inputText, setInputText] = useState("");
    const [result, setResult] = useState("");
    const [topTokens, setTopTokens] = useState<{ token: string; shap_value: number }[]>([]);
    const [confidence, setConfidence] = useState<string>("");

    // Load stored email text when popup opens
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
        setTopTokens([]); // Clear previous tokens

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
            if (data.top_tokens) setTopTokens(data.top_tokens); // <-- Save top tokens
        } catch (error) {
            console.error("An error occurred:", error);
            setResult("Error: Unable to connect to the server.");
        }
    };

    return (
        <div style={{ padding: "20px", minWidth: "600px" }}>
            <h2 style={{ color: "white", marginBottom: "20px" }}>Phishing Detector</h2>

            <div style={{ marginBottom: "20px" }}>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Extracted email content"
                    rows={4}
                    style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        fontSize: "14px"
                    }}
                />
            </div>

            <div style={{ marginBottom: "20px", gap: "10px", justifyContent:"space-between", alignItems: "center" }}>
                <button
                    onClick={() => handleCheck(inputText)}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Check
                </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <div style={{
                    padding: "15px",
                    borderRadius: "5px",
                    backgroundColor: result.includes("Phishing") ? "#ffebee" : "#e8f5e8",
                    border: `1px solid ${result.includes("Phishing") ? "#f44336" : "#4caf50"}`,
                    color: "black"
                }}>
                    <strong>Result:</strong> {result}
                    {confidence && (
                        <div style={{ marginTop: "5px" }}>
                            <strong>Confidence:</strong> {confidence}
                        </div>
                    )}
                </div>
            </div>

            {topTokens.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ color: "white", marginBottom: "10px" }}>Top Influential Words</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {topTokens.map((item, idx) => (
                            <li key={idx} style={{
                                padding: "6px 0",
                                borderBottom: "1px solid #eee",
                                fontSize: "15px"
                            }}>
                                <span style={{
                                    fontWeight: "bold",
                                    color: item.shap_value > 0 ? "#d32f2f" : "#388e3c"
                                }}>
                                    {item.token}
                                </span>
                                <span style={{ marginLeft: 10, color: "#555" }}>
                                    {item.shap_value.toFixed(4)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #eee" }} />

            <div>
                <AttachmentHandler/>
            </div>
        </div>
    );
};

export default Popup;