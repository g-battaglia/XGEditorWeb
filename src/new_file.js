// Step 1: Convert hex strings to a byte array
function hexStringToByteArray(hexString) {
    const byteArray = [];
    for (let i = 0; i < hexString.length; i += 2) {
        byteArray.push(parseInt(hexString.substr(i, 2), 16));
    }
    return byteArray;
}

function hexArrayToByteArray(hexArray) {
    return hexArray.flatMap((hexString) =>
        hexString.startsWith("0x") ? hexStringToByteArray(hexString.slice(2)) : hexStringToByteArray(hexString)
    );
}

// Step 2: Create a Blob from the byte array
function createSysExBlob(byteArray) {
    return new Blob([new Uint8Array(byteArray)], { type: "application/octet-stream" });
}

// Step 3: Create a link element to download the Blob as a file
function downloadSysExFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Example usage
const hexArray = ["0x00", "0x01", "0x02", "0x03"];
const byteArray = hexArrayToByteArray(hexArray);
const sysExBlob = createSysExBlob(byteArray);
downloadSysExFile(sysExBlob, "example.syx");
