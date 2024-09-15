import pytesseract
import pdfplumber
from PIL import Image
import os

# Function to perform OCR on an image
def ocr_image(image_path):
    print(f"Checking image file: {image_path}")
    if not os.path.isfile(image_path):
        return f"Image file '{image_path}' does not exist."
    
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        return f"Error performing OCR on image: {str(e)}"

# Function to extract text from a PDF
def extract_text_from_pdf(pdf_path):
    print(f"Checking PDF file: {pdf_path}")
    if not os.path.isfile(pdf_path):
        return f"PDF file '{pdf_path}' does not exist."
    
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                else:
                    text += f"[No text found on page {page_num}]\n"
    except Exception as e:
        return f"Error extracting text from PDF: {str(e)}"
    
    return text

# Example usage
if __name__ == "__main__":
    # Print the current working directory
    print("Current working directory:", os.getcwd())
    
    # Define the PDF path
    pdf_path = "t.pdf"  # Ensure this matches the actual file name
    print("Absolute path to PDF:", os.path.abspath(pdf_path))
    
    # Verify the existence of the PDF file
    if not os.path.isfile(pdf_path):
        print(f"PDF file '{pdf_path}' does not exist in the directory.")
    else:
        pdf_text = extract_text_from_pdf(pdf_path)
        print("Extracted text from PDF:")
        print(pdf_text)
