const THREE = window.THREE;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

class AntColony3D {
    constructor(root) {
        this.root = root;

        this.params = {
            ants: 220,
            evap: 0.32,
            sense: 0.65
        };

        this.clock = new THREE.Clock();

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;
        this.root.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x06070a, 0.25);

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(2.6, 2.0, 3.4);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;

        this.setupLights();
        this.setupTerrain();
        this.setupPheromoneField();
        this.setupAnts();
        this.bindUI();

        this.onResize();
        window.addEventListener('resize', () => this.onResize());

        this.animate();
    }

    setupLights() {
        this.scene.add(new THREE.AmbientLight(0xaad7c0, 0.25));

        const key = new THREE.DirectionalLight(0x22c55e, 1.15);
        key.position.set(2.5, 3.0, 2.0);
        this.scene.add(key);

        const warm = new THREE.DirectionalLight(0xf59e0b, 0.85);
        warm.position.set(-2.0, 2.0, -1.5);
        this.scene.add(warm);

        const rim = new THREE.PointLight(0xffffff, 0.7, 20);
        rim.position.set(0, 2.2, 0);
        this.scene.add(rim);
    }

    setupTerrain() {
        this.world = new THREE.Group();
        this.scene.add(this.world);

        const geo = new THREE.PlaneGeometry(8, 8, 120, 120);
        geo.rotateX(-Math.PI / 2);

        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const h = 0.18 * Math.sin(x * 1.2) * Math.cos(z * 1.15) + 0.10 * Math.sin((x + z) * 2.1);
            pos.setY(i, h);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
            color: 0x0b1020,
            metalness: 0.15,
            roughness: 0.92,
            emissive: 0x0a0b10,
            emissiveIntensity: 0.6
        });

        this.terrain = new THREE.Mesh(geo, mat);
        this.world.add(this.terrain);

        const grid = new THREE.GridHelper(8, 32, 0x1b2b2d, 0x0b1220);
        grid.position.y = 0.01;
        grid.material.opacity = 0.25;
        grid.material.transparent = true;
        this.world.add(grid);

        const nestGeo = new THREE.SphereGeometry(0.12, 20, 20);
        const nestMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.55, roughness: 0.3 });
        this.nest = new THREE.Mesh(nestGeo, nestMat);
        this.nest.position.set(-2.2, 0.12, -1.8);
        this.world.add(this.nest);

        const foodGeo = new THREE.SphereGeometry(0.14, 20, 20);
        const foodMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.55, roughness: 0.3 });
        this.food = new THREE.Mesh(foodGeo, foodMat);
        this.food.position.set(2.1, 0.14, 2.0);
        this.world.add(this.food);

        this.world.rotation.y = -0.35;
    }

    setupPheromoneField() {
        this.gridN = 96;
        this.pherA = new Float32Array(this.gridN * this.gridN);
        this.pherB = new Float32Array(this.gridN * this.gridN);

        const pherGeo = new THREE.PlaneGeometry(8, 8, this.gridN - 1, this.gridN - 1);
        pherGeo.rotateX(-Math.PI / 2);

        const colors = new Float32Array(pherGeo.attributes.position.count * 3);
        pherGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const pherMat = new THREE.MeshBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.pherMesh = new THREE.Mesh(pherGeo, pherMat);
        this.pherMesh.position.y = 0.02;
        this.world.add(this.pherMesh);
    }

    setupAnts() {
        this.antGeo = new THREE.ConeGeometry(0.03, 0.09, 10);
        this.antGeo.rotateX(Math.PI / 2);

        this.antMat = new THREE.MeshStandardMaterial({
            color: 0xe5e7eb,
            emissive: 0x111827,
            emissiveIntensity: 0.7,
            metalness: 0.35,
            roughness: 0.35
        });

        this.antsGroup = new THREE.Group();
        this.world.add(this.antsGroup);

        this.ants = [];
        this.spawnAnts(this.params.ants);
    }

    spawnAnts(count) {
        while (this.antsGroup.children.length) this.antsGroup.remove(this.antsGroup.children[0]);
        this.ants = [];

        for (let i = 0; i < count; i++) {
            const m = new THREE.Mesh(this.antGeo, this.antMat);
            const x = this.nest.position.x + (Math.random() - 0.5) * 0.4;
            const z = this.nest.position.z + (Math.random() - 0.5) * 0.4;
            m.position.set(x, 0.06, z);
            m.rotation.y = Math.random() * Math.PI * 2;
            this.antsGroup.add(m);

            const speed = 0.35 + Math.random() * 0.35;
            this.ants.push({
                m,
                dir: new THREE.Vector2(Math.cos(m.rotation.y), Math.sin(m.rotation.y)),
                speed,
                carrying: false,
                wander: Math.random() * 1000
            });
        }
    }

    worldToGrid(x, z) {
        const u = (x + 4) / 8;
        const v = (z + 4) / 8;
        const gx = clamp(Math.floor(u * this.gridN), 0, this.gridN - 1);
        const gz = clamp(Math.floor(v * this.gridN), 0, this.gridN - 1);
        return gx + gz * this.gridN;
    }

    samplePheromone(x, z) {
        const idx = this.worldToGrid(x, z);
        return this.pherA[idx];
    }

    depositPheromone(x, z, amount) {
        const idx = this.worldToGrid(x, z);
        this.pherA[idx] = Math.min(1, this.pherA[idx] + amount);
    }

    updatePheromones(dt) {
        const n = this.gridN;
        const evap = this.params.evap;

        for (let i = 0; i < this.pherA.length; i++) {
            this.pherB[i] = this.pherA[i] * (1 - evap * dt);
        }

        for (let z = 1; z < n - 1; z++) {
            for (let x = 1; x < n - 1; x++) {
                const i = x + z * n;
                const v = (
                    this.pherB[i] * 0.60 +
                    this.pherB[i - 1] * 0.10 +
                    this.pherB[i + 1] * 0.10 +
                    this.pherB[i - n] * 0.10 +
                    this.pherB[i + n] * 0.10
                );
                this.pherA[i] = v;
            }
        }

        const colors = this.pherMesh.geometry.attributes.color;
        for (let i = 0; i < colors.count; i++) {
            const p = clamp(this.pherA[i], 0, 1);
            const r = 0.10 + p * 0.90;
            const g = 0.35 + p * 0.55;
            const b = 0.10 + p * 0.25;
            colors.setXYZ(i, r, g, b);
        }
        colors.needsUpdate = true;
    }

    updateAnts(dt) {
        const sense = this.params.sense;
        const nest = this.nest.position;
        const food = this.food.position;

        for (const a of this.ants) {
            const m = a.m;
            const px = m.position.x;
            const pz = m.position.z;
            const dir = a.dir;

            const forward = { x: px + dir.x * 0.18 * sense, z: pz + dir.y * 0.18 * sense };
            const left = { x: px + (dir.x * 0.14 - dir.y * 0.12) * sense, z: pz + (dir.y * 0.14 + dir.x * 0.12) * sense };
            const right = { x: px + (dir.x * 0.14 + dir.y * 0.12) * sense, z: pz + (dir.y * 0.14 - dir.x * 0.12) * sense };

            const pf = this.samplePheromone(forward.x, forward.z);
            const pl = this.samplePheromone(left.x, left.z);
            const pr = this.samplePheromone(right.x, right.z);

            const tx = a.carrying ? nest.x : food.x;
            const tz = a.carrying ? nest.z : food.z;
            const toTarget = new THREE.Vector2(tx - px, tz - pz);
            const dist = toTarget.length();
            toTarget.normalize();

            const bias = a.carrying ? 0.85 : 0.55;
            const desire = new THREE.Vector2(dir.x, dir.y).lerp(toTarget, bias * clamp(1 - dist / 5.0, 0.25, 1));

            const pherSteer = new THREE.Vector2(0, 0);
            const pherW = 0.55 + (a.carrying ? 0.15 : 0.25);
            if (pl > pf && pl > pr) pherSteer.set(left.x - px, left.z - pz);
            else if (pr > pf && pr > pl) pherSteer.set(right.x - px, right.z - pz);
            else pherSteer.set(forward.x - px, forward.z - pz);
            pherSteer.normalize();

            // Wander
            a.wander += dt;
            const w = 0.35 * Math.sin(a.wander * (0.7 + (a.carrying ? 0.3 : 0.5)) + (px + pz) * 0.2);
            const wander = new THREE.Vector2(-dir.y, dir.x).multiplyScalar(w);

            const steer = desire.clone().multiplyScalar(0.65)
                .add(pherSteer.multiplyScalar(pherW))
                .add(wander);

            steer.normalize();
            a.dir.lerp(steer, dt * 2.0);
            a.dir.normalize();

            const speed = a.speed * (a.carrying ? 0.92 : 1.0);
            m.position.x += a.dir.x * speed * dt;
            m.position.z += a.dir.y * speed * dt;

            // Bounds
            if (m.position.x < -3.9 || m.position.x > 3.9) a.dir.x *= -1;
            if (m.position.z < -3.9 || m.position.z > 3.9) a.dir.y *= -1;
            m.position.x = clamp(m.position.x, -3.9, 3.9);
            m.position.z = clamp(m.position.z, -3.9, 3.9);

            // Height approx (since plane is relatively flat)
            m.position.y = 0.06;
            m.rotation.y = Math.atan2(a.dir.y, a.dir.x);

            // Deposit pheromones
            this.depositPheromone(m.position.x, m.position.z, dt * (a.carrying ? 0.55 : 0.25));

            // Pickup/drop
            const dFood = m.position.distanceTo(food);
            const dNest = m.position.distanceTo(nest);
            if (!a.carrying && dFood < 0.22) a.carrying = true;
            if (a.carrying && dNest < 0.22) a.carrying = false;

            // Tint emissive to show state
            m.material.emissive.setHex(a.carrying ? 0xf59e0b : 0x111827);
            m.material.emissiveIntensity = a.carrying ? 1.0 : 0.7;
        }
    }

    bindUI() {
        const ants = document.getElementById('ants');
        const evap = document.getElementById('evap');
        const sense = document.getElementById('sense');

        const antsVal = document.getElementById('antsVal');
        const evapVal = document.getElementById('evapVal');
        const senseVal = document.getElementById('senseVal');

        const sync = () => {
            this.params.ants = parseInt(ants.value, 10);
            this.params.evap = parseFloat(evap.value);
            this.params.sense = parseFloat(sense.value);

            antsVal.textContent = String(this.params.ants);
            evapVal.textContent = this.params.evap.toFixed(2);
            senseVal.textContent = this.params.sense.toFixed(2);
        };

        ants.addEventListener('input', () => {
            sync();
            this.spawnAnts(this.params.ants);
        });
        evap.addEventListener('input', sync);
        sense.addEventListener('input', sync);

        document.getElementById('scatter').addEventListener('click', () => {
            // Scatter ants around the world
            for (const a of this.ants) {
                a.m.position.x = (Math.random() - 0.5) * 7.2;
                a.m.position.z = (Math.random() - 0.5) * 7.2;
                a.dir.set(Math.cos(Math.random() * Math.PI * 2), Math.sin(Math.random() * Math.PI * 2));
                a.carrying = false;
            }
        });

        document.getElementById('reset').addEventListener('click', () => {
            ants.value = '220';
            evap.value = '0.32';
            sense.value = '0.65';
            sync();
            this.pherA.fill(0);
            this.pherB.fill(0);
            this.spawnAnts(this.params.ants);
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

        this.world.rotation.y = -0.35 + Math.sin(t * 0.08) * 0.02;

        this.updateAnts(dt);
        this.updatePheromones(dt);

        this.renderer.render(this.scene, this.camera);
    }
}

new AntColony3D(document.getElementById('app'));
