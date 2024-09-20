<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import Button from 'primevue/button';
import Knob from 'primevue/knob';



import {
    getSysexDumpRequestMessage,
    isValidXGDump,
    getXGMultiPartNumber,
    changeXGMultiPartNumber,
} from "@/sysex/messages";
import { checkSysexAndReplaceCheckSum } from "@/sysex/parser";

const midiAccess = ref<any>(null);
const midiInput = ref<any>(null);
const midiOutput = ref<any>(null);

const inputXgMultiPart = ref<Number | null>(0);
const outputXgMultiPart = ref<Number | null>(0);

const dumpData = ref<Array<string>>([]);

const volume = ref(50);

function sendUmpRequest() {
    const message = getSysexDumpRequestMessage(Number(inputXgMultiPart.value));
    console.log("Sending SysEx message:", message);
    if (midiOutput) {
        midiOutput.value.send(message);
    }
}

function sendPartData() {
    console.log("Sending SysEx message:", Array.from(dumpData.value));
    if (midiOutput.value) {
        midiOutput.value.send(Array.from(checkSysexAndReplaceCheckSum(dumpData.value)));
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
    <main>
        <!-- List Midi Inputs and let the user chose -->
        <label>Select MIDI Input</label>
        <select v-model="midiInput" v-if="midiAccess">
            <option v-for="input of midiAccess.inputs.values()" :key="input.id" :value="input">{{ input.name }}</option>
        </select>

        <!-- List Midi Outputs and let the user chose -->
        <label>Select MIDI Output</label>
        <select v-model="midiOutput" v-if="midiAccess">
            <option v-for="output of midiAccess.outputs.values()" :key="output.id" :value="output">
                {{ output.name }}
            </option>
        </select>

        <!-- List of XG Multi Parts, from 0 to 99 -->
        <label>Select Input XG Multi Part</label>
        <select v-model="inputXgMultiPart">
            <option disabled selected value="0">0</option>
            <option v-for="part in 100" :key="part">{{ part }}</option>
        </select>

        <!-- List of XG Multi Parts, from 0 to 99 -->
        <label>Select Output XG Multi Part</label>
        <select v-model="outputXgMultiPart">
            <option disabled selected value="0">0</option>
            <option v-for="part in 100" :key="part">{{ part }}</option>
        </select>

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
        <Knob v-model="volume" :min="0" :max="127" :step="0" :size="100" :showValue="true" />
    </main>
</template>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
