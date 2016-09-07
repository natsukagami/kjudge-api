// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/85ea13a9863bbe73e9f3c5d0313de822bfd1cc87/uuid/UUID.d.ts
declare module "uuid" {
  /**
   * Generates a v1 (time-based) uuid.
   * @param  {Array<number>} node  Node id as Array of 6 bytes (per 4.1.6). Default: Randomly generated ID. See note 1.
   * @param  {number}        clockseq (Number between 0 - 0x3fff) RFC clock sequence. Default: An internally maintained clockseq is used.
   * @param  {number | Date}        msecs    Time in milliseconds since unix Epoch. Default: The current time is used.
   * @return {string}                 Returns the string form of the UUID
   */
  export function v1(options?: {
    node?: Array<number>,
    clockseq?: number,
    msecs?: number | Date,
    nsecs?: number
  }): string;
  /**
   * Generates a v1 (time-based) uuid.
   * @param  {Array<number>} node  Node id as Array of 6 bytes (per 4.1.6). Default: Randomly generated ID. See note 1.
   * @param  {number}        clockseq (Number between 0 - 0x3fff) RFC clock sequence. Default: An internally maintained clockseq is used.
   * @param  {number | Date}        msecs    Time in milliseconds since unix Epoch. Default: The current time is used.
   * @param  {number}           nsecs  Number between 0-9999) additional time, in 100-nanosecond units. Ignored if msecs is unspecified. Default: internal uuid counter is used, as per 4.2.1.2.
   * @param  {Array<any> |        Buffer}      buffer Array or buffer where UUID bytes are to be written.
   * @param  {number}        offset   Starting index in buffer at which to begin writing.
   * @return {Buffer}                 Returns buffer of the UUID
   */
  export function v1(options: {
    node?: Array<number>,
    clockseq?: number,
    msecs?: number | Date,
    nsecs?: number
  }, buffer: Array<any> | Buffer, offset?: number): Buffer;
  /**
   * Generates a v4 (random based) uuid.
   * @param  {Array<number>} random Array of 16 numbers (0-255) to use in place of randomly generated values
   * @param  {Function}           rng Random # generator to use. Set to one of the built-in generators - uuid.mathRNG (all platforms), uuid.nodeRNG (node.js only), uuid.whatwgRNG (WebKit only) - or a custom function that returns an array[16] of byte values.
   * @return {string}                Returns the string form of the UUID
   */
  export function v4(options?: {
    random: Array<number>,
    rng: Function
  }): string;
  /**
   * [v4 description]
   * @param  {Array<number>} random Array of 16 numbers (0-255) to use in place of randomly generated values
   * @param  {Function}           rng Random # generator to use. Set to one of the built-in generators - uuid.mathRNG (all platforms), uuid.nodeRNG (node.js only), uuid.whatwgRNG (WebKit only) - or a custom function that returns an array[16] of byte values.
   * @param  {Array<any> |        Buffer}      buffer Array or buffer where UUID bytes are to be written.
   * @param  {number}        offset   Starting index in buffer at which to begin writing.
   * @return {Buffer}                 Returns buffer of the UUID
   */
  export function v4(options: {
    random: Array<number>,
    rng: Function
  }, buffer: Array<any> | Buffer, offset?: number): Buffer;
}