# The Technical Explanation Outline

## **What I Built**

* **Prototype 1:** An **asset generation pipeline** that takes context (text or uploaded image) and retrieves/prepares a correctly scaled 3D educational model.
* **Prototype 2:** A **human-like avatar interface** capable of parsing natural language commands into semantic actions (wave, walk, idle) and smoothly interpolating rigged 3D animations dynamically via `THREE.AnimationMixer`.

---

## **Why I Chose This Approach & Architecture**

* **React + Vite:** Chosen for fast, component-driven UI development and optimized build speeds.
* **Three.js:** Used to gain **low-level control** over 3D meshes, shadow casting, and animation keyframes without the heavy overhead of loading a full Unity WebGL instance in the browser.
* **OpenRouter:** Acted as a **"Middleware Engine."** Rather than pure chat, the AI was structured to output **strict JSON** to act as logical parsers (`commandParser.js`) and normalization layers between human input and rigid 3D system states.

---

## **What I Found Challenging & How I Solved It**

### **Challenge: Mapping Unpredictable Human Language**
* **Issue:** Interpreting varied inputs (e.g., "say hi to the user") into strict animation keys.
* **Solution:** Built an **AI-powered command parser** that forces strict JSON formatting, coupled with a robust **runtime normalization layer** that falls back safely.

### **Challenge: Handling Rigged Animations Seamlessly on the Web**
* **Issue:** Managing complex animations without performance lag or stuttering.
* **Solution:** Architected a **base-model workflow** where a single skeletal mesh (`idle.glb`) is loaded first. Supplementary animations (`wave.glb`, `walk.glb`) are then parsed dynamically and fed into a global `AnimationMixer` for organic `crossFadeTo()` blending.

---

## **How to Scale Inside NexEra’s Platform**

* **Dynamic Asset Generation:** Swap the "mock" local GLB retrieval with a live API call to services like **OpenAI Shap-E** or **Luma AI** to generate meshes on the fly.
* **Multimodal Integration:** Pass image uploads to a vision model (like **GPT-4-Vision**) to extract dimensions, object properties, and context before pushing data to the 3D viewer.
* **Avatar Streaming:** Upgrade from pre-baked Mixamo `.glb` files to a **real-time rigged avatar streaming solution** (such as Ready Player Me combined with DeepMotion) for infinite contextual movement.