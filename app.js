/**
 * The main application module.
 * @module
 */

import { DirectoryPicker, Menu, Navbar, Notification, NotificationArea, Section } from "./lib/components.js";
import { listDirectory, requestPermission } from "./lib/filesystem.js";
import { registerServiceWorker } from "./lib/service-worker.js";
import { Storage, persist } from "./lib/storage.js";
import van from "./lib/van.js";

registerServiceWorker("./sw.js");

const App = () => {
    const { pre } = van.tags;

    /** Persisted state */
    const state = {
        directory: van.state(null)
    };
    const storage = new Storage(window.indexedDB);
    persist(state, storage);

    /** Current directory name */
    const directoryName = van.derive(() => state.directory.val?.name ?? "");

    /** Current directory files */
    const directoryFiles = van.state([]);

    /**
     * Opens the last used directory.
     *
     * The directory stored in the persisted state is opened. If a permission
     * has to be requested to the user, a notification is shown.
     */
    async function openLastUsedDirectory() {
        const directory = state.directory.val;

        if (directory) {
            requestPermission(directory).then(permission => {
                switch (permission) {
                    case "granted":
                        listDirectory(directory)
                            .then((files) => directoryFiles.val = files);
                        break;

                    case "prompt":
                        van.add(notificationsArea, Notification({
                            message: "Do you want to load the last opened directory ?",
                            label: "Yes, open it",
                            action: () => openLastUsedDirectory()
                        }));
                        break;
                }
            });
        }
    }

    van.derive(openLastUsedDirectory);

    /** Notification area */
    const notificationsArea = NotificationArea();

    return [
        Navbar({ logo: { src: "/assets/logo.png", alt: "VCDS Parser Logo" } }),
        Section(
            notificationsArea,
            DirectoryPicker({
                label: "Scans directory",
                directoryState: state.directory,
                directoryName: directoryName
            }),
            Menu({ label: "Files", itemsState: directoryFiles, formatter: (file) => file.name }),
            pre({
                class: "textarea",
                style: "height: auto;"
            }, ""),
        )
    ];

};

van.add(document.body, App());
