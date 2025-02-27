import React, { useState } from "react";
import * as ort from "onnxruntime-web";
import { preprocessInput } from "../utils/tokenizer";

// Set ONNX Runtime WebAssembly path
const modelPath = chrome.runtime.getURL("onnx/phishing_model_v4.onnx");
ort.env.wasm.wasmPaths = chrome.runtime.getURL("ort-wasm/");

const Popup: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const classifyText = async () => {
    try {
      const session = await ort.InferenceSession.create(modelPath, { executionProviders: ["wasm"] });
      const inputTensor = new ort.Tensor("int32", new Int32Array(preprocessInput(inputText).flat()), [1, inputText.split(" ").length]);

      const feeds: Record<string, ort.Tensor> = { input_ids: inputTensor };
      const output = await session.run(feeds);
      const prediction = output["logits"].data[0];

      const predictionNumber = Number(prediction);
      setResult(predictionNumber > 0.5 ? "🚨 Phishing Detected!" : "✅ Safe Message");
    } catch (error) {
      console.error("ONNX Runtime Error:", error);
      setResult("❌ Error running model");
    }
  };

  return (
    <div className="p-4 w-64">
      <h1 className="text-lg font-bold">Phishing Detector</h1>
      <textarea
        className="border p-2 w-full"
        placeholder="Enter text..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2 mt-2 w-full" onClick={classifyText}>
        Check
      </button>
      {result && <p className="mt-2 font-bold">{result}</p>}
    </div>
  );
};

export default Popup;
