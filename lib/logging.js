/**
 * Logging utilities.
 * @module logging
 */

/**
  * Logs a message made from the given data.
  *
  * The message is shown in the console.
  *
  * @param {...any} data
  */
export function log(...data) {
  console.log(...data);
}

/**
 * Shows an error message made from the given data.
 *
 * The error message is shown in the console.
 *
 * @param {...any} data
 */
export function error(...data) {
  console.error(...data);
}
