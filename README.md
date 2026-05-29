# WebGL Shading & Blinn-Phong Model

Implementazione di un sistema di rendering mesh 3D basato su WebGL con supporto per l'illuminazione dinamica.

## Caratteristiche
- **Mesh Rendering:** Supporto per il caricamento di file OBJ e rendering via GPU.
- **Illuminazione:** Implementazione del modello di riflessione di Blinn-Phong per calcolare componenti diffuse e speculari.
- **Normal Mapping & Matrici:** Gestione corretta delle normali attraverso le matrici di trasformazione (Model-View e Normal Matrix) per garantire luci coerenti nello spazio camera.
- **Texture Mapping:** Supporto per il texturing delle superfici con mix dinamico tra texture e coefficienti di riflessione.

## Note Tecniche
- Il progetto utilizza **GLSL** per la logica dello shading nel fragment shader (`meshFS`).
- La logica di calcolo delle normali e delle matrici è gestita nella classe `MeshDrawer`.
- Il sistema supporta una directional light bianca (1,1,1) e parametri di shininess regolabili dall'interfaccia.
