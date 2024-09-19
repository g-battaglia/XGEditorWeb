<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { getSysexDumpRequestMessage, isValidMidiData } from "@/sysex/messages";
import { checkSysexAndReplaceCheckSum } from "@/sysex/parser";

const midiAccess = ref<WebMidi.MIDIAccess | null>(null);
const availableInputs = ref<WebMidi.MIDIInput[]>([]);
const midiInput = ref<WebMidi.MIDIInput | null>(null);
const midiOutput = ref<WebMidi.MIDIOutput | null>(null);

const inputXgMultiPart = ref<Number | null>(0);
const outputXgMultiPart = ref<Number | null>(0);

const dumpData = ref<Array<String>>([]);

const onMIDIFailure = (error: Error): void => {
  console.error("Failed to get MIDI access:", error);
};

onMounted(async () => {
  try {
    const access = await navigator.requestMIDIAccess({ sysex: true });
    midiAccess.value = access;
    midiOutput.value = access.outputs.values().next().value;
    midiInput.value = access.inputs.values().next().value;

    for (let input of midiAccess.value.inputs.values()) {
      input.onmidimessage = (message: WebMidi.MIDIMessageEvent): void => {
        const [status, data1, data2] = message.data;

        if (status === 248 || status === 254) {
          return;
        }

        console.log(`MIDI message received: status=${status}, data1=${data1}, data2=${data2}`);

        const dataArray = Array.from(message.data, (byte) => "0x" + byte.toString(16).toUpperCase().padStart(2, "0"));
        console.log("MIDI message received:", dataArray);

        if (isValidMidiData(dataArray)) {
          console.log("MIDI message is valid dump");
          dumpData.value = dataArray;
          console.log("Dump data:", dumpData.value);
        } else {
          console.log("MIDI message is not valid dump");
        }
      };
    }
  } catch (err) {
    console.error("Failed to get MIDI access", err);
  }
});

function setInputMultiPart(data: Number) {
  xgMultiPart.value = data;
}

function setOutputMultiPart(data: Number) {
  xgMultiPart.value = data;
}

function sendUmpRequest() {
  const message = getSysexDumpRequestMessage(Number(inputXgMultiPart.value));
  console.log("Sending SysEx message:", message);
  if (midiOutput) {
    midiOutput.value.send(message);
  }
}

function sendPartData() {
  console.log("Sending SysEx message:", Array.from(dumpData.value));
  if (midiOutput) {
    dumpData.value = checkSysexAndReplaceCheckSum(dumpData.value);
    midiOutput.value.send(Array.from(dumpData.value));
  }
}
</script>

<template>
  <main>
    <!-- List of XG Multi Parts, from 0 to 99 -->
    <select v-model="inputXgMultiPart">
      <option disabled selected value="0">Select Input XG Multi Part</option>
      <option v-for="part in 100" :key="part">{{ part }}</option>
    </select>

    <!-- List of XG Multi Parts, from 0 to 99 -->
    <select v-model="outputXgMultiPart">
      <option disabled selected value="0">Select Output XG Multi Part</option>
      <option v-for="part in 100" :key="part">{{ part }}</option>
    </select>

    <!-- Send Dump Request -->
    <button @click="sendUmpRequest">Send Dump Request</button>

    <!-- Dump Data -->
    <textarea v-model="dumpData" rows="10" cols="50" disabled></textarea>

    <!-- Send Part Data -->
    <button @click="sendPartData">Send Part Data</button>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
