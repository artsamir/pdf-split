from flask import Flask, request, jsonify, send_from_directory, render_template
import os
from pdf_splitter import process_pdf, split_pdf
import traceback  # Add this for detailed error logging

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'pdf' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    
    file = request.files['pdf']
    if file.filename == '' or not file.filename.endswith('.pdf'):
        return jsonify({'success': False, 'error': 'Invalid file'}), 400
    
    # Clear previous uploads
    for f in os.listdir(UPLOAD_FOLDER):
        os.remove(os.path.join(UPLOAD_FOLDER, f))
    
    pdf_path = os.path.join(UPLOAD_FOLDER, 'input.pdf')
    file.save(pdf_path)
    
    try:
        pages = process_pdf(pdf_path, UPLOAD_FOLDER)
        return jsonify({'success': True, 'pages': pages})
    except Exception as e:
        print("Error processing PDF:")  # Log to terminal
        traceback.print_exc()          # Print full stack trace
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/split', methods=['POST'])
def split():
    data = request.get_json()
    start = data['start']
    end = data['end']
    
    pdf_path = os.path.join(UPLOAD_FOLDER, 'input.pdf')
    output_path = os.path.join(UPLOAD_FOLDER, 'split_output.pdf')
    
    try:
        split_pdf(pdf_path, start, end, output_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True)