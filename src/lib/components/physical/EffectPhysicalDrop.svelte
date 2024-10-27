<script lang="ts">
  import { Folder, Slider } from "svelte-tweakpane-ui";
  import { time, stage, model, height, position } from "../shared.js";
  import { tweenFunctions } from "$lib/util/tween-functions.js";
  import type { Box3, Group } from "three";

  const min = 0;
  const max = 500;
  const step = 1;

  // treat the drop height as a percentage of building height
  let dropHeight = 0;
  $: onModelChange($model, $height);
  const onModelChange = (
    model: { merged: Group; box: Box3 },
    height: number
  ) => {
    if (model && model.box) {
      dropHeight = model.box.max.y * (height / 100.0);
    }
  };

  const seek = () => {
    const stage = $stage;
    switch (stage.name) {
      case "before":
        $position[1] = dropHeight;
        break;
      case "intro":
        $position[1] = tweenFunctions.easeOutBounce(
          stage.time,
          dropHeight,
          0,
          stage.length
        );
        break;
      case "middle":
      case "outro":
      case "after":
        $position[1] = 0;
        break;
    }
  };

  time.subscribe(() => {
    seek();
  });
</script>

<Folder title="Physical">
  <Slider bind:value={$height} {min} {max} {step} label="Drop" />
</Folder>
