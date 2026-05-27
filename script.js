
// adding state management 
const appState = {
    qrGenerated: false,
    qrText: "",
    qrColor: "#000000",
    bgColor: "#ffffff"
};



const qrDiv = document.getElementById("qrcode");
const textInput = document.getElementById("text");

const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const printBtn = document.getElementById("printBtn");
const shareBtn = document.getElementById("shareBtn");
const clearBtn = document.getElementById("clearBtn");

const errorMessage = document.getElementById("errorMessage");


function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.style.display = "none";
}

function getQRImage() {
    return qrDiv.querySelector("img") || qrDiv.querySelector("canvas");
}

// colors 
const qrColorInput = document.getElementById("qrColor");
const bgColorInput = document.getElementById("bgColor");
const customizationPanel = document.getElementById("customizationPanel");


function createQRCode(text) {
  qrDiv.innerHTML = "";

  new QRCode(qrDiv, {
  text: text,
  width: 200,
  height: 200,
  colorDark: appState.qrColor,
  colorLight: appState.bgColor,
  correctLevel: QRCode.CorrectLevel.M
});
}

qrColorInput.addEventListener("input", () => {

  appState.qrColor = qrColorInput.value;

  localStorage.setItem("qrState", JSON.stringify(appState));

  if (appState.qrGenerated) {
    createQRCode(appState.qrText);
  }
});

bgColorInput.addEventListener("input", () => {

  appState.bgColor = bgColorInput.value;

  localStorage.setItem("qrState", JSON.stringify(appState));

  if (appState.qrGenerated) {
    createQRCode(appState.qrText);
  }
});

function renderQRFromState() {

    createQRCode(appState.qrText);
}

function toggleButtons(showQRControls) {

    generateBtn.style.display =
        showQRControls ? "none" : "inline-block";

    downloadBtn.style.display =
        showQRControls ? "inline-block" : "none";

    printBtn.style.display =
        showQRControls ? "inline-block" : "none";

    shareBtn.style.display =
        showQRControls ? "inline-block" : "none";

    clearBtn.style.display =
        showQRControls ? "inline-block" : "none";

    customizationPanel.style.display =
        showQRControls ? "flex" : "none";
}

function generateQR() {

    textInput.value = textInput.value.trim();

    const result = isValidURL(textInput.value);

    if (result === "empty") {
        showError("Please enter a link");
        return;
    }

    if (result === "too_long") {
        showError("This link is quite long. The QR code may be dense and harder to scan on some devices. Consider using a shorter link if possible.");
    }

    if (result === "invalid") {
        showError("Enter a valid link (http, https or www)");
        return;
    }


    createQRCode(textInput.value);

    appState.qrGenerated = true;
    appState.qrText = textInput.value;

    localStorage.setItem("qrState", JSON.stringify(appState));

    clearError();
    toggleButtons(true);

}

function isValidURL(value) {
    if (!value) return "empty";

    const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

    if (!urlRegex.test(value)) return "invalid";

    if (value.length > 250) return "too_long";

    return "ok";
}

function downloadQR() {
    const img = getQRImage();

    if (!img) {
        showError("Generate QR first");
        return;
    }

    const url = img.tagName === "IMG" ? img.src : img.toDataURL("image/png");

    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.png";
    a.target = "_blank"; // important for mobile
    a.click();
}

function printQR() {

    const img = getQRImage();

    if (!img) return;

    const src =
        img.tagName === "IMG" ? img.src : img.toDataURL("image/png");

    const win = window.open("", "_blank");
    win.document.write(`
    <html>
      <head>
        <title>Print QR</title>
        <style>
          body {
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            margin:0;
          }
          img { width:300px; height:300px; }
        </style>
      </head>
      <body>
        <img src="${src}" />
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
    win.document.close();
}


async function shareQRImage() {

    const img = getQRImage();

    if (!img) return;

    let blob;
    if (img.tagName === "IMG") {
        const res = await fetch(img.src);
        blob = await res.blob();
    } else {
        blob = await new Promise(r => img.toBlob(r, "image/png"));
    }

    const file = new File([blob], "qr-code.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
            files: [file],
            title: "QR Code",
            text: "Here’s a QR code"
        });
    } else {
        showError("Sharing not supported. Please download instead.");
    }
}


function clearQR() {
    clearError();
    qrDiv.innerHTML = "";
    textInput.value = "";

    toggleButtons(false);

    appState.qrGenerated = false;
    appState.qrText = "";

    localStorage.removeItem("qrState");

}

// adding keyboard shortcuts
document.addEventListener("keydown", (e) => {
    const hasQR = appState.qrGenerated;


    // ENTER → Generate QR
    if (e.key === "Enter") {
        clearError();
        if (generateBtn.style.display !== "none") {
            generateQR();
        }
    }

    // ESC → Clear QR
    if (e.key === "Escape" && hasQR) {
        clearQR();
    }

    // CTRL / CMD + S → Download QR
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && hasQR) {
        e.preventDefault();
        downloadQR();
    }

    // CTRL / CMD + P → Print QR
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p" && hasQR) {
        e.preventDefault();
        printQR();
    }

    // CTRL / CMD + SHIFT + S → Share QR
    if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "s" &&
        hasQR
    ) {
        e.preventDefault();
        shareQRImage();
    }
});



textInput.addEventListener("input", () => {
    clearError();
    toggleButtons(false);
});


window.addEventListener("load", () => {
    const saved = localStorage.getItem("qrState");
    if (!saved) return;

    const state = JSON.parse(saved);

    appState.qrGenerated = state.qrGenerated;
    appState.qrText = state.qrText;

    appState.qrColor = state.qrColor || "#000000";
    appState.bgColor = state.bgColor || "#ffffff";

    qrColorInput.value = appState.qrColor;
    bgColorInput.value = appState.bgColor;

    if (appState.qrGenerated) {
        textInput.value = appState.qrText;
        renderQRFromState();
        toggleButtons(true);
    }
});

generateBtn.addEventListener("click", generateQR);

downloadBtn.addEventListener("click", downloadQR);

printBtn.addEventListener("click", printQR);

shareBtn.addEventListener("click", shareQRImage);

clearBtn.addEventListener("click", clearQR);