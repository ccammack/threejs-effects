<script lang="ts">
  import RangeSlider from "svelte-range-slider-pips";
  import { start, time, length, animFrame } from "./shared.js";
</script>

<div>
  <RangeSlider
    min={$start}
    values={[$time]}
    max={$start + $length - 1}
    on:change={(e) => {
      cancelAnimationFrame($animFrame);
      $time = e.detail.values[0];
    }}
  />
</div>

<style>
  div {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 999;
  }
</style>
