import * as THREE from 'three';

export const loadSceneContent = (arSystem) => {
  // 1. On récupère une ancre depuis notre système AR
  const anchor = arSystem.addAnchor(0);

  // 2. On crée les objets 3D
  const geometry = new THREE.PlaneGeometry(1, 0.55);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff, 
    transparent: true, 
    opacity: 0.5 
  });
  const plane = new THREE.Mesh(geometry, material);

  // 3. On ajoute l'objet à l'ancre
  anchor.group.add(plane);
  
  // (Optionnel) Retourner les objets si on veut les animer plus tard
  return { plane };
};