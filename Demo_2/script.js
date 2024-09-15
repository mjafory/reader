// Function to handle file uploads
function processFile() {
    const fileInput = document.getElementById('upload');
    const output = document.getElementById('output');
    const editableText = document.getElementById('editableText');
    output.innerHTML = ''; // Clear previous results
    editableText.innerHTML = ''; // Clear extracted text

    if (fileInput.files.length === 0) {
        alert('Please upload a file.');
        return;
    }

    Array.from(fileInput.files).forEach(file => {
        const fileType = file.type;

        if (fileType === 'application/pdf') {
            processPDF(file);
        } else if (fileType.startsWith('image/')) {
            processImage(file);
        } else {
            alert('Please upload a valid image or PDF file.');
        }
    });
}

// Function to process images with Tesseract.js
function processImage(file) {
    const output = document.getElementById('output');
    const editableText = document.getElementById('editableText');
    const reader = new FileReader();

    reader.onload = function(e) {
        const image = new Image();
        image.src = e.target.result;
        output.appendChild(image); // Display image

        // OCR using Tesseract.js
        Tesseract.recognize(image.src, 'eng', {
            preserve_interword_spaces: 1, // Try to maintain layout
            logger: m => console.log(m) // Log progress
        }).then(({ data: { text } }) => {
            editableText.innerHTML += text; // Append extracted text in editable div
            processExtractedText(text); // Extract specific information
        }).catch(err => {
            output.innerText = 'Error reading image: ' + err.message;
        });
    };

    reader.readAsDataURL(file);
}

// Function to process PDFs using PDF.js
function processPDF(file) {
    const output = document.getElementById('output');
    const editableText = document.getElementById('editableText');
    const reader = new FileReader();

    reader.onload = function(e) {
        const typedArray = new Uint8Array(e.target.result);

        // Load PDF using PDF.js
        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
            // For each page in the PDF, render the page to an image and run OCR
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                pdf.getPage(pageNum).then(page => {
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
                        const imgData = canvas.toDataURL('image/png');
                        output.appendChild(canvas); // Display the rendered page

                        // OCR using Tesseract.js
                        Tesseract.recognize(imgData, 'eng', {
                            preserve_interword_spaces: 1, // Try to maintain layout
                            logger: m => console.log(m) // Log progress
                        }).then(({ data: { text } }) => {
                            editableText.innerHTML += text; // Append extracted text in editable div
                            processExtractedText(text); // Extract specific information
                        }).catch(err => {
                            output.innerText = 'Error reading PDF: ' + err.message;
                        });
                    });
                });
            }
        }).catch(err => {
            output.innerText = 'Error loading PDF: ' + err.message;
        });
    };

    reader.readAsArrayBuffer(file);
}

// Function to process the extracted text and display specific information
function processExtractedText(text) {
    const firstName = extractFirstName(text);
    const lastName = extractLastName(text);
    const dob = extractDOB(text);
    const address = extractAddress(text);
    const aptNumber = extractAptNumber(text);
    const city = extractCity(text);
    const zipCode = extractZipCode(text);
    const votedBefore = extractVotedBefore(text);

    document.getElementById('firstNameOutput').innerText = firstName || 'Not found';
    document.getElementById('lastNameOutput').innerText = lastName || 'Not found';
    document.getElementById('dobOutput').innerText = dob || 'Not found';
    document.getElementById('addressOutput').innerText = address || 'Not found';
    document.getElementById('aptNumberOutput').innerText = aptNumber || 'Not found';
    document.getElementById('cityOutput').innerText = city || 'Not found';
    document.getElementById('zipCodeOutput').innerText = zipCode || 'Not found';
    document.getElementById('votedBeforeOutput').innerText = votedBefore || 'Not found';
}

// Function to extract specific fields using regex
function extractFirstName(text) {
    const firstNameRegex = /First Name:?\s*([A-Za-z\s]+)/i;
    const match = text.match(firstNameRegex);
    return match ? match[1]?.trim() : 'Not found';
}

function extractLastName(text) {
    const lastNameRegex = /Last Name:?\s*([A-Za-z\s]+)/i;
    const match = text.match(lastNameRegex);
    return match ? match[1]?.trim() : 'Not found';
}

function extractDOB(text) {
    const dobRegex = /Date of Birth:?\s*([\d\/\-]+)/i;
    const match = text.match(dobRegex);
    return match ? match[1]?.trim() : 'Not found';
}

function extractAddress(text) {
    const addressRegex = /Address:?\s*(.+)/i;
    const match = text.match(addressRegex);
    return match ? match[1]?.trim() : 'Not found';
}

function extractAptNumber(text) {
    const aptNumberRegex = /Apt\. Number:?\s*(\d+)/i;
    const match = text.match(aptNumberRegex);
    return match ? match[1]?.trim() : 'Not found';
}

function extractCity(text) {
    const cityRegex = /City:?\s*([A-Za-z\s]+)/i;
    const match = text.match(cityRegex);
    return match ? match[1]?.trim() : 'Not found';
}

function extractZipCode(text) {
    const zipCodeRegex = /Zip Code:?\s*(\d+)/i;
    const match = text.match(zipCodeRegex);
    return match ? match[1]?.trim() : 'Not found';
}

function extractVotedBefore(text) {
    const votedBeforeRegex = /Voted Before:?\s*(Yes|No)/i;
    const match = text.match(votedBeforeRegex);
    return match ? match[1]?.trim() : 'Not found';
}

// Function to copy text to clipboard
function copyText() {
    const textArea = document.createElement('textarea');
    textArea.value = document.getElementById('editableText').innerText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Text copied to clipboard!');
}
