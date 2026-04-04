# NexEra Learning Scenarios: AI & 3D Prototypes

This repository contains two interactive prototypes demonstrating how AI and WebGL rendering can be combined to orchestrate human learning scenarios and dynamic asset generation.

## Prototypes Overview

1. **AI-Generated 3D Asset Pipeline**  
   A workflow that accepts natural language inputs (or image uploads via simulated metadata mapping) to retrieve, process, scale, and render educational 3D models in the browser, complete with a context-aware AI summary.
   
2. **AI-Driven Interactive Avatar Coaching**  
   A foundational architecture for an AI learning coach. Natural language commands are parsed into strict semantic JSON, which triggers an interactive 3D humanoid avatar. The avatar utilizes a `THREE.AnimationMixer` to dynamically blend skeletal animations (Idle, Walk, Wave) while reacting to spatial targets in the environment (e.g., walking toward the table).

---

## Tech Stack & Libraries

This project was built from scratch leveraging modern web tools to ensure high performance and low latency.

* **Core Framework:** React running on Vite
* **3D Rendering:** Three.js to precisely shape 3D models and smoothly mix different animations together in real-time.
* **Controls:** `three-stdlib` (OrbitControls)
* **Networking requests:** `axios`
* **AI Middleware Pipeline:** Custom JS fetch layers mapping human intent to JSON via **OpenRouter** API.
* **3D Assets:** Standard `.glb` models use`GLTFLoader`. Animations coming from Adobe Mixamo.

---

## Setup & Installation Instructions

To run the project, follow these steps from the very beginning:

### 1. Prerequisites
Ensure you have **Node.js** installed on your system.

### 2. Clone the Repository
Clone this repository to your local machine and navigate into the project directory:
```bash
git clone https://github.com/Luyolo23/nexera-ai-project.git
cd nexera-ai
```

### 3. Install Dependencies
Run the following commands to download all required packages (React, Three.js, Axios, etc):
```bash
npm install
npm install three axios
```

### 4. Setup Environment Variables
The project requires an OpenRouter API key to power the AI logic parser. 
1. In the root directory of the project, create a new file named `.env`.
2. Inside that file, paste your API key matching this format:
```text
VITE_OPENROUTER_API_KEY=place_api_key_here
```

### 5. Start the development server
Start the server to launch the app:
```bash
npm run dev
```

Open `http://localhost:5173/` to interact with the prototypes!

---

## Key File Structure
* `src/App.jsx`: The main dashboard overlay and React state logic.
* `src/components/AvatarScene.jsx`: This is the main 3D engine for 'Prototype 2.' It loads the 3D files, displays them on the screen, and makes sure the character movements transition smoothly.
* `src/services/commandParser.js`: Our AI parsing pipeline that strictly limits the LLM to outputting operational JSON.
* `public/models/`: Contains the 3D models (`idle.glb`) and animation tracks (`walk.glb`, `wave.glb`) used to construct the interactive sequences.

## Limitations & Next Steps
* **Simulated Vision Models:** Instead of using AI to look at images, the system reads the filenames to guess what’s in them instantly. Next steps would hook this directly into `GPT-4-Vision` for true pixel analysis.
* **Asset Availability:** Right now, the 3D models are just stored on the computer. In the future, I’d use an AI service to create an endless variety of new 3D objects.
