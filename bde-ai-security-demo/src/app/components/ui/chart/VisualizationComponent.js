/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { convertDataToPoints } from "./utils";

function PointsVisualization({ points }) {
  const meshRef = useRef();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.1 * delta;
      meshRef.current.rotation.x += 0.1 * delta;
      meshRef.current.rotation.z += 0.1 * delta;
    }
  });

  useEffect(() => {
    if (!points || points.length === 0) return;

    const handleMouseMove = (event) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, state.camera);
      const intersects = raycaster.intersectObjects(
        meshRef.current.children,
        false
      );

      if (intersects.length > 0) {
        const closestPoint = intersects[0].object;
        const pointIndex = closestPoint.userData.index;
        setHoveredPoint(points[pointIndex]);
        const worldPosition = closestPoint.getWorldPosition(
          new THREE.Vector3()
        );
        const screenPosition = worldPosition.clone().project(state.camera);
        setTooltipPosition({
          x: ((screenPosition.x + 1) / 2) * window.innerWidth,
          y: (-(screenPosition.y - 1) / 2) * window.innerHeight,
        });
      } else {
        setHoveredPoint(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [points]);

  if (!points || points.length === 0) return null;

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  points.forEach((point) => {
    positions.push(point.position.x, point.position.y, point.position.z);
    const color = new THREE.Color(point.color);
    colors.push(color.r, color.g, color.b);
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
  });

  return (
    <>
      <points ref={meshRef} geometry={geometry} material={material}>
        {points.map((point, index) => (
          <mesh key={index} position={point.position} userData={{ index }}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={point.color} />
          </mesh>
        ))}
      </points>
      {hoveredPoint && (
        <div
          style={{
            position: "absolute",
            left: tooltipPosition.x + "px",
            top: tooltipPosition.y + "px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px",
            borderRadius: "5px",
            zIndex: 10,
          }}
        >
          <p>IP: {hoveredPoint.metadata.ip}</p>
          <p>Status: {hoveredPoint.metadata.status}</p>
        </div>
      )}
    </>
  );
}

function VisualizationComponent({ jsonData }) {
  const [points, setPoints] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [prevMouse, setPrevMouse] = useState({ x: 0, y: 0 });
  const sceneRef = useRef();

  useEffect(() => {
    if (!jsonData) {
      console.warn("VisualizationComponent: jsonData is null or undefined");
      setPoints([]);
      return;
    }

    try {
      // 如果 jsonData 是陣列，包裝成 { requests: jsonData }
      const dataToConvert = Array.isArray(jsonData)
        ? { requests: jsonData }
        : jsonData;
      const convertedPoints = convertDataToPoints(dataToConvert);
      setPoints(convertedPoints);
    } catch (error) {
      console.error("Error in convertDataToPoints:", error);
      setPoints([]);
    }
  }, [jsonData]);

  const onMouseDown = (event) => {
    setIsDragging(true);
    setPrevMouse({ x: event.clientX, y: event.clientY });
  };

  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - prevMouse.x;
    const deltaY = event.clientY - prevMouse.y;
    setRotation((prevRotation) => [
      prevRotation[0] + deltaY * 0.01,
      prevRotation[1] + deltaX * 0.01,
      prevRotation[2],
    ]);
    setPrevMouse({ x: event.clientX, y: event.clientY });
  };

  return (
    <Canvas
      style={{ width: "100%", height: "500px" }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      camera={{ position: [0, 0, 10] }}
      ref={sceneRef}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <PointsVisualization points={points} />
      <mesh rotation={rotation} ref={sceneRef}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial wireframe color="gray" />
      </mesh>
    </Canvas>
  );
}

export default VisualizationComponent;
