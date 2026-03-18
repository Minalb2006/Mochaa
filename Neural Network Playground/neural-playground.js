const THREE = window.THREE;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

class NeuralPlayground3D {
    constructor(root) {
        this.root = root;

        this.params = {
            layers: 5,
            width: 8,
            learning: 0.35
        };

        this.trainPulse = 0;
        this.clock = new THREE.Clock();

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.root.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x05060a, 0.22);

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(2.2, 1.35, 4.6);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;

        this.setupLights();
        this.buildNetwork();
        this.setupStarfield();
        this.bindUI();

        this.onResize();
        window.addEventListener('resize', () => this.onResize());

        this.animate();
    }

    setupLights() {
        this.scene.add(new THREE.AmbientLight(0xaab0ff, 0.30));

        const key = new THREE.DirectionalLight(0x3b82f6, 1.2);
        key.position.set(2.8, 2.0, 1.8);
        this.scene.add(key);

        const rim = new THREE.DirectionalLight(0xa855f7, 0.95);
        rim.position.set(-2.6, 1.0, -2.0);
        this.scene.add(rim);

        const core = new THREE.PointLight(0xffffff, 0.85, 30);
        core.position.set(0, 0.4, 0);
        this.scene.add(core);
    }

    setupStarfield() {
        const count = 2100;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        const c1 = new THREE.Color('#3b82f6');
        const c2 = new THREE.Color('#a855f7');
        const c3 = new THREE.Color('#f5d0fe');

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const r = 10 + Math.random() * 30;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);

            pos[i3 + 0] = r * Math.sin(ph) * Math.cos(th);
            pos[i3 + 1] = r * Math.cos(ph);
            pos[i3 + 2] = r * Math.sin(ph) * Math.sin(th);

            const mix = Math.random();
            const c = mix < 0.48 ? c1.clone().lerp(c2, Math.random()) : c3.clone().lerp(c2, Math.random() * 0.35);
            col[i3 + 0] = c.r;
            col[i3 + 1] = c.g;
            col[i3 + 2] = c.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.035,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.stars = new THREE.Points(geo, mat);
        this.scene.add(this.stars);
    }

    buildNetwork() {
        if (this.netGroup) {
            this.scene.remove(this.netGroup);
            this.netGroup.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
            });
        }

        this.netGroup = new THREE.Group();
        this.scene.add(this.netGroup);

        const layers = this.params.layers;
        const width = this.params.width;

        const nodeGeo = new THREE.SphereGeometry(0.06, 18, 18);
        this.nodeMat = new THREE.MeshStandardMaterial({
            color: 0x0b1028,
            metalness: 0.35,
            roughness: 0.25,
            emissive: 0x111827,
            emissiveIntensity: 0.9
        });

        this.nodes = [];
        this.links = [];

        const layerGap = 0.55;
        const yGap = 0.16;

        for (let l = 0; l < layers; l++) {
            const layerNodes = [];
            const x = (l - (layers - 1) / 2) * layerGap;

            for (let i = 0; i < width; i++) {
                const y = (i - (width - 1) / 2) * yGap;
                const z = Math.sin((i / Math.max(1, width - 1)) * Math.PI * 2) * 0.08;

                const m = new THREE.Mesh(nodeGeo, this.nodeMat.clone());
                m.position.set(x, y, z);

                // per-node phase
                m.userData.phase = Math.random() * Math.PI * 2;
                m.userData.layer = l;
                m.userData.index = i;

                this.netGroup.add(m);
                layerNodes.push(m);
            }

            this.nodes.push(layerNodes);
        }

        const linkMat = new THREE.LineBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.18
        });

        for (let l = 0; l < layers - 1; l++) {
            for (let i = 0; i < width; i++) {
                const a = this.nodes[l][i];
                const connectStride = clamp(Math.floor(2 + (width / 6)), 2, 4);

                for (let k = -1; k <= 1; k++) {
                    const j = i + k * connectStride;
                    if (j < 0 || j >= width) continue;
                    const b = this.nodes[l + 1][j];

                    const geo = new THREE.BufferGeometry().setFromPoints([a.position.clone(), b.position.clone()]);
                    const line = new THREE.Line(geo, linkMat.clone());
                    line.userData.a = a;
                    line.userData.b = b;
                    this.netGroup.add(line);
                    this.links.push(line);
                }
            }
        }

        // Outer shell
        const shellGeo = new THREE.SphereGeometry(2.1, 64, 64);
        const shellMat = new THREE.MeshBasicMaterial({
            color: 0xa855f7,
            transparent: true,
            opacity: 0.05,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.shell = new THREE.Mesh(shellGeo, shellMat);
        this.netGroup.add(this.shell);
    }

    bindUI() {
        const layers = document.getElementById('layers');
        const width = document.getElementById('width');
        const learning = document.getElementById('learning');

        const layersVal = document.getElementById('layersVal');
        const widthVal = document.getElementById('widthVal');
        const learningVal = document.getElementById('learningVal');

        const sync = () => {
            this.params.layers = parseInt(layers.value, 10);
            this.params.width = parseInt(width.value, 10);
            this.params.learning = parseFloat(learning.value);

            layersVal.textContent = String(this.params.layers);
            widthVal.textContent = String(this.params.width);
            learningVal.textContent = this.params.learning.toFixed(2);
        };

        layers.addEventListener('input', () => {
            sync();
            this.buildNetwork();
        });
        width.addEventListener('input', () => {
            sync();
            this.buildNetwork();
        });
        learning.addEventListener('input', sync);

        document.getElementById('train').addEventListener('click', () => {
            this.trainPulse = 1;
        });

        document.getElementById('reset').addEventListener('click', () => {
            layers.value = '5';
            width.value = '8';
            learning.value = '0.35';
            sync();
            this.buildNetwork();
        });

        sync();

        const loading = document.getElementById('loading');
        if (loading) {
            requestAnimationFrame(() => {
                loading.style.opacity = '0';
                loading.style.pointerEvents = 'none';
                setTimeout(() => loading.remove(), 450);
            });
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = Math.min(0.033, this.clock.getDelta());
        const t = this.clock.getElapsedTime();

        this.controls.update();

        // Pulse decay
        if (this.trainPulse > 0) {
            this.trainPulse = Math.max(0, this.trainPulse - dt * (1.6 + this.params.learning * 1.8));
        }

        const pulse = this.trainPulse;
        const learn = this.params.learning;

        // Animate nodes
        for (const layer of this.nodes) {
            for (const n of layer) {
                const phase = n.userData.phase;
                const wave = Math.sin(t * (1.25 + learn) + phase + n.userData.layer * 0.9);
                const act = clamp(0.5 + 0.5 * wave, 0, 1);

                const boost = 0.25 + act * 1.2 + pulse * 1.1;
                n.material.emissive.setHex(0x111827);
                const e = 0.2 + boost * 0.55;
                n.material.emissiveIntensity = e;

                // Blend tint between blue and purple
                const c = new THREE.Color('#3b82f6').lerp(new THREE.Color('#a855f7'), act * 0.8 + pulse * 0.2);
                n.material.color.set(c);

                const s = 1 + act * 0.35 + pulse * 0.55;
                n.scale.setScalar(s);

                n.position.z = Math.sin(t * 0.8 + phase) * 0.10 * (0.55 + act);
            }
        }

        // Animate links
        for (const l of this.links) {
            const a = l.userData.a;
            const b = l.userData.b;
            const pos = l.geometry.attributes.position;
            pos.setXYZ(0, a.position.x, a.position.y, a.position.z);
            pos.setXYZ(1, b.position.x, b.position.y, b.position.z);
            pos.needsUpdate = true;

            const aAct = a.scale.x - 1;
            const bAct = b.scale.x - 1;
            const strength = clamp((aAct + bAct) * 0.8 + pulse * 0.9, 0, 2);

            l.material.opacity = 0.10 + strength * 0.18;
            const col = new THREE.Color('#3b82f6').lerp(new THREE.Color('#a855f7'), strength * 0.35);
            l.material.color.copy(col);
        }

        // Shell
        this.shell.material.opacity = 0.03 + learn * 0.03 + pulse * 0.08;
        this.shell.scale.setScalar(1 + pulse * 0.12);

        // Starfield drift
        this.stars.rotation.y = t * 0.012;
        this.stars.rotation.x = t * 0.008;

        this.renderer.render(this.scene, this.camera);
    }
}

new NeuralPlayground3D(document.getElementById('app'));
