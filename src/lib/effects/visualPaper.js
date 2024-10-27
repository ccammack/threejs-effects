// @ts-nocheck
import { tweenFunctions } from "../util/tween-functions"

export function createVisualPaper(renderer, model) {
    return new Promise((res, rej) => {
        const settings = {
            linecolor: "#000000",
            linethickness: 1.0,
            bodycolor: "#ffffff",
            opacity: 0.95,
        };

        const state = {
            linecolor: settings.linecolor,
            linethickness: settings.linethickness,
            bodycolor: settings.bodycolor,
            opacity: settings.opacity,
        };
        // create the effect
        const effect = createPaper(renderer, model, state)

        const common = () => {
            // copy non-interpolating render state
            state.bodycolor = settings.bodycolor;
            state.linecolor = settings.linecolor;

            // update shaders using current state values
            effect?.seek();
        };

        const seek = (stage) => {
            switch (stage.name) {
                case "before":
                    state.linethickness = 0;
                    state.opacity = 0;
                    common();
                    break;
                case "intro":
                    state.linethickness = tweenFunctions.easeOutExpo(
                        stage.time,
                        0,
                        settings.linethickness,
                        stage.length,
                    );
                    state.opacity = tweenFunctions.easeOutExpo(
                        stage.time,
                        0,
                        settings.opacity,
                        stage.length,
                    );
                    common();
                    break;
                case "middle":
                    state.linethickness = settings.linethickness;
                    state.opacity = settings.opacity;
                    common();
                    break;
                case "outro":
                    state.linethickness = tweenFunctions.easeInExpo(
                        stage.time,
                        settings.linethickness,
                        0,
                        stage.length,
                    );
                    state.opacity = tweenFunctions.easeInExpo(
                        stage.time,
                        settings.opacity,
                        0,
                        stage.length,
                    );
                    common();
                    break;
                case "after":
                    state.linethickness = 0;
                    state.opacity = 0;
                    common();
                    break;
            }
        };

        // return public interface
        res({
            settings,
            root: () => {
                return effect.group()
            },
            seek: (stage) => {
                seek(stage)
            },
            destroy: () => {
                return;
                disposeThreeSubtree(effect.group());
                effect = null;
            },
        })
    })
}

/////////////////////////////////////////////////////////////////

import * as THREE from "three"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js"
import { LineSegments2 } from "three/addons/lines/LineSegments2.js"
import { LineMaterial } from "three/addons/lines/LineMaterial.js"
import { OutsideEdgesGeometry } from './conditional_lines/src/OutsideEdgesGeometry.js';
import { ConditionalEdgesGeometry } from './conditional_lines/src/ConditionalEdgesGeometry.js';
import { ConditionalEdgesShader } from './conditional_lines/src/ConditionalEdgesShader.js';
import { ConditionalLineSegmentsGeometry } from './conditional_lines/src/Lines2/ConditionalLineSegmentsGeometry.js';
import { ConditionalLineMaterial } from './conditional_lines/src/Lines2/ConditionalLineMaterial.js';
import { ColoredShadowMaterial } from './conditional_lines/src/ColoredShadowMaterial.js';

export function createPaper(renderer, originalModel, params) {

    // https://discourse.threejs.org/t/ldraw-like-edges/17100
    // https://codesandbox.io/s/serene-margulis-iuiob3?file=/src/js/FatLinesBatch.js
    // https://gkjohnson.github.io/threejs-sandbox/conditional-lines/
    // https://github.com/gkjohnson/threejs-sandbox/tree/master/conditional-lines
    // https://github.com/mrdoob/three.js/issues/19096

    const that = {}
    const group = new THREE.Group();
    params.useThickLines = true;

    let edgesModel, backgroundModel, conditionalModel, shadowModel, depthModel;

    const LIGHT_SHADOW = 0xc4c9cb;

    init();
    animate();

    function updateModel() {
        initEdgesModel();
        initBackgroundModel();
        initConditionalModel();
    }

    function initBackgroundModel() {
        if (backgroundModel) {
            backgroundModel.parent.remove(backgroundModel);
            shadowModel.parent.remove(shadowModel);
            depthModel.parent.remove(depthModel);

            backgroundModel.traverse(c => {
                if (c.isMesh) {
                    c.material.dispose();
                }
            });

            shadowModel.traverse(c => {
                if (c.isMesh) {
                    c.material.dispose();
                }
            });

            depthModel.traverse(c => {
                if (c.isMesh) {
                    c.material.dispose();
                }
            });

        }

        if (!originalModel) {
            return;
        }

        backgroundModel = originalModel.clone();
        backgroundModel.traverse(c => {
            if (c.isMesh) {
                c.material = new THREE.MeshBasicMaterial({ color: params.bodycolor });
                c.material.polygonOffset = true;
                c.material.polygonOffsetFactor = 1;
                c.material.polygonOffsetUnits = 1;
                c.renderOrder = 2;
            }
        });
        group.add(backgroundModel);

        shadowModel = originalModel.clone();
        shadowModel.traverse(c => {
            if (c.isMesh) {
                c.material = new ColoredShadowMaterial({ color: params.bodycolor, shininess: 1.0 });
                c.material.polygonOffset = true;
                c.material.polygonOffsetFactor = 1;
                c.material.polygonOffsetUnits = 1;
                c.receiveShadow = true;
                c.renderOrder = 2;
            }
        });
        group.add(shadowModel);

        depthModel = originalModel.clone();
        depthModel.traverse(c => {
            if (c.isMesh) {
                c.material = new THREE.MeshBasicMaterial({ color: params.bodycolor });
                c.material.polygonOffset = true;
                c.material.polygonOffsetFactor = 1;
                c.material.polygonOffsetUnits = 1;
                c.material.colorWrite = false;
                c.renderOrder = 1;
            }
        });
        group.add(depthModel);

    }

    function initEdgesModel() {
        // remove any previous model
        if (edgesModel) {
            edgesModel.parent.remove(edgesModel);
            edgesModel.traverse(c => {
                if (c.isMesh) {
                    if (Array.isArray(c.material)) {
                        c.material.forEach(m => m.dispose());
                    } else {
                        c.material.dispose();
                    }
                }
            });
        }

        // early out if there's no model loaded
        if (!originalModel) {
            return;
        }

        // store the model and add it to the group to display behind the lines
        edgesModel = originalModel.clone();
        group.add(edgesModel);

        const meshes = [];
        edgesModel.traverse(c => {
            if (c.isMesh) {
                meshes.push(c);
            }
        });

        for (const key in meshes) {
            const mesh = meshes[key];
            const parent = mesh.parent;

            let lineGeom;
            const mergeGeom = mesh.geometry.clone();
            mergeGeom.deleteAttribute('uv');
            mergeGeom.deleteAttribute('uv2');
            lineGeom = new OutsideEdgesGeometry(BufferGeometryUtils.mergeVertices(mergeGeom, 1e-3));

            const line = new THREE.LineSegments(lineGeom, new THREE.LineBasicMaterial({ color: params.linecolor }));
            line.position.copy(mesh.position);
            line.scale.copy(mesh.scale);
            line.rotation.copy(mesh.rotation);

            const thickLineGeom = new LineSegmentsGeometry().fromEdgesGeometry(lineGeom);
            const thickLines = new LineSegments2(thickLineGeom, new LineMaterial({ color: params.linecolor, linewidth: 3 }));
            thickLines.position.copy(mesh.position);
            thickLines.scale.copy(mesh.scale);
            thickLines.rotation.copy(mesh.rotation);

            parent.remove(mesh);
            parent.add(line);
            parent.add(thickLines);
        }
    }

    function initConditionalModel() {
        // remove the original model
        if (conditionalModel) {
            conditionalModel.parent.remove(conditionalModel);
            conditionalModel.traverse(c => {
                if (c.isMesh) {
                    c.material.dispose();
                }
            });
        }

        // if we have no loaded model then exit
        if (!originalModel) {
            return;
        }

        conditionalModel = originalModel.clone();
        group.add(conditionalModel);
        conditionalModel.visible = false;

        // get all meshes
        const meshes = [];
        conditionalModel.traverse(c => {
            if (c.isMesh) {
                meshes.push(c);
            }
        });

        for (const key in meshes) {
            const mesh = meshes[key];
            const parent = mesh.parent;

            // Remove everything but the position attribute
            const mergedGeom = mesh.geometry.clone();
            for (const key in mergedGeom.attributes) {
                if (key !== 'position') {
                    mergedGeom.deleteAttribute(key);
                }
            }

            // Create the conditional edges geometry and associated material
            const lineGeom = new ConditionalEdgesGeometry(BufferGeometryUtils.mergeVertices(mergedGeom));
            const material = new THREE.ShaderMaterial(ConditionalEdgesShader);
            material.uniforms.diffuse.value.set(params.linecolor);

            // Create the line segments objects and replace the mesh
            const line = new THREE.LineSegments(lineGeom, material);
            line.position.copy(mesh.position);
            line.scale.copy(mesh.scale);
            line.rotation.copy(mesh.rotation);

            const thickLineGeom = new ConditionalLineSegmentsGeometry().fromConditionalEdgesGeometry(lineGeom);
            const thickLines = new LineSegments2(thickLineGeom, new ConditionalLineMaterial({ color: params.linecolor, linewidth: 2 }));
            thickLines.position.copy(mesh.position);
            thickLines.scale.copy(mesh.scale);
            thickLines.rotation.copy(mesh.rotation);

            parent.remove(mesh);
            parent.add(line);
            parent.add(thickLines);
        }
    }

    function init() {
        updateModel();
    }

    function animate() {
        let linesColor = params.linecolor;
        let modelColor = params.bodycolor;
        let shadowColor = LIGHT_SHADOW;

        if (conditionalModel) {
            conditionalModel.visible = true
            conditionalModel.traverse(c => {
                if (c.material && c.material.resolution) {
                    renderer.getSize(c.material.resolution);
                    c.material.resolution.multiplyScalar(window.devicePixelRatio);
                    c.material.linewidth = params.linethickness;
                }

                if (c.material) {
                    c.visible = c instanceof LineSegments2 ? params.useThickLines : !params.useThickLines;
                    c.material.uniforms.diffuse.value.set(linesColor);
                }
            });
        }

        if (edgesModel) {
            edgesModel.traverse(c => {
                if (c.material && c.material.resolution) {
                    renderer.getSize(c.material.resolution);
                    c.material.resolution.multiplyScalar(window.devicePixelRatio);
                    c.material.linewidth = params.linethickness;
                }

                if (c.material) {
                    c.visible = c instanceof LineSegments2 ? params.useThickLines : !params.useThickLines;
                    c.material.color.set(linesColor);
                }
            });
        }

        if (backgroundModel) {
            backgroundModel.visible = true
            backgroundModel.traverse(c => {
                if (c.isMesh) {
                    c.material.transparent = params.opacity !== 1.0;
                    c.material.opacity = params.opacity;
                    c.material.color.set(modelColor);
                }
            });
        }

        if (shadowModel) {
            shadowModel.visible = false
            shadowModel.traverse(c => {
                if (c.isMesh) {
                    c.material.transparent = params.opacity !== 1.0;
                    c.material.opacity = params.opacity;
                    c.material.color.set(modelColor);
                    c.material.shadowColor.set(shadowColor);
                }
            });
        }
    }

    // public interface
    that.group = () => { return group; }
    that.seek = () => { animate(); }
    return that;
}
