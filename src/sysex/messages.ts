import { intToHex } from "../utils";
import { checkSysexAndReplaceCheckSum } from "@/sysex/parser";

/** XG Multi Part Dump Request Sysex Message. */
const MULTI_PART_DUMP_REQUEST_SYSEX = "0xF0 0x43 0x20 0x4C 0x08 0x%% 0x00 0xF7";

/**
 * Generates a Multi Part Dump Request Sysex Message.
 * @param partNumber The part number to request.
 * @returns The generated sysex message.
 */
function getSysexDumpRequestMessage(partNumber: number): string[] {
    const stringMsg = MULTI_PART_DUMP_REQUEST_SYSEX.replace("%%", intToHex(partNumber));
    return stringMsg.split(" ");
}

/**
 * Checks if an array of strings is valid MIDI data.
 *
 * @param data An array of strings to check.
 * @returns A boolean indicating if the input is valid MIDI data.
 */
function isValidXGDump(data: string[]): boolean {
    // The lenght is always 52
    if (data.length !== 52) {
        console.error("Invalid length");
        return false;
    }

    // The 7th and the 13th byte have always the same value
    if (data[7] !== data[13]) {
        console.error("Invalid part number.")
        return false;
    }

    // Regular expression to match the MIDI data pattern
    const midiDataPattern = /^0xF0(?: 0x[0-9A-F]{2})+ 0xF7$/i;

    const dataString = data.join(" ");
    return midiDataPattern.test(dataString);
}

/**
 * Gets the XG Multi Part Number from a valid XG Multi Part Dump Sysex Message.
 *
 * @param data An array of strings representing a valid XG Multi Part Dump Sysex Message.
 * @returns The XG Multi Part Number.
 */
function getXGMultiPartNumber(data: string[]): number {
    if (!isValidXGDump(data)) {
        throw new Error("Invalid XG Multi Part Dump Sysex Message.");
    }

    return parseInt(data[7], 16);
}

/**
 * Changes the XG Multi Part Number in a valid XG Multi Part Dump Sysex Message.
 *
 * @param data An array of strings representing a valid XG Multi Part Dump Sysex Message.
 * @param newPartNumber The new part number to set.
 * @returns The modified XG Multi Part Dump Sysex Message.
 */
function changeXGMultiPartNumber(data: string[], newPartNumber: number): string[] {
    const newData = [...data];
    if (!isValidXGDump(data)) {
        console.error(data);
        throw new Error("Invalid XG Multi Part Dump Sysex Message.");
    }

    if (isNaN(newPartNumber)) {
        console.error(newPartNumber);
        throw new Error("Invalid new part number.");
    }

    newData[7] = intToHex(newPartNumber);
    newData[13] = intToHex(newPartNumber);

    const validData = checkSysexAndReplaceCheckSum(newData);
    console.log(validData);

    // Checksum calculation
    return validData;
}

export { getSysexDumpRequestMessage, isValidXGDump, getXGMultiPartNumber, changeXGMultiPartNumber };
