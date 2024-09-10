// script.js

// Function to handle the file upload
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

	const file = fileInput.files[0];
	const fileType = file.type;

	if (fileType === 'application/pdf') {
		processPDF(file);
	} else if (fileType.startsWith('image/')) {
		processImage(file);
	} else {
		alert('Please upload a valid image or PDF file.');
	}
}

// Function to process images with Tesseract.js
function processImage(file) {
	const output = document.getElementById('output');
	const editableText = document.getElementById('editableText');
	const reader = new FileReader();

	reader.onload = function (e) {
		const image = new Image();
		image.src = e.target.result;
		output.appendChild(image); // Display image

		// OCR using Tesseract.js
		Tesseract.recognize(image.src, 'eng', {
			preserve_interword_spaces: 1, // Try to maintain layout
			logger: (m) => console.log(m) // Log progress
		}).then(({
			data: {
				text
			}
		}) => {
			editableText.innerHTML = text; // Display extracted text in editable div
		}).catch((err) => {
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

	reader.onload = function (e) {
		const typedArray = new Uint8Array(e.target.result);

		// Load PDF using PDF.js
		pdfjsLib.getDocument(typedArray).promise.then(pdf => {
			// For each page in the PDF, render the page to an image and run OCR
			for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
				pdf.getPage(pageNum).then(page => {
					const viewport = page.getViewport({
						scale: 1.5
					});
					const canvas = document.createElement('canvas');
					const context = canvas.getContext('2d');
					canvas.height = viewport.height;
					canvas.width = viewport.width;

					page.render({
						canvasContext: context,
						viewport: viewport
					}).promise.then(() => {
						const imgData = canvas.toDataURL('image/png');
						output.appendChild(canvas); // Display the rendered page

						// OCR using Tesseract.js
						Tesseract.recognize(imgData, 'eng', {
							preserve_interword_spaces: 1, // Try to maintain layout
							logger: (m) => console.log(m) // Log progress
						}).then(({
							data: {
								text
							}
						}) => {
							editableText.innerHTML += text; // Append extracted text in editable div
						}).catch((err) => {
							output.innerText = 'Error reading PDF: ' + err.message;
						});
					});
				});
			}
		}).catch((err) => {
			output.innerText = 'Error loading PDF: ' + err.message;
		});
	};

	reader.readAsArrayBuffer(file);
}

// Function to copy text from editable div
function copyText() {
	const editableText = document.getElementById('editableText');
	const range = document.createRange();
	range.selectNode(editableText);
	window.getSelection().removeAllRanges(); // Clear current selection
	window.getSelection().addRange(range); // Select the text
	document.execCommand('copy'); // Copy to clipboard
	window.getSelection().removeAllRanges(); // Deselect text
	alert('Text copied to clipboard!');
}
