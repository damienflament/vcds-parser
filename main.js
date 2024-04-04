import { registerServiceWorker } from "./lib/service-worker.js";
import { setupEventListeners } from "./lib/application.js";

registerServiceWorker("sw.js");
setupEventListeners();
