<script lang="ts">
  import { Folder, Slider } from "svelte-tweakpane-ui";
  import { stages } from "../shared.js";

  // tunable lengths
  const min = 100;
  const max = 5000;
  const step = 100;
</script>

<Folder title="Timing">
  <Slider bind:value={$stages.before} {min} {max} {step} label="Before" />
  <Slider bind:value={$stages.intro} {min} {max} {step} label="Intro" />
  <Slider bind:value={$stages.middle} {min} {max} {step} label="Middle" />
  <Slider bind:value={$stages.outro} {min} {max} {step} label="Outro" />
  <Slider bind:value={$stages.after} {min} {max} {step} label="After" />
</Folder>
