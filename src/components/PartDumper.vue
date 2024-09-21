<script setup lang="ts">
import { ref, onMounted, watch, computed, toRef } from "vue";

import Button from "primevue/button";
import Knob from "primevue/knob";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";

import {
    getSysexDumpRequestMessage,
    isValidXGDump,
    getXGMultiPartNumber,
    changeXGMultiPartNumber,
} from "@/sysex/messages";
import { checkSysexAndReplaceCheckSum } from "@/sysex/parser";

import { useMidiStore } from "@/stores/midiStore";

/* MIDI Store */
const midiStore = useMidiStore();
const midiAccess = toRef(midiStore, "midiAccess");
const availableMidiInputs = toRef(midiStore, "availableMidiInputs");
const availableMidiOutputs = toRef(midiStore, "availableMidiOutputs");
const selectedMidiInput = toRef(midiStore, "selectedMidiInput");
const selectedMidiOutput = toRef(midiStore, "selectedMidiOutput");

/* Refs */
const inputXgMultiPart = ref<Number>(0);
const outputXgMultiPart = ref<Number>(0);
const dumpData = ref<Array<string>>([]);
const volume = ref(50);

function sendUmpRequest() {
    const message = getSysexDumpRequestMessage(Number(inputXgMultiPart.value));

    if (selectedMidiOutput) {
        selectedMidiOutput.value.port.send(message);
    }
}

function sendPartData() {
    console.log("Sending SysEx message:", Array.from(dumpData.value));
    if (selectedMidiOutput.value) {
        selectedMidiOutput.value.port.send(Array.from(checkSysexAndReplaceCheckSum(dumpData.value)));
    }
}

onMounted(async () => {
    try {
        midiAccess.value = await navigator.requestMIDIAccess({ sysex: true });

        for (let input of midiAccess.value.inputs.values()) {
            input.onmidimessage = (message: WebMidi.MIDIMessageEvent): void => {
                const [status, data1, data2] = message.data;

                if (status === 248 || status === 254) {
                    return;
                }

                console.log(`MIDI message received: status=${status}, data1=${data1}, data2=${data2}`);

                const dataArray = Array.from(
                    message.data,
                    (byte) => "0x" + byte.toString(16).toUpperCase().padStart(2, "0")
                );
                console.log("MIDI message received:", dataArray);

                if (isValidXGDump(dataArray)) {
                    console.log("MIDI message is valid dump");
                    dumpData.value = dataArray;
                    console.log("Dump data:", dumpData.value);
                }
            };
        }
    } catch (err) {
        console.error("Failed to get MIDI access", err);
    }
});

watch(outputXgMultiPart, (newValue, oldValue) => {
    if (!dumpData.value.length) {
        return;
    }
    console.log("Output XG Multi Part changed:", oldValue, newValue);
    dumpData.value = changeXGMultiPartNumber(dumpData.value, Number(newValue));
    console.log(dumpData.value);
});

const computedPartNumber = computed(() => {
    console.log("Computed Part Number:" + getXGMultiPartNumber(dumpData.value));
    return getXGMultiPartNumber(dumpData.value);
});
</script>

<template>
    <div class="container mx-auto">
        <h1>XG Multi Part Editor</h1>
        <main class="flex flex-col gap-4">
            <!-- List Midi Inputs and let the user chose -->
            <label>Select MIDI Input</label>
            <Select
                v-model="selectedMidiInput"
                :options="availableMidiInputs"
                placeholder="Select Input"
                optionLabel="name"
            />

            <!-- List Midi Outputs and let the user chose -->
            <label>Select MIDI Output</label>
            <Select
                v-model="selectedMidiOutput"
                :options="availableMidiOutputs"
                placeholder="Select Output"
                optionLabel="name"
            />

            <!-- List of XG Multi Parts, from 0 to 99 -->
            <label>Select Input XG Multi Part</label>
            <Select
                v-model="inputXgMultiPart"
                :options="Array.from({ length: 100 }, (_, i) => i)"
                placeholder="Select Part"
            />

            <!-- List of XG Multi Parts, from 0 to 99 -->
            <label>Select Output XG Multi Part</label>
            <Select
                v-model="outputXgMultiPart"
                :options="Array.from({ length: 100 }, (_, i) => i)"
                placeholder="Select Part"
            />

            <!-- Send Dump Request -->
            <Button @click="sendUmpRequest">Send Dump Request</Button>

            <!-- Dump Data -->
            <label>Dump Data</label>
            <textarea rows="10" cols="50" disabled>
                {{ dumpData }}
            </textarea>
            <p v-if="dumpData.length">Part Number: {{ computedPartNumber }}</p>

            <!-- Send Part Data -->
            <Button @click="sendPartData">Send Part Data</Button>

            <div class="input-wrapper">
                <label>Volume</label>
                <Knob v-model="volume" :min="0" :max="120" :step="1" :size="100" :showValue="false" />
                <InputNumber v-model="volume" min="0" max="120" show-buttons="true" />
            </div>
        </main>
    </div>
</template>

<style>
.input-wrapper {
    width: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;


    input.p-inputnumber-input {
        max-width: 80px;
    }
}
</style>
