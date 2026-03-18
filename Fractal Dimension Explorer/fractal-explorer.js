const THREE = window.THREE;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function hash(n) {
    const x = Math.sin(n) * 10000;
    return x - Math.floor(x);
}

class FractalDimensionExplorer {
    constructor(root) {
        this.root = root;

        this.params = {
            dimension: 2.35,
            fold: 0.72,
            density: 1.10
        };

        this.warp = 0;
        this.clock = new THREE.Clock();

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.12;
        this.root.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x04040b, 0.19);

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(1.6, 1.0, 4.6);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.9;
        this.controls.panSpeed = 0.6;

        this.setupLights();
        this.setupField();
        this.setupStarfield();
        this.bindUI();

        this.onResize();
        window.addEventListener('resize', () => this.onResize());

        this.animate();
    }

    setupLights() {
        this.scene.add(new THREE.AmbientLight(0xaab0ff, 0.34));

        const key = new THREE.DirectionalLight(0x38bdf8, 1.15);
        key.position.set(2.4, 2.2, 1.5);
        this.scene.add(key);

        const rim = new THREE.DirectionalLight(0xfb7185, 0.95);
        rim.position.set(-2.5, 1.0, -1.8);
        this.scene.add(rim);

        const core = new THREE.PointLight(0xffffff, 1.2, 30);
        core.position.set(0, 0, 0);
        this.scene.add(core);
    }

    setupField() {
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.nodes = new THREE.Group();
        this.links = new THREE.Group();
        this.group.add(this.links);
        this.group.add(this.nodes);

        const nodeGeo = new THREE.SphereGeometry(0.03, 12, 12);
        const nodeMat = new THREE.MeshStandardMaterial({
            color: 0x0b1028,
            emissive: 0xfb7185,
            emissiveIntensity: 0.55,
            metalness: 0.45,
            roughness: 0.25
        });

        const linkMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.22
        });

        this.nodeData = [];
        this.linkLines = [];

        // Base lattice grid
        const grid = 14;
        for (let x = -grid; x <= grid; x++) {
            for (let y = -grid; y <= grid; y++) {
                for (let z = -grid; z <= grid; z++) {
                    const id = (x + grid) * 1000000 + (y + grid) * 1000 + (z + grid);
                    const r = Math.sqrt(x * x + y * y + z * z);
                    if (r > grid * 0.86) continue;

                    const m = new THREE.Mesh(nodeGeo, nodeMat);
                    m.position.set(x, y, z).multiplyScalar(0.12);
                    m.scale.setScalar(0.75 + hash(id) * 0.75);
                    this.nodes.add(m);
                    this.nodeData.push({ m, id, base: m.position.clone() });
                }
            }
        }

        // Sparse links by nearest neighbors in the lattice
        for (let i = 0; i < this.nodeData.length; i += 6) {
            const a = this.nodeData[i];
            const ai = a.base;
            for (let k = 1; k <= 4; k++) {
                const j = i + k * 3;
                if (!this.nodeData[j]) break;
                const b = this.nodeData[j];
                const bj = b.base;
                if (ai.distanceTo(bj) > 0.35) continue;

                const geo = new THREE.BufferGeometry().setFromPoints([ai.clone(), bj.clone()]);
                const line = new THREE.Line(geo, linkMat);
                this.links.add(line);
                this.linkLines.push({ line, a, b });
            }
        }

        // Outer shell
        const shellGeo = new THREE.SphereGeometry(2.05, 64, 64);
        const shellMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.06,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.shell = new THREE.Mesh(shellGeo, shellMat);
        this.group.add(this.shell);
    }

    setupStarfield() {
        const count = 2200;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const c1 = new THREE.Color('#38bdf8');
        const c2 = new THREE.Color('#fb7185');
        const c3 = new THREE.Color('#fde68a');

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const r = 10 + Math.random() * 30;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            pos[i3 + 0] = r * Math.sin(ph) * Math.cos(th);
            pos[i3 + 1] = r * Math.cos(ph);
            pos[i3 + 2] = r * Math.sin(ph) * Math.sin(th);

            const mix = Math.random();
            const c = (mix < 0.48 ? c1.clone().lerp(c2, Math.random()) : c3.clone().lerp(c1, Math.random() * 0.3));
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

    bindUI() {
        const dim = document.getElementById('dimension');
        const fold = document.getElementById('fold');
        const density = document.getElementById('density');

        const dimVal = document.getElementById('dimensionVal');
        const foldVal = document.getElementById('foldVal');
        const densVal = document.getElementById('densityVal');

        const sync = () => {
            this.params.dimension = parseFloat(dim.value);
            this.params.fold = parseFloat(fold.value);
            this.params.density = parseFloat(density.value);

            dimVal.textContent = this.params.dimension.toFixed(2);
            foldVal.textContent = this.params.fold.toFixed(2);
            densVal.textContent = this.params.density.toFixed(2);
        };

        dim.addEventListener('input', sync);
        fold.addEventListener('input', sync);
        density.addEventListener('input', sync);

        document.getElementById('warp').addEventListener('click', () => {
            this.warp = 1;
        });

        document.getElementById('reset').addEventListener('click', () => {
            dim.value = '2.35';
            fold.value = '0.72';
            density.value = '1.10';
            sync();
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

        const t = this.clock.getElapsedTime();
        const dt = this.clock.getDelta();
        this.controls.update();

        const dimension = this.params.dimension;
        const fold = this.params.fold;
        const density = this.params.density;

        // Warp kick
        if (this.warp > 0) {
            this.warp = Math.max(0, this.warp - dt * 1.6);
        }

        const warp = this.warp;
        const spin = 0.06 + (dimension - 1.5) * 0.04;
        this.group.rotation.y = t * spin;
        this.group.rotation.x = Math.sin(t * 0.22) * 0.15;

        // Morph nodes using a cheap "folding" field to evoke dimension changes
        const foldStrength = 0.15 + fold * 0.55;
        const densStrength = 0.6 + density * 0.9;

        for (const n of this.nodeData) {
            const base = n.base;
            const id = n.id;
            const h = hash(id);

            const fx = Math.sin((base.y * 3.5 + t * 1.2) + h * 6.0);
            const fy = Math.cos((base.z * 3.1 + t * 1.1) + h * 5.0);
            const fz = Math.sin((base.x * 3.8 + t * 1.05) + h * 7.0);

            const dimWarp = (dimension - 2.0) * 0.12;

            n.m.position.set(
                base.x + fx * foldStrength * 0.12 * densStrength + dimWarp * fz,
                base.y + fy * foldStrength * 0.12 * densStrength + dimWarp * fx,
                base.z + fz * foldStrength * 0.12 * densStrength + dimWarp * fy
            );

            const pulse = 0.75 + 0.55 * Math.sin(t * (1.2 + fold) + h * 10.0);
            n.m.material.emissiveIntensity = 0.35 + pulse * 0.55 + warp * 0.9;
            n.m.scale.setScalar((0.55 + h * 0.85) * (0.85 + density * 0.25) * (1 + warp * 0.7));
        }

        // Update links
        for (const l of this.linkLines) {
            const pos = l.line.geometry.attributes.position;
            pos.setXYZ(0, l.a.m.position.x, l.a.m.position.y, l.a.m.position.z);
            pos.setXYZ(1, l.b.m.position.x, l.b.m.position.y, l.b.m.position.z);
            pos.needsUpdate = true;

            l.line.material.opacity = 0.10 + density * 0.12 + warp * 0.25;
        }

        this.shell.material.opacity = 0.04 + fold * 0.04 + warp * 0.12;
        this.shell.scale.setScalar(1 + warp * 0.18);

        this.stars.rotation.y = t * 0.012;
        this.stars.rotation.x = t * 0.008;

        this.renderer.render(this.scene, this.camera);
    }
}

new FractalDimensionExplorer(document.getElementById('app'));
