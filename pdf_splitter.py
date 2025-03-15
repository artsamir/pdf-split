import os
from PyPDF2 import PdfReader, PdfWriter
from pdf2image import convert_from_path

def process_pdf(pdf_path, upload_folder):
    """Convert PDF pages to images and return the number of pages."""
    pdf = PdfReader(pdf_path)
    pages = len(pdf.pages)
    
    # Convert pages to images
    images = convert_from_path(pdf_path, dpi=100)
    for i, image in enumerate(images, start=1):
        image.save(os.path.join(upload_folder, f'page_{i}.png'), 'PNG')
    
    return pages

def split_pdf(pdf_path, start, end, output_path):
    """Split the PDF from start to end pages."""
    pdf_reader = PdfReader(pdf_path)
    pdf_writer = PdfWriter()
    
    for page_num in range(start - 1, end):
        pdf_writer.add_page(pdf_reader.pages[page_num])
    
    with open(output_path, 'wb') as output_file:
        pdf_writer.write(output_file)