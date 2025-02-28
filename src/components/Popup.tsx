import { useState } from "react";

const Popup = () => {
    const [inputText, setInputText] = useState("");
    const [result, setResult] = useState("");

    const handleCheck = async () => {
      setResult("Checking...");
  
      try {
        console.log(JSON.stringify({ text: inputText }));
          const response = await fetch("http://localhost:8000/predict", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: inputText }),
          });

          console.log(response)
          console.log(response.body)
  
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
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to check"
            />
            <button onClick={handleCheck}>Check</button>
            <p>Result: {result}</p>
        </div>
    );
};

export default Popup;
