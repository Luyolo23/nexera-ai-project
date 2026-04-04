import { useState, useRef } from "react";
import ModelViewer from "./components/ModelViewer";
import { normalizeInput, generateExplanation, generateActionExplanation } from "./services/aiService";
import { getDynamicModel } from "./services/modelService";
import { parseCommand } from "./services/commandParser";
import AvatarScene from "./components/AvatarScene";

function App() {
  const [input, setInput] = useState("");
  const [modelUrl, setModelUrl] = useState("");
  const [explanation, setExplanation] = useState("");
  const [command, setCommand] = useState("");
  const [avatarExplanation, setAvatarExplanation] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const avatarRef = useRef(null);

  const modelMap = {
    helmet: "/models/helmet.glb",
    astronaut: "/models/astronaut.glb",
  };

  function mapToKnownObject(text) {
    if (!text) return null;
    text = text.toLowerCase();
    if (text.includes("helmet") || text.includes("head") || text.includes("hard") || 
        text.includes("hat") || text.includes("gear")) return "helmet";
    if (text.includes("astronaut") || text.includes("space") || text.includes("suit")) 
      return "astronaut";
    return null;
  }

  const handleGenerate = async () => {
    try {
      let sourceText = input;
      if (imageFile) {
        // getting the file name only
        sourceText = imageFile.name.replace(/\.[^/.]+$/, "");
      }

      if (!sourceText) return;

      const normalized = await normalizeInput(sourceText);
      const mapped = mapToKnownObject(normalized);
      let modelUrl = mapped ? getDynamicModel(mapped) : null;

      if (!modelUrl) {
        const fallbackMap = { helmet: "/models/helmet.glb", astronaut: "/models/astronaut.glb" };
        modelUrl = fallbackMap[mapped];
      }

      if (modelUrl) {
        setModelUrl(modelUrl);
        const exp = await generateExplanation(mapped || normalized);
        setExplanation(exp);
      } else {
        setExplanation("Could not find a suitable 3D model. Try a different object.");
      }
    } catch (err) {
      console.error(err);
    }
  };


const handleCommand = async () => {
  try {
    const result = await parseCommand(command);
    console.log("Raw AI command result:", result);

    
    let normalizedAction = "idle";

    const rawAction = (result.action || "").toString().toLowerCase().trim();
    const rawTarget = (result.target || "").toString().toLowerCase().trim();

    // Normalization rules
    if (["wave", "greet", "hello", "hi"].includes(rawAction)) {
      normalizedAction = "wave";
    } 
    else if (["walk", "move", "go", "forward", "run"].includes(rawAction)) {
      normalizedAction = "walk";
    } 
    else if (["stop", "halt", "pause", "idle"].includes(rawAction)) {
      normalizedAction = "idle";
    } 
    else if (rawAction.includes("turn") || rawAction.includes("rotate")) {
      // temporary fallback until we add turning
      normalizedAction = "wave";
    }


    // Dispatch to avatar
    if (avatarRef.current) {
      avatarRef.current.performAction(normalizedAction, rawTarget);
      console.log("Command successfully dispatched to avatar");
      
      setAvatarExplanation("Thinking of an explanation...");
      const actionExp = await generateActionExplanation(normalizedAction, rawTarget);
      setAvatarExplanation(actionExp);
    } else {
      console.warn("Avatar ref not ready");
    }

  } catch (err) {
    console.error("Command handling failed:", err);
  }
};

  return (
    <div className="app-container">
      {/* Prototype 1 */}
      <div className="prototype-card">
        <h2>3D Asset Generator (Prototype 1)</h2>
        <div className="input-group">
          <input
            type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setImageFile(null);
            setImagePreviewUrl("");
          }}
          placeholder="Enter object (e.g. helmet)"
          disabled={!!imageFile}
        />
        <span style={{ color: "var(--text-secondary)" }}>OR</span>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setImageFile(file);
              setImagePreviewUrl(URL.createObjectURL(file));
              setInput("");
            }
          }}
        />
      </div>

      {imagePreviewUrl && (
        <div className="preview-container">
          <img src={imagePreviewUrl} alt="Upload preview" className="preview-img" />
          <p className="preview-hint">Simulating image vision...</p>
        </div>
      )}

      <button className="primary" onClick={handleGenerate}>Generate Object</button>

      <div style={{ marginTop: "20px" }}>
        <ModelViewer modelUrl={modelUrl} />
      </div>
      
      {explanation && (
        <div className="explanation-box">
          {explanation}
        </div>
      )}
      </div>

      {/* Prototype 2 */}
      <div className="prototype-card">
        <h2>Avatar Control (Prototype 2)</h2>
        <div className="input-group">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command (e.g. wave hello, walk forward)"
          />
          <button className="primary" onClick={handleCommand}>Run Command</button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <AvatarScene ref={avatarRef} />
        </div>
        
        {avatarExplanation && (
          <div className="explanation-box">
            <strong>AI Trainer:</strong> {avatarExplanation}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;