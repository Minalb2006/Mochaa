const THREE = window.THREE;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

class MultiversePortal {
    constructor(root) {
        this.root = root;

        this.params = {
            stability: 0.62,
            swirl: 0.78,
            shards: 1.0
        };

        this.pulse = 0;
        this.clock = new THREE.Clock();

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.root.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0.6, 0.25, 3.2);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.9;
        this.controls.panSpeed = 0.6;
        this.controls.enablePan = true;

        this.scene.fog = new THREE.FogExp2(0x050611, 0.28);

        this.setupLights();
        this.setupPortal();
        this.setupFilaments();
        this.setupShards();
        this.setupStarfield();

        this.bindUI();
        this.onResize();
        window.addEventListener('resize', () => this.onResize());

        this.animate();
    }

    setupLights() {
        this.scene.add(new THREE.AmbientLight(0x99aaff, 0.4));

        const key = new THREE.DirectionalLight(0x88f7ff, 1.2);
        key.position.set(2.5, 2.3, 1.5);
        this.scene.add(key);

        const rim = new THREE.DirectionalLight(0xc08bff, 0.9);
        rim.position.set(-2.0, 1.2, -1.8);
        this.scene.add(rim);

        const fill = new THREE.PointLight(0x7c3aed, 1.4, 20);
        fill.position.set(0, 0.2, 2.2);
        this.scene.add(fill);

        const core = new THREE.PointLight(0x22d3ee, 1.6, 10);
        core.position.set(0, 0, 0);
        this.scene.add(core);
    }

    setupPortal() {
        this.group = new THREE.Group();
        this.scene.add(this.group);

        const ringGeo = new THREE.TorusGeometry(1.08, 0.09, 48, 240);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x141632,
            metalness: 0.65,
            roughness: 0.22,
            emissive: 0x1b144a,
            emissiveIntensity: 0.75
        });
        this.ring = new THREE.Mesh(ringGeo, ringMat);
        this.ring.rotation.x = Math.PI * 0.5;
        this.group.add(this.ring);

        const coreGeo = new THREE.SphereGeometry(0.62, 96, 96);
        const coreMat = new THREE.MeshPhysicalMaterial({
            color: 0x050611,
            metalness: 0.0,
            roughness: 0.1,
            transmission: 0.65,
            thickness: 0.9,
            ior: 1.35,
            transparent: true,
            emissive: 0x0b0b26,
            emissiveIntensity: 1.1
        });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        this.group.add(this.core);

        const auraGeo = new THREE.SphereGeometry(0.86, 64, 64);
        const auraMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.10,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.aura = new THREE.Mesh(auraGeo, auraMat);
        this.group.add(this.aura);
    }

    setupFilaments() {
        const count = 14;
        this.filaments = [];

        for (let i = 0; i < count; i++) {
            const points = [];
            const steps = 180;
            const phase = (i / count) * Math.PI * 2;

            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const angle = t * Math.PI * 8 + phase;
                const radius = 0.45 + 0.35 * Math.sin(t * Math.PI * 2 + phase);
                const x = Math.cos(angle) * radius;
                const y = (t - 0.5) * 1.2;
                const z = Math.sin(angle) * radius;
                points.push(new THREE.Vector3(x, y, z));
            }

            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({
                color: i % 2 === 0 ? 0x22d3ee : 0x7c3aed,
                transparent: true,
                opacity: 0.65
            });
            const line = new THREE.Line(geo, mat);
            line.scale.setScalar(0.9);
            this.group.add(line);
            this.filaments.push({ line, phase });
        }
    }

    setupShards() {
        const geo = new THREE.IcosahedronGeometry(0.06, 0);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x0b1028,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x7c3aed,
            emissiveIntensity: 0.55
        });

        this.shards = [];
        const base = 120;

        for (let i = 0; i < base; i++) {
            const m = new THREE.Mesh(geo, mat);
            const a = Math.random() * Math.PI * 2;
            const b = (Math.random() - 0.5) * Math.PI;
            const r = 1.25 + Math.random() * 1.75;
            m.position.set(
                Math.cos(a) * Math.cos(b) * r,
                Math.sin(b) * r,
                Math.sin(a) * Math.cos(b) * r
            );
            m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            const spin = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.6);
            const drift = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(0.25);
            const seed = Math.random() * 10;
            this.group.add(m);
            this.shards.push({ m, spin, drift, seed });
        }
    }

    setupStarfield() {
        const count = 2400;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        const c1 = new THREE.Color('#7c3aed');
        const c2 = new THREE.Color('#22d3ee');
        const c3 = new THREE.Color('#f5d0fe');

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const r = 8 + Math.random() * 26;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);

            pos[i3 + 0] = r * Math.sin(ph) * Math.cos(th);
            pos[i3 + 1] = r * Math.cos(ph);
            pos[i3 + 2] = r * Math.sin(ph) * Math.sin(th);

            const mix = Math.random();
            const c = mix < 0.45 ? c1.clone().lerp(c2, Math.random()) : c3.clone().lerp(c2, Math.random() * 0.45);
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
        const stability = document.getElementById('stability');
        const swirl = document.getElementById('swirl');
        const shards = document.getElementById('shards');

        const stabilityVal = document.getElementById('stabilityVal');
        const swirlVal = document.getElementById('swirlVal');
        const shardsVal = document.getElementById('shardsVal');

        const sync = () => {
            this.params.stability = parseFloat(stability.value);
            this.params.swirl = parseFloat(swirl.value);
            this.params.shards = parseFloat(shards.value);

            stabilityVal.textContent = this.params.stability.toFixed(2);
            swirlVal.textContent = this.params.swirl.toFixed(2);
            shardsVal.textContent = this.params.shards.toFixed(2);
        };

        stability.addEventListener('input', sync);
        swirl.addEventListener('input', sync);
        shards.addEventListener('input', sync);

        document.getElementById('pulse').addEventListener('click', () => {
            this.pulse = 1;
        });

        document.getElementById('reset').addEventListener('click', () => {
            stability.value = '0.62';
            swirl.value = '0.78';
            shards.value = '1.0';
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

        const stability = this.params.stability;
        const swirl = this.params.swirl;
        const shardDensity = this.params.shards;

        const corePulse = 0.08 + 0.06 * Math.sin(t * (1.4 + swirl * 1.8));

        this.group.rotation.y += dt * (0.22 + swirl * 0.55);
        this.group.rotation.x = Math.sin(t * 0.25) * 0.06;

        this.ring.material.emissiveIntensity = 0.55 + (1 - stability) * 0.65 + corePulse;

        this.core.material.thickness = 0.65 + (1 - stability) * 0.65;
        this.core.material.transmission = clamp(0.55 + stability * 0.35 + corePulse, 0.35, 0.95);

        this.aura.scale.setScalar(1 + corePulse * 0.9);
        this.aura.material.opacity = 0.08 + corePulse * 0.35;

        const filamentSpeed = 0.8 + swirl * 2.0;
        for (const f of this.filaments) {
            const wobble = (1 - stability) * 0.35;
            f.line.rotation.y = (t * filamentSpeed + f.phase) * 0.35;
            f.line.rotation.z = Math.sin(t * 0.7 + f.phase) * 0.12 * wobble;
            f.line.material.opacity = 0.45 + corePulse * 0.55;
        }

        // Shards: orbit around the portal. Density slider changes their visibility.
        const visibleCount = Math.floor(this.shards.length * clamp(shardDensity / 2, 0, 1));
        for (let i = 0; i < this.shards.length; i++) {
            const s = this.shards[i];
            const m = s.m;
            m.visible = i < visibleCount;
            if (!m.visible) continue;

            const speed = 0.15 + swirl * 0.55;
            const a = t * speed + s.seed;
            const r = 1.35 + 0.85 * Math.sin(t * 0.5 + s.seed) * (0.4 + (1 - stability) * 0.6);

            const px = Math.cos(a) * r;
            const pz = Math.sin(a * (1.0 + swirl * 0.55)) * r;
            const py = Math.sin(a * 1.35) * 0.75;

            m.position.set(px, py, pz);
            m.rotation.x += dt * (0.55 + s.spin.x);
            m.rotation.y += dt * (0.65 + s.spin.y);
            m.rotation.z += dt * (0.45 + s.spin.z);

            const lens = 1 + corePulse * 0.7 + this.pulse * 0.7;
            m.scale.setScalar(lens);
        }

        // Starfield drift
        this.stars.rotation.y = t * 0.015;
        this.stars.rotation.x = t * 0.008;

        // Pulse decay
        if (this.pulse > 0) {
            this.pulse = Math.max(0, this.pulse - dt * 1.7);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

const root = document.getElementById('app');
new MultiversePortal(root);
