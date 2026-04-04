import { forwardRef, useRef, useImperativeHandle, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const AvatarScene = forwardRef((props, ref) => {
  const mountRef = useRef(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  // Animation Refs
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const currentActionRef = useRef(null);
  const avatarModelRef = useRef(null);
  const walkTimeoutRef = useRef(null);

  useImperativeHandle(ref, () => ({
    performAction: (actionName, targetName) => {
      console.log("performAction called with:", actionName, targetName);

      // Handle environment targeting
      if (avatarModelRef.current) {
        if (targetName && targetName.includes("table")) {
           // Look at the table
           const targetPos = new THREE.Vector3(1.5, avatarModelRef.current.position.y, 1.2);
           avatarModelRef.current.lookAt(targetPos);
        } else {
           // reset rotation to default if not specifying a target
           avatarModelRef.current.rotation.set(0, 0, 0);
        }
      }

      let targetAction = "idle";
      if (actionName === "wave") targetAction = "wave";
      else if (actionName === "walk") targetAction = "walk";
      else if (actionName === "idle" || actionName === "stop") targetAction = "idle";

      const nextAction = actionsRef.current[targetAction];
      const prevAction = currentActionRef.current;

      if (!nextAction || nextAction === prevAction) return;

      nextAction.reset().play();
      if (prevAction) {
        nextAction.crossFadeFrom(prevAction, 0.5, true);
      }

      currentActionRef.current = nextAction;

      // Clear any existing walk timeout
      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
      
      // stop walking after 2.5 seconds to simulate "arriving" at the target
      if (targetAction === "walk") {
        walkTimeoutRef.current = setTimeout(() => {
           const idleAct = actionsRef.current["idle"];
           const currAct = currentActionRef.current;
           if (idleAct && currAct === nextAction) {
              idleAct.reset().play();
              idleAct.crossFadeFrom(currAct, 0.5, true);
              currentActionRef.current = idleAct;
           }
        }, 2500);
      }
    }
  }));

  useEffect(() => {
    if (mountRef.current) {
      mountRef.current.innerHTML = "";
    }

    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x1a1a2e);
    scene.background = new THREE.Color(0xeeeeee);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Adding Table to the scene
    const tableGroup = new THREE.Group();
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x8b5a2b });
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.5), tableMaterial);
    tableTop.position.y = 0.4;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    
    const legGeo = new THREE.BoxGeometry(0.05, 0.4, 0.05);
    const leg1 = new THREE.Mesh(legGeo, tableMaterial); leg1.position.set(-0.35, 0.2, -0.2); leg1.castShadow = true;
    const leg2 = new THREE.Mesh(legGeo, tableMaterial); leg2.position.set(0.35, 0.2, -0.2); leg2.castShadow = true;
    const leg3 = new THREE.Mesh(legGeo, tableMaterial); leg3.position.set(-0.35, 0.2, 0.2); leg3.castShadow = true;
    const leg4 = new THREE.Mesh(legGeo, tableMaterial); leg4.position.set(0.35, 0.2, 0.2); leg4.castShadow = true;
    
    tableGroup.add(tableTop, leg1, leg2, leg3, leg4);
    tableGroup.position.set(1.5, -1.2, 1.2);
    scene.add(tableGroup);

    const loader = new GLTFLoader();

    //Load the base model
    loader.load('/models/idle.glb', (gltf) => {
      const model = gltf.scene;
      
      // Setup Shadows
      model.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });

      // scale & center
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      
      // scale to fit well in the view
      const scale = 2.5 / size;
      model.scale.setScalar(scale);
      
      // center animation horizontally but keep feet on the floor
      const center = box.getCenter(new THREE.Vector3());
      model.position.x = -center.x * scale;
      model.position.z = -center.z * scale;
      
      // shift down slightly so shoes hit the bottom
      model.position.y = -box.min.y * scale - 1.2;
      
      avatarModelRef.current = model;
      scene.add(model);

      const mixer = new THREE.AnimationMixer(model);
      mixerRef.current = mixer;

      // Extract idle animation
      const idleClip = gltf.animations[0];
      if (idleClip) {
        const action = mixer.clipAction(idleClip);
        actionsRef.current['idle'] = action;
        action.play();
        currentActionRef.current = action;
      }

      //Loading the walk animation
      loader.load('/models/walk.glb', (walkGltf) => {
        const walkClip = walkGltf.animations[0];
        if (walkClip) {
          const walkAction = mixer.clipAction(walkClip);
          actionsRef.current['walk'] = walkAction;
        }
      });

      //Loading th wave animation
      loader.load('/models/wave.glb', (waveGltf) => {
        const waveClip = waveGltf.animations[0];
        if (waveClip) {
          const waveAction = mixer.clipAction(waveClip);
          waveAction.loop = THREE.LoopOnce;
          waveAction.clampWhenFinished = true;
          actionsRef.current['wave'] = waveAction;
        }
      });

      mixer.addEventListener('finished', (e) => {
        if (e.action === actionsRef.current['wave']) {
          const idleAction = actionsRef.current['idle'];
          if (idleAction) {
            idleAction.reset().play();
            idleAction.crossFadeFrom(e.action, 0.5, true);
            currentActionRef.current = idleAction;
          }
        }
      });
    }, undefined, (error) => {
        console.error("Error loading idle.glb", error);
    });

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    clockRef.current.start();
    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {}
      }
      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
    };
  }, []);

  return <div ref={mountRef} style={{ width: 400, height: 400, border: "1px solid var(--border-color)", borderRadius: "12px", overflow: "hidden" }} />;
});

export default AvatarScene;