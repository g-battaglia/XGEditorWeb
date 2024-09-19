// types.d.ts
declare namespace WebMidi {
  interface MIDIAccess {
    inputs: MIDIInputMap;
    outputs: MIDIOutputMap;
  }

  interface MIDIInputMap extends Iterable<[string, MIDIInput]> {
    get(id: string): MIDIInput | undefined;
    has(id: string): boolean;
  }

  interface MIDIOutputMap extends Iterable<[string, MIDIOutput]> {
    get(id: string): MIDIOutput | undefined;
    has(id: string): boolean;
  }

  interface MIDIInput {
    onmidimessage: (event: MIDIMessageEvent) => void;
  }

  interface MIDIOutput {
    send(data: Uint8Array, timestamp?: number): void;
  }

  interface MIDIMessageEvent extends Event {
    data: Uint8Array;
  }
}
