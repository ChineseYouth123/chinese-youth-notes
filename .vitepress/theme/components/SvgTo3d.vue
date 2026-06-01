<template>
  <div ref="containerRef" :class="['svg-to-3d', { compact }]" :style="containerStyle">
    <!-- Upload overlay -->
    <div
      v-if="!compact && !svgLoaded"
      class="upload-overlay"
      @drop.prevent="handleDrop"
      @dragover.prevent
      @click="triggerUpload"
    >
      <input ref="fileInput" type="file" accept=".svg" style="display:none" @change="handleFileSelect">
      <div class="upload-hint">
        <span class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </span>
        <p class="upload-text">{{ t("uploadHint") }}</p>
        <p class="upload-sub">{{ t("uploadSub") }}</p>
      </div>
    </div>

    <!-- 3D Canvas -->
    <div ref="canvasRef" v-show="canvasReady" class="canvas-container" />

    <!-- Zoom indicator -->
    <div v-if="canvasReady" class="zoom-level">{{ zoomText }}</div>

    <!-- Control panel -->
    <Transition name="slide-up">
      <div v-if="!compact && svgLoaded" class="control-panel">
        <div class="control-header" @click="panelOpen = !panelOpen">
          <span>{{ t("controls") }}</span>
          <span :class="['arrow', { open: panelOpen }]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
        <div v-show="panelOpen" class="control-body">
          <div class="control-group">
            <label>{{ t("depth") }} <code>{{ settings.depth }}</code></label>
            <input v-model.number="settings.depth" type="range" min="0.5" max="20" step="0.5">
          </div>
          <div class="control-group">
            <label>{{ t("bevelThickness") }} <code>{{ settings.bevelThickness }}</code></label>
            <input v-model.number="settings.bevelThickness" type="range" min="0" max="5" step="0.1">
          </div>
          <div class="control-group">
            <label>{{ t("bevelSize") }} <code>{{ settings.bevelSize }}</code></label>
            <input v-model.number="settings.bevelSize" type="range" min="0" max="3" step="0.1">
          </div>
          <div class="control-group">
            <label>{{ t("bevelSegments") }} <code>{{ settings.bevelSegments }}</code></label>
            <input v-model.number="settings.bevelSegments" type="range" min="0" max="10" step="1">
          </div>
          <div class="control-row">
            <label>{{ t("color") }}</label>
            <input v-model="settings.color" type="color" class="color-picker">
          </div>
          <div class="control-row">
            <label>{{ t("autoRotate") }}</label>
            <label class="toggle">
              <input v-model="autoRotate" type="checkbox">
              <span class="toggle-slider" />
            </label>
          </div>
          <div class="control-row">
            <label>{{ t("metalness") }} <code>{{ settings.metalness }}</code></label>
            <input v-model.number="settings.metalness" type="range" min="0" max="1" step="0.05">
          </div>
          <div class="control-row">
            <label>{{ t("roughness") }} <code>{{ settings.roughness }}</code></label>
            <input v-model.number="settings.roughness" type="range" min="0" max="1" step="0.05">
          </div>
          <button class="reset-btn" @click="resetCamera">{{ t("resetView") }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useData } from "vitepress";

import defaultSvgContent from "@/assets/logo1-3D.svg?raw";

const props = defineProps({
  width: { type: String, default: "100%" },
  height: { type: String, default: "500px" },
  compact: { type: Boolean, default: false },
  defaultSvg: { type: String, default: "" },
});

const { lang } = useData();

const i18n = {
  "zh-CN": {
    uploadHint: "点击或拖拽上传 SVG 文件",
    uploadSub: "支持单色填充的 SVG 矢量图形",
    controls: "控制面板",
    depth: "深度",
    bevelThickness: "倒角厚度",
    bevelSize: "倒角大小",
    bevelSegments: "倒角分段",
    color: "颜色",
    autoRotate: "自动旋转",
    metalness: "金属感",
    roughness: "粗糙度",
    resetView: "重置视角",
  },
  default: {
    uploadHint: "Click or drag to upload an SVG file",
    uploadSub: "Supports solid-filled SVG vector graphics",
    controls: "Controls",
    depth: "Depth",
    bevelThickness: "Bevel Thickness",
    bevelSize: "Bevel Size",
    bevelSegments: "Bevel Segments",
    color: "Color",
    autoRotate: "Auto Rotate",
    metalness: "Metalness",
    roughness: "Roughness",
    resetView: "Reset View",
  },
};

const t = (key) => i18n[lang.value]?.[key] || i18n.default[key];

const containerRef = ref(null);
const canvasRef = ref(null);
const fileInput = ref(null);
const svgLoaded = ref(false);
const canvasReady = ref(false);
const panelOpen = ref(false);
const autoRotate = ref(true);
const zoomLevel = ref(100);

const zoomText = computed(() => `${Math.round(zoomLevel.value)}%`);
let initialCamDist = 0;

const compactDefaults = {
  depth: 4,
  bevelThickness: 0.4,
  bevelSize: 0.2,
  bevelSegments: 2,
};

const settings = reactive({
  depth: props.compact ? compactDefaults.depth : 5,
  bevelThickness: props.compact ? compactDefaults.bevelThickness : 1,
  bevelSize: props.compact ? compactDefaults.bevelSize : 0.5,
  bevelSegments: props.compact ? compactDefaults.bevelSegments : 3,
  color: "#c5a84e",
  metalness: 0.85,
  roughness: 0.25,
});

const containerStyle = computed(() => {
  if (props.compact) return {};
  return { width: props.width, height: props.height };
});

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let meshGroup = null;
let animFrameId = null;
let svgSourceText = "";

const triggerUpload = () => fileInput.value?.click();

const handleFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (file) loadSvgFromFile(file);
};

const handleDrop = (e) => {
  const file = e.dataTransfer.files?.[0];
  if (file) loadSvgFromFile(file);
};

const loadSvg = async (svgText) => {
  svgLoaded.value = true;
  svgSourceText = svgText;
  await nextTick();
  await initThree();
  buildMesh(svgText);
};

const loadSvgFromFile = async (file) => {
  if (!file.name.endsWith(".svg")) {
    $message?.warning?.(t("uploadSub"));
    return;
  }
  try {
    const text = await file.text();
    loadSvg(text);
  } catch (err) {
    console.error("SVG load error:", err);
    svgLoaded.value = false;
  }
};

const initThree = async () => {
  const THREE = await import("three");
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

  const container = canvasRef.value;
  if (!container) return;
  const rect = container.parentElement.getBoundingClientRect();
  const w = rect.width || 160;
  const h = rect.height || 160;

  scene = new THREE.Scene();
  if (props.compact) {
    scene.background = null;
  }

  const far = props.compact ? 5000 : 1000;
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, far);
  camera.position.set(0, 0, 30);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !props.compact;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = props.compact ? 1.5 : 1.2;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = false;
  controls.minDistance = 3;
  controls.maxDistance = 100;
  controls.enablePan = !props.compact;
  controls.enableZoom = true;
  controls.rotateSpeed = props.compact ? 0.5 : 1;
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, props.compact ? 2.5 : 2);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = !props.compact;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.6);
  fillLight.position.set(-10, 0, 10);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff8844, 0.4);
  rimLight.position.set(0, -10, -10);
  scene.add(rimLight);

  const hemiLight = new THREE.HemisphereLight(0x4488ff, 0x002244, 0.4);
  scene.add(hemiLight);

  meshGroup = new THREE.Group();
  scene.add(meshGroup);

  canvasReady.value = true;
  animate();
};

const animate = () => {
  animFrameId = requestAnimationFrame(animate);
  if (controls) {
    controls.autoRotate = autoRotate.value;
    controls.update();
    const dist = camera.position.distanceTo(controls.target);
    const base = initialCamDist || 1;
    zoomLevel.value = (base / Math.max(dist, 0.1)) * 100;
  }
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
};

const buildMesh = async (svgText) => {
  const THREE = await import("three");
  const { SVGLoader } = await import("three/examples/jsm/loaders/SVGLoader.js");

  while (meshGroup?.children.length) {
    const child = meshGroup.children[0];
    meshGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  }

  const loader = new SVGLoader();
  const svgData = loader.parse(svgText);

  const extrudeSettings = {
    depth: settings.depth,
    bevelEnabled: settings.bevelThickness > 0 || settings.bevelSize > 0,
    bevelThickness: settings.bevelThickness,
    bevelSize: settings.bevelSize,
    bevelSegments: Math.max(1, Math.round(settings.bevelSegments)),
    curveSegments: 12,
  };

  const material = new THREE.MeshPhysicalMaterial({
    color: settings.color,
    metalness: settings.metalness,
    roughness: settings.roughness,
    emissive: new THREE.Color(settings.color),
    emissiveIntensity: props.compact ? 0.35 : 0.15,
    envMapIntensity: 1.0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  });

  let shapeCount = 0;

  svgData.paths.forEach((path) => {
    const subCount = path.subPaths?.length ?? 0;

    if (subCount >= 2) {
      // Multi-subpath path → create ring manually
      const outerBb = new THREE.Box2().setFromPoints(path.subPaths[0].getPoints(64));
      const innerBb = new THREE.Box2().setFromPoints(path.subPaths[1].getPoints(64));
      const outerW = outerBb.max.x - outerBb.min.x;
      const innerW = innerBb.max.x - innerBb.min.x;

      const outerIdx = outerW >= innerW ? 0 : 1;
      const innerIdx = outerIdx === 0 ? 1 : 0;

      const outerPts = path.subPaths[outerIdx].getPoints(64);
      const innerPts = path.subPaths[innerIdx].getPoints(64);
      const outerBox = new THREE.Box2().setFromPoints(outerPts);
      const innerBox = new THREE.Box2().setFromPoints(innerPts);

      const ox = (outerBox.min.x + outerBox.max.x) / 2;
      const oy = (outerBox.min.y + outerBox.max.y) / 2;
      const ix = (innerBox.min.x + innerBox.max.x) / 2;
      const iy = (innerBox.min.y + innerBox.max.y) / 2;
      const or = (outerBox.max.x - outerBox.min.x) / 2;
      const ir = (innerBox.max.x - innerBox.min.x) / 2;

      const ringShape = new THREE.Shape();
      ringShape.absarc(ox, oy, or, 0, Math.PI * 2, false);
      const holePath = new THREE.Path();
      holePath.absarc(ix, iy, ir, 0, Math.PI * 2, true);
      ringShape.holes.push(holePath);

      const g = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
      g.center();
      const m = new THREE.Mesh(g, material);
      m.castShadow = !props.compact;
      m.receiveShadow = !props.compact;
      if (props.compact) m.scale.set(0.08, 0.08, 0.08);
      meshGroup.add(m);
      shapeCount++;
    } else if (subCount === 1) {
      path.toShapes(false).forEach((s) => {
        const g = new THREE.ExtrudeGeometry(s, extrudeSettings);
        g.center();
        const m = new THREE.Mesh(g, material);
        m.castShadow = !props.compact;
        m.receiveShadow = !props.compact;
        if (props.compact) m.scale.set(0.08, 0.08, 0.08);
        meshGroup.add(m);
        shapeCount++;
      });
    }
  });

  if (!shapeCount) {
    svgLoaded.value = false;
    $message?.warning?.("No fill paths found in SVG");
    return;
  }

  // Auto-fit camera
  const box = new THREE.Box3().setFromObject(meshGroup);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const camMultiplier = props.compact ? 4 : 2.5;
  const dist = maxDim * camMultiplier;
  if (dist > 1) {
    camera.position.set(0, 0, dist);
    controls.target.set(0, 0, 0);
    controls.update();
    initialCamDist = camera.position.distanceTo(controls.target);
    zoomLevel.value = 100;
  }
};

const resetCamera = () => {
  if (!camera || !controls) return;
  camera.position.set(0, 0, 30);
  controls.target.set(0, 0, 0);
  controls.update();
};

watch(
  () => [settings.depth, settings.bevelThickness, settings.bevelSize, settings.bevelSegments],
  () => {
    if (!svgLoaded.value || !svgSourceText) return;
    buildMesh(svgSourceText);
  },
  { deep: true },
);

let rebuildTimer = null;
watch(
  () => [settings.color, settings.metalness, settings.roughness],
  () => {
    if (!svgLoaded.value || !meshGroup?.children?.length) return;
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      const child = meshGroup.children[0];
      if (child?.material) {
        child.material.color.set(settings.color);
        child.material.metalness = settings.metalness;
        child.material.roughness = settings.roughness;
        child.material.needsUpdate = true;
      }
    }, 50);
  },
);

let resizeObserver = null;
onMounted(() => {
  if (!containerRef.value) return;
  resizeObserver = new ResizeObserver(() => {
    if (!renderer || !camera || !canvasRef.value) return;
    const rect = canvasRef.value.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w > 0 && h > 0) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
  });
  resizeObserver.observe(containerRef.value);
  // In compact mode, auto-load the default SVG
  if (props.compact) {
    loadSvg(props.defaultSvg || defaultSvgContent);
  }
});

onBeforeUnmount(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  controls?.dispose();
  renderer?.dispose();
  if (meshGroup) {
    while (meshGroup.children.length) {
      const child = meshGroup.children[0];
      meshGroup.remove(child);
      child.geometry?.dispose();
      child.material?.dispose();
    }
  }
  resizeObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
.svg-to-3d {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 300px;

  &.compact {
    width: 100%;
    height: 100%;
    min-height: 0;
    border-radius: 0;
    border: none;
    background: transparent;
  }
}

.upload-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background 0.3s;
  &:hover {
    background: rgba(255, 255, 255, 0.03);
    .upload-icon { transform: translateY(-4px); }
  }
}

.upload-hint {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

.upload-icon {
  display: inline-block;
  transition: transform 0.3s ease;
  svg { stroke: rgba(255, 255, 255, 0.4); }
}

.upload-text {
  margin: 12px 0 4px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.upload-sub {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
}

.canvas-container {
  width: 100%;
  height: 100%;
  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
}

.zoom-level {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.control-panel {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 220px;
  background: rgba(10, 10, 26, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  z-index: 10;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.control-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  &:hover { background: rgba(255, 255, 255, 0.04); }
}

.arrow {
  display: inline-flex;
  transition: transform 0.25s ease;
  &.open { transform: rotate(180deg); }
}

.control-body {
  padding: 8px 14px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.control-group {
  margin-bottom: 10px;
  label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    code {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
  }
  input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #4fc3f7;
      border: 2px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: transform 0.2s;
      &:hover { transform: scale(1.2); }
    }
    &::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #4fc3f7;
      border: 2px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
    }
  }
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  label { flex: 1; }
  input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #4fc3f7;
      border: 2px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: transform 0.2s;
      &:hover { transform: scale(1.2); }
    }
    &::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #4fc3f7;
      border: 2px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
    }
  }
}

.color-picker {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  cursor: pointer;
  background: none;
  &::-webkit-color-swatch-wrapper { padding: 0; }
  &::-webkit-color-swatch { border: none; border-radius: 4px; }
}

.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  cursor: pointer;
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    &:checked + .toggle-slider { background: #4fc3f7; }
    &:checked + .toggle-slider::before { transform: translateX(18px); }
  }
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 22px;
  transition: background 0.3s;
  &::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.3s;
  }
}

.reset-btn {
  width: 100%;
  margin-top: 4px;
  padding: 7px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.85);
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
