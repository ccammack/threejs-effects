// @ts-nocheck
import { derived, readable, writable } from 'svelte/store';

export let file = writable()
export let model = writable()
export let type = writable()
export let effect = writable()

export const start = readable(0);
export let time = writable(1100);

export let stages = writable({
    before: 100,
    intro: 1000,
    middle: 2000,
    outro: 1000,
    after: 100,
})

export let length = derived(stages, (stages) => {
    return stages.before + stages.intro + stages.middle + stages.outro + stages.after
});

export let stage = derived([time, start, stages], ([time, start, stages]) => {
    time -= start;
    const total = stages.before + stages.intro + stages.middle + stages.outro + stages.after
    time = Math.min(Math.max(0.0, time), total - 1);
    const names = ["before", "intro", "middle", "outro", "after"];
    for (const name of names) {
        const length = stages[name];
        if (time < length) return { name, time, length };
        time -= length;
    }
    throw new Error("Failed to find stage");
});

export let target = writable()
export let animFrame = writable();

export let position = writable([0, 0, 0]);
export let height = writable(50);
