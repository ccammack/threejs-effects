<script lang="ts">
  import { T, useThrelte } from "@threlte/core";
  import { model, type, stage, position, effect } from "./shared.js";
  import { createVisualPaper } from "$lib/effects/visualPaper.js";

  const { renderer } = useThrelte();

  let root: any = null;

  // change effect type
  $type = "paper";
  $: onEffectChange($type, $model);
  const onEffectChange = async (type: any, model: any) => {
    if (type && model) {
      // TODO: switch on per-effect type
      $effect = await createVisualPaper(renderer, model.merged);
      root = $effect.root();
    }
  };

  // update effect tunables
  $: onEffectUpdate($effect, $stage);
  const onEffectUpdate = (effect: any, stage: any) => {
    effect?.seek(stage);
  };
</script>

{#if root}
  <T.Group position={$position}>
    <T is={root} />
  </T.Group>
{/if}
