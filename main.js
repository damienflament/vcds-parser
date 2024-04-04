/**
 * Main module.
 *
 * Should be load from the HTML document as a `type="module"` script.
 * @module main
 */

import { registerServiceWorker } from "./lib/service-worker.js";
import { setupEventListeners } from "./lib/application.js";

registerServiceWorker("sw.js");
setupEventListeners();
