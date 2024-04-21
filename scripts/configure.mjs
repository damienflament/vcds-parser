/**
 * Configures the application.
 *
 * The manifest file is updated from the package description.
 * The application configuration file is also updated, including the generated
 * static resources list.
 */

"use strict";

import fs from "fs-extra";
import klawSync from "klaw-sync";
import { relative, resolve } from "path";

const PACKAGE = resolve(import.meta.dirname, "../package.json");
const PUBLIC = resolve(import.meta.dirname, "../public/");
const MANIFEST = resolve(PUBLIC, "vcds-parser.webmanifest");
const CONFIG = resolve(PUBLIC, "config.js");

const jsonOptions = { spaces: 4 };

fs.readJson(PACKAGE).then(info => {
    fs.readJson(MANIFEST).then(manifest => {
        console.log("Updating manifest...");

        manifest.description = info.description;

        return fs.writeJson(MANIFEST, manifest, jsonOptions);
    });

    console.log("Generating config...");
    const config = {
        version: info.version,
        cacheName: info.name + "-" + info.version,
        staticResources: klawSync(PUBLIC, { nodir: true })
            .map(({ path }) => "/" + relative(PUBLIC, path))
            .concat(["/"])
    };

    return fs.writeFile(CONFIG,
        "export default "
        + JSON.stringify(config, (_, v) => v, jsonOptions.spaces)
        + ";"
    );
});
