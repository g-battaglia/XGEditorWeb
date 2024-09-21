import { ref, watch } from "vue";
import { defineStore } from "pinia";

export const useMidiStore = defineStore(
    "midiStore",
    () => {
        const midiAccess = ref<any>();
        const availableMidiInputs = ref<Array<any>>([]);
        const availableMidiOutputs = ref<Array<any>>([]);
        const selectedMidiInput = ref<any>();
        const selectedMidiOutput = ref<any>(null);

        watch(midiAccess, (newValue) => {
            if (!newValue) {
                return;
            }

            const inputs = Array.from(newValue.inputs.values()).map((input: any) => ({
                name: input.name,
                port: input,
            }));

            const outputs = Array.from(newValue.outputs.values()).map((output: any) => ({
                name: output.name,
                port: output,
            }));

            availableMidiInputs.value = inputs;
            availableMidiOutputs.value = outputs;
        });

        return { midiAccess, availableMidiOutputs, availableMidiInputs, selectedMidiInput, selectedMidiOutput };
    },
    { persist: true }
);
