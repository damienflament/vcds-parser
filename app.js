const formEl = document.getElementById("scan");
const filePathEl = document.getElementById("scan-file-path");
const contentEl = document.getElementById("scan-content");

function showFileContent() {
    const reader = new FileReader();
    let file = filePathEl.files[0];

    reader.onload = () => {
        contentEl.textContent = reader.result;
    };

    reader.readAsText(file);
}

function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").then(
            (registration) => {
                console.log("Service worker registration successful:", registration);
            },
            (error) => {
                console.error(`Service worker registration failed: ${error}`);
            }
        );
    } else {
        console.error("Service workers are not supported");
    }
}

formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    showFileContent();
});

registerServiceWorker();
