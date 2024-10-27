<script lang="ts">
  import { Pane, Folder, Button } from "svelte-tweakpane-ui";
  import EffectVisual from "./visual/EffectVisual.svelte";
  import EffectPhysical from "./physical/EffectPhysical.svelte";
  import EffectTiming from "./timing/EffectTiming.svelte";
  import { time, stages, length, target, animFrame } from "./shared";

  // handle mousedown on the replay buttons
  $: onMousedown($target);
  const onMousedown = (target: Button | null) => {
    if (target) {
      if (
        // TODO: find a better way to do this
        target.innerHTML == "Replay Intro" ||
        target.innerHTML == "Replay Complete"
      ) {
        // cancel existing replays and reset time
        cancelAnimationFrame($animFrame);
        $time = 0;
      }
    }
  };

  // replay the effect
  const replay = (length: number) => {
    const now: number = performance.now();
    const end: number = now + length;
    $animFrame = requestAnimationFrame(function loop(timestamp: number) {
      if (timestamp < end) {
        $time = timestamp - now;
        $animFrame = requestAnimationFrame(loop);
      }
    });
  };
</script>

<Pane title="Settings">
  <EffectVisual />
  <EffectPhysical />
  <EffectTiming />
  <Folder title="Replay">
    <Button
      title="Replay Intro"
      on:click={() => {
        replay($stages.before + $stages.intro);
      }}
    />
    <Button
      title="Replay Complete"
      on:click={() => {
        replay($length);
      }}
    />
  </Folder>
</Pane>
