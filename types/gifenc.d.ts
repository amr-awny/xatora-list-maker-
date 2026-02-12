declare module "gifenc" {
  interface GIFEncoderOptions {
    auto?: boolean
    initialCapacity?: number
  }

  interface WriteFrameOptions {
    palette?: number[][]
    delay?: number
    transparent?: boolean
    transparentIndex?: number
    repeat?: number
    dispose?: number
    first?: boolean
  }

  interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: WriteFrameOptions
    ): void
    finish(): void
    bytes(): Uint8Array
    bytesView(): Uint8Array
    writeHeader(): void
    reset(): void
    buffer: ArrayBuffer
  }

  export function GIFEncoder(opts?: GIFEncoderOptions): GIFEncoderInstance

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: {
      format?: "rgb565" | "rgb444" | "rgba4444"
      oneBitAlpha?: boolean | number
      clearAlpha?: boolean
      clearAlphaThreshold?: number
      clearAlphaColor?: number
    }
  ): number[][]

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: "rgb565" | "rgb444" | "rgba4444"
  ): Uint8Array

  export function nearestColorIndex(
    palette: number[][],
    pixel: number[]
  ): number

  export function nearestColorIndexWithDistance(
    palette: number[][],
    pixel: number[]
  ): [number, number]
}
