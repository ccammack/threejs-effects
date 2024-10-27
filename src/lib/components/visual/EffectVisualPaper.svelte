<script lang="ts">
  import { Color, Folder, Slider } from "svelte-tweakpane-ui";
  import { effect } from "../shared.js";
</script>

{#if $effect}
  <Folder title="Visual">
    <Color
      bind:value={$effect.settings.linecolor}
      label="Line color"
      picker="inline"
      expanded={false}
    />
    <Slider
      bind:value={$effect.settings.linethickness}
      min={0}
      max={10}
      step={0.1}
      label="Line thickness"
    />
    <Color
      bind:value={$effect.settings.bodycolor}
      label="Body color"
      picker="inline"
      expanded={false}
    />
    <Slider
      bind:value={$effect.settings.opacity}
      min={0}
      max={1}
      step={0.01}
      label="Opacity"
    />
  </Folder>
{/if}
