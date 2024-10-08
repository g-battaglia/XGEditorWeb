/**
 * Converts an integer to a hexadecimal string.
 *
 * @param number An integer to convert.
 * @returns A hexadecimal string.
 * @throws {Error} If the input is not an integer.
 */
function intToHex(number: number): string {
    if (!Number.isInteger(number)) {
        throw new Error("Input must be an integer.");
    }
    const hex = number.toString(16).toUpperCase();
    return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Converts a hexadecimal string to an integer.
 *
 * @param hex A hexadecimal string to convert.
 * @returns An integer.
 * @throws {Error} If the input is not a hexadecimal string.
 */
function hexToInt(hex: string): number {
    if (typeof hex !== "string" || !/^[0-9A-Fa-f]+$/.test(hex)) {
        throw new Error("Input must be a valid hexadecimal string.");
    }
    return parseInt(hex, 16);
}

/**
 * Gets an element at a negative index.
 *
 * @param array An array.
 * @param negativeIndex A negative index.
 */
function getPositiveIndexFromNegativeIndex(array: any[], negativeIndex: number): number {
    if (negativeIndex >= 0) {
        throw new Error("Index should be negative");
    }
    const positiveIndex = array.length + negativeIndex;
    return positiveIndex;
}
export { intToHex, hexToInt, getPositiveIndexFromNegativeIndex };
