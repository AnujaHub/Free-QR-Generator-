
function generateQR() {
      const qrDiv = document.getElementById("qrcode");
      qrDiv.innerHTML = "";

      let text = document.getElementById("text").value.trim();
      
      const result = isValidURL(text);


      if (result === "empty") {
        alert("Please enter a link");
        return;
      }

      if (result === "too_long") {
         alert("This link is quite long. The QR code may be dense and harder to scan on some devices. Consider using a shorter link if possible.");
      }

      if (result === "invalid") {
        alert("Enter a valid link (http, https or www)");
        return;
      }


      new QRCode(qrDiv, {
        text: text,
        width: 200,
        height: 200,
        correctLevel: QRCode.CorrectLevel.M // improves scan reliability
      });

// to hide generate btn
document.getElementById("generateBtn").style.display = "none";

// Show action btns
document.getElementById("downloadBtn").style.display = "inline-block";
document.getElementById("printBtn").style.display = "inline-block";
document.getElementById("shareBtn").style.display = "inline-block";
document.getElementById("clearBtn").style.display = "inline-block";


      document.getElementById("downloadBtn").style.display = "inline-block";
      document.getElementById("printBtn").style.display = "inline-block";
      document.getElementById("shareBtn").style.display = "inline-block";
      document.getElementById("clearBtn").style.display = "inline-block";
    }
  
function isValidURL(value){
    if (!value) return "empty";

    const urlRegex = /^(https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/i;

    if (!urlRegex.test(value)) return "invalid";

    if(value.length>250) return "too_long";

    return "ok"; 
}

function downloadQR() {
      const qrDiv = document.getElementById("qrcode");
      const img = qrDiv.querySelector("img") || qrDiv.querySelector("canvas");

      if (!img) {
        alert("Generate QR first");
        return;
      }

      let url;
      if (img.tagName === "IMG") {
        url = img.src;
      } else {
        url = img.toDataURL("image/png");
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-code.png";
      a.click();
    }

    function printQR() {
  const qrDiv = document.getElementById("qrcode");
  const img = qrDiv.querySelector("img") || qrDiv.querySelector("canvas");

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
  const qrDiv = document.getElementById("qrcode");
  const img = qrDiv.querySelector("img") || qrDiv.querySelector("canvas");

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
    alert("Sharing not supported. Please download instead.");
  }
}

function clearQR() {
  document.getElementById("qrcode").innerHTML = "";
  document.getElementById("text").value = "";

  document.getElementById("generateBtn").style.display = "inline-block";
  document.getElementById("downloadBtn").style.display = "none";
  document.getElementById("printBtn").style.display = "none";
  document.getElementById("shareBtn").style.display = "none";
  document.getElementById("clearBtn").style.display = "none";
}

// adding keyboard shortcuts
document.addEventListener("keydown", (e) => {
  const hasQR = document.getElementById("qrcode").children.length > 0;

  // ENTER → Generate QR
  if (e.key === "Enter") {
    const generateBtn = document.getElementById("generateBtn");
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



document.getElementById("text").addEventListener("input", () => {
  document.getElementById("generateBtn").style.display = "inline-block";
  document.getElementById("downloadBtn").style.display = "none";
  document.getElementById("printBtn").style.display = "none";
  document.getElementById("shareBtn").style.display = "none";
  document.getElementById("clearBtn").style.display = "none";
});