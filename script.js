window.addEventListener("DOMContentLoaded", () => {
  // Basic Setup
  let paused = false;
  let darkTheme = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  const light = new THREE.PointLight(0xffffff, 2, 500);
  light.position.set(0, 0, 0);
  scene.add(light);

  // Starfield Background
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff });
  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(200);
    const y = THREE.MathUtils.randFloatSpread(200);
    const z = THREE.MathUtils.randFloatSpread(200);
    starVertices.push(x, y, z);
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);

  // Sun
  const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  // Planet data: [name, color, orbit radius, size, orbit speed]
  const planetData = [
    ['Mercury', 0xaaaaaa, 4, 0.3, 0.02],
    ['Venus', 0xffcc99, 6, 0.5, 0.015],
    ['Earth', 0x3399ff, 8, 0.5, 0.01],
    ['Mars', 0xff3300, 10, 0.4, 0.008],
    ['Jupiter', 0xff9966, 13, 1.1, 0.006],
    ['Saturn', 0xffffcc, 16, 0.9, 0.005],
    ['Uranus', 0x66ffff, 19, 0.7, 0.004],
    ['Neptune', 0x3366ff, 22, 0.7, 0.003]
  ];

  const planetOrbits = [];
  const controlsContainer = document.getElementById("controls");
  const tooltip = document.getElementById("tooltip");

  // Create planets and UI
  planetData.forEach(([name, color, distance, size, speed], index) => {
    const orbit = new THREE.Object3D();
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color });
    const planet = new THREE.Mesh(geometry, material);
    planet.name = name;
    planet.position.x = distance;
    orbit.add(planet);
    orbit.userData = { speed, index, planet };
    planetOrbits.push(orbit);
    scene.add(orbit);

    // UI slider for speed control
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <label for="slider-${index}">${name}: <span id="val-${index}">${speed.toFixed(3)}</span></label><br>
      <input type="range" id="slider-${index}" min="0" max="0.05" step="0.001" value="${speed}" />
      <br><br>
    `;
    controlsContainer.appendChild(wrapper);

    document.getElementById(`slider-${index}`).addEventListener("input", (e) => {
      const newSpeed = parseFloat(e.target.value);
      orbit.userData.speed = newSpeed;
      document.getElementById(`val-${index}`).textContent = newSpeed.toFixed(3);
    });
  });

  // Camera controls
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(
      planetOrbits.map((o) => o.children[0])
    );
    if (intersects.length > 0) {
      camera.position.set(
        intersects[0].object.position.x + 5,
        intersects[0].object.position.y + 5,
        intersects[0].object.position.z + 5
      );
      camera.lookAt(intersects[0].object.position);
    }
  });

  // Tooltip hover
  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(
      planetOrbits.map((o) => o.children[0])
    );
    if (intersects.length > 0) {
      tooltip.style.display = "block";
      tooltip.textContent = intersects[0].object.name;
      tooltip.style.left = event.clientX + 10 + "px";
      tooltip.style.top = event.clientY + 10 + "px";
    } else {
      tooltip.style.display = "none";
    }
  });

  // Pause/Resume
  const pauseBtn = document.getElementById("pauseBtn");
  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  });

  // Theme toggle
  const toggleTheme = document.getElementById("themeToggle");
  toggleTheme.addEventListener("click", () => {
    darkTheme = !darkTheme;
    renderer.setClearColor(darkTheme ? 0x000000 : 0xffffff);
    toggleTheme.textContent = darkTheme ? "Light Theme" : "Dark Theme";
  });

  // Initial background color
  renderer.setClearColor(0x000000);

  // Camera position
  camera.position.z = 30;

  // Animate
  function animate() {
    requestAnimationFrame(animate);
    if (!paused) {
      planetOrbits.forEach((orbit) => {
        orbit.rotation.y += orbit.userData.speed;
      });
    }
    renderer.render(scene, camera);
  }
  animate();
});
