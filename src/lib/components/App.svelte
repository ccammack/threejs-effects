<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import Timeline from "./Timeline.svelte";
  import EffectPane from "./EffectPane.svelte";
  import { file, model, effect, target } from "./shared";
  import LoadModel from "$lib/util/model";
  import { Circle } from "svelte-loading-spinners";

  // handle model filename changes
  // $file = "Eiffel_Tower.glb";
  $file = "building_04.glb";
  $: onFileChange($file);
  const onFileChange = async (file: string) => {
    try {
      $model = await LoadModel(file);
    } catch (error) {
      console.error("Error loading model:", error);
    }
  };

  // store the $target element on mousedown
  let over: EventTarget | null;
  const onmousemove = (e: Event) => {
    over = e.target;
    $target = null;
  };
  const onmousedown = () => {
    $target = over;
  };
</script>

<svelte:body on:mousemove={onmousemove} on:mousedown={onmousedown} />

<div>
  <Canvas>
    <Scene />
  </Canvas>
  {#if $effect}
    <Timeline />
    <EffectPane />
  {:else}
  <div class="spinner-container">
    <div class="spinner-content">
      <Circle size="60" color="#FF3E00" unit="px" duration="1s" />
    </div>
  </div>
  {/if}
</div>

<style>
  div {
    height: 100%;
    width: auto;
  }
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .spinner-content {
    text-align: center;
  }
</style>
