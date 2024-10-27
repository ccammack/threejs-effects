<script lang="ts">
  import { T, useThrelte, useTask } from "@threlte/core";
  import { OrbitControls, Grid } from "@threlte/extras";
  import Effect from "./Effect.svelte";
  import { type Box3, type Group } from "three";
  import { model } from "./shared";
  import Stats from "three/addons/libs/stats.module.js";

  const { renderer } = useThrelte();

  let position = [0, 0, 0];
  let target = [0, 0, 0];

  // adjust camera for building size
  const onModelChange = (model: { merged: Group; box: Box3 }) => {
    if (model && model.box) {
      const h = model.box.max.y - model.box.min.y;
      const w = Math.max(
        model.box.max.x - model.box.min.x,
        model.box.max.z - model.box.min.z
      );

      const d = Math.max(h, w);
      const r = Math.sqrt(d * d + d * d);

      position = [r, h / 2, r];
      target = [0, h / 2, 0];
    }
  };
  $: onModelChange($model);

  // display stats
  const stats = new Stats();
  renderer.domElement.parentNode?.appendChild(stats.dom);
  stats.begin();
  useTask(() => {
    stats.update();
  });
</script>

<T.Color args={[0xeeeeee]} attach="background" />

<T.PerspectiveCamera makeDefault fov={50} {position}>
  <OrbitControls enableDamping {target} />
</T.PerspectiveCamera>

<!-- <Grid gridSize={200} cellSize={10} sectionThickness={1} fadeDistance={1000}></Grid> -->

<Effect />
