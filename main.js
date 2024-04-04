import { registerServiceWorker } from "./lib/service-worker.js";
import { setupEventListeners, reloadData } from "./lib/application.js";

registerServiceWorker("sw.js");
setupEventListeners();
