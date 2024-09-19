import { intToHex } from "../utils";

/** XG Multi Part Dump Request Sysex Message. */
const MULTI_PART_DUMP_REQUEST_SYSEX = "0xF0 0x43 0x20 0x4C 0x08 0x%% 0x00 0xF7";

/**
 * Generates a Multi Part Dump Request Sysex Message.
 * @param partNumber The part number to request.
 * @returns The generated sysex message.
 */
function getSysexDumpRequestMessage(partNumber: number): string[] {
  const stringMsg = MULTI_PART_DUMP_REQUEST_SYSEX.replace(
    "%%",
    intToHex(partNumber)
  );
  return stringMsg.split(" ");
}

/**
 * Checks if an array of strings is valid MIDI data.
 * @param data An array of strings to check.
 * @returns A boolean indicating if the input is valid MIDI data.
 */
function isValidMidiData(data: string[]): boolean {
  if (data.length !== 52) {
    return false;
  }

  // Regular expression to match the MIDI data pattern
  const midiDataPattern = /^0xF0(?: 0x[0-9A-F]{2})+ 0xF7$/i;
  const dataString = data.join(" ");
  return midiDataPattern.test(dataString);
}

export { getSysexDumpRequestMessage, isValidMidiData };
