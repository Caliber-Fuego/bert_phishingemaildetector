import { useState, useEffect } from "react";

const Popup = () => {
    const [inputText, setInputText] = useState("");
    const [result, setResult] = useState("");

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

        try {
            console.log(JSON.stringify({ text }));
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
        } catch (error) {
            console.error("An error occurred:", error);
            setResult("Error: Unable to connect to the server.");
        }
    };

    return (
        <div>
            <h2>Phishing Detector</h2>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Extracted email content"
                rows={4}
                cols={50}
            />
            <button onClick={() => handleCheck(inputText)}>Check</button>
            <p>Result: {result}</p>
        </div>
    );
};

export default Popup;
