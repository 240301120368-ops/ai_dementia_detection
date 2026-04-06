import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const Ballpit = ({ 
  className = '', 
  followCursor = true, 
  count = 100,
  colors = ["#1c680d", "#0ab607", "#0b6547"],
  ...props 
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || error) return;

    let renderer, scene, camera, mesh, clock, physics;
    let requestFrameId;

    try {
      // 1. Setup Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;

      const rect = containerRef.current.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);

      // 2. Setup Scene
      scene = new THREE.Scene();
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

      // 3. Setup Camera
      camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 1000);
      camera.position.z = 15;

      // 4. Setup Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      scene.add(ambientLight);

      const light = new THREE.PointLight(0xffffff, 50);
      light.position.set(0, 0, 10);
      scene.add(light);

      // 5. Setup Geometry & Material
      const geometry = new THREE.SphereGeometry(1);
      const material = new THREE.MeshPhysicalMaterial({
        metalness: 0.5,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transmission: 0.1,
        thickness: 0.5
      });

      // 6. Setup Instanced Mesh
      mesh = new THREE.InstancedMesh(geometry, material, count);
      const matrix = new THREE.Matrix4();
      const color = new THREE.Color();
      
      const themeColors = colors.map(c => new THREE.Color(c));

      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 15;
        const z = (Math.random() - 0.5) * 10;
        const scale = 0.3 + Math.random() * 0.7;
        
        matrix.makeTranslation(x, y, z);
        matrix.premultiply(new THREE.Matrix4().makeScale(scale, scale, scale));
        mesh.setMatrixAt(i, matrix);
        
        color.copy(themeColors[i % themeColors.length]);
        mesh.setColorAt(i, color);
      }
      scene.add(mesh);

      clock = new THREE.Clock();

      // 7. Animation Loop
      const animate = () => {
        requestFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        
        // Basic rotation/drift for now to ensure rendering
        mesh.rotation.x += delta * 0.05;
        mesh.rotation.y += delta * 0.1;
        
        renderer.render(scene, camera);
      };

      animate();

      // 8. Handle Resize
      const handleResize = () => {
        if (!containerRef.current) return;
        const r = containerRef.current.getBoundingClientRect();
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
        renderer.setSize(r.width, r.height);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(requestFrameId);
        window.removeEventListener('resize', handleResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        pmremGenerator.dispose();
      };

    } catch (err) {
      console.error("Ballpit Init Error:", err);
      setError(err);
    }
  }, [count, colors, error]);

  if (error) {
    return <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs text-center p-8">Interactive background disabled (WebGL Error)</div>;
  }

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} {...props}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};

export default Ballpit;
