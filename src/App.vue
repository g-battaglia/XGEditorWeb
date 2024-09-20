<script setup lang="ts">
import Button from "primevue/button";
import { ref, onMounted, watch, computed, reactive } from "vue";
import Knob from "primevue/knob";
import InputText from "primevue/inputtext";
import Select from "primevue/select";

import {
    getSysexDumpRequestMessage,
    isValidXGDump,
    getXGMultiPartNumber,
    changeXGMultiPartNumber,
} from "@/sysex/messages";
import { checkSysexAndReplaceCheckSum } from "@/sysex/parser";

const midiAccess = ref<any>();
const availableMidiInputs = ref<Array<any>>([]);
const availableMidiOutputs = ref<Array<any>>([]);
const selectedMidiInput = ref<any>();
const selectedMidiOutput = ref<any>(null);

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
        const access = await navigator.requestMIDIAccess({ sysex: true });
        midiAccess.value = access;

        console.log(midiAccess.value);

        for (let input of midiAccess.value.inputs.values()) {
            input.onmidimessage = (message: WebMidi.MIDIMessageEvent): void => {
                const [status, data1, data2] = message.data;

                if (status === 248 || status === 254) {
                    return;
                }

                console.log(`MIDI message received: status=${status}, data1=${data1}, data2=${data2}`);

                const dataArray = Array.from(
                    message.data,
                    (byte) => "0x" + byte.toString(16).toUpperCase().padStart(2, "0"),
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
</script>

<template>
    <div class="container">
        <h1>XG Multi Part Editor</h1>
        <main>
            <!-- List Midi Inputs and let the user chose -->
            <label>Select MIDI Input</label>
            <Select v-model="selectedMidiInput" :options="availableMidiInputs" placeholder="Select Input"
                optionLabel="name" />

            <!-- List Midi Outputs and let the user chose -->
            <label>Select MIDI Output</label>
            <Select v-model="selectedMidiOutput" :options="availableMidiOutputs" placeholder="Select Output"
                optionLabel="name" />

            <!-- List of XG Multi Parts, from 0 to 99 -->
            <label>Select Input XG Multi Part</label>
            <Select v-model="inputXgMultiPart" :options="Array.from({ length: 100 }, (_, i) => i)"
                placeholder="Select Part" />

            <!-- List of XG Multi Parts, from 0 to 99 -->
            <label>Select Output XG Multi Part</label>
            <Select v-model="outputXgMultiPart" :options="Array.from({ length: 100 }, (_, i) => i)"
                placeholder="Select Part" />

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

            <label>Volume</label>
            <Knob v-model="volume" :min="0" :max="127" :step="1" :size="100" :showValue="true" />
            <input type="number" v-model="volume" min="0" max="127" />
            <InputText v-model="volume" />
        </main>
    </div>
</template>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
