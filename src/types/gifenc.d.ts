declare module "gifenc" {
  export interface GifWriteOptions {
    palette?: number[][];
    delay?: number;
    repeat?: number;
    transparent?: boolean;
    dispose?: number;
    first?: boolean;
  }
  export function GIFEncoder(opts?: { initialCapacity?: number; auto?: boolean }): {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: GifWriteOptions): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  };
  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number, opts?: { format?: "rgb565" | "rgb444" | "rgba4444"; oneBitAlpha?: boolean | number; clearAlpha?: boolean }): number[][];
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: number[][], format?: "rgb565" | "rgb444" | "rgba4444"): Uint8Array;
}
