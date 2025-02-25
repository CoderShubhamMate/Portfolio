Place 3D models here:

1. door.glb - The main entrance door model
   - Should include animations for opening
   - Futuristic design with glowing elements
   - Optional: Include carved/integrated "Press ENTER" text
   - Recommended polycount: < 20k triangles
   - Include UV maps for glowing effects

2. interior_room.glb - The portfolio room model (optional)
   - Modern, high-tech interior design
   - Include mounting points for interactive elements
   - Optional: Include built-in animations for elements
   - Recommended polycount: < 50k triangles
   - Include UV maps for grid textures and glowing elements

Technical Requirements:
- Format: .glb (binary GLTF)
- Textures: Include PBR materials where appropriate
- Scale: Models should be properly scaled to scene units
- Origin: Place pivot points at logical positions for animations
- Optimize: Use draco compression when exporting
- UV Maps: All meshes should have proper UV mapping

Note: The room can also be generated programmatically as currently implemented in InteriorScene.js.
The door model is essential for the entrance experience.
