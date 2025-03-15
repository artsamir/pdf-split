const dropZone = document.getElementById('dropZone');
const pdfUpload = document.getElementById('pdfUpload');
const workspace = document.getElementById('workspace');
const pageContainer = document.getElementById('pageContainer');
const preview = document.getElementById('preview');
const previewContainer = document.getElementById('previewContainer');
const downloadLink = document.getElementById('downloadLink');
const splitModal = document.getElementById('splitModal');
const splitStart = document.getElementById('splitStart');
const splitEnd = document.getElementById('splitEnd');
const confirmSplit = document.getElementById('confirmSplit');
const cancelSplit = document.getElementById('cancelSplit');

let totalPages = 0;
let currentSplitPage = 0;

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

dropZone.querySelector('.btn-link').addEventListener('click', () => pdfUpload.click());
pdfUpload.addEventListener('change', (e) => handleFile(e.target.files[0]));

async function handleFile(file) {
  if (!file || !file.type.match('pdf')) {
    alert('Please upload a valid PDF.');
    return;
  }

  const formData = new FormData();
  formData.append('pdf', file);

  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  const data = await response.json();

  if (data.success) {
    workspace.classList.remove('d-none');
    renderPages(data.pages);
    totalPages = data.pages;
  } else {
    alert('Failed to process PDF.');
  }
}

function renderPages(pages) {
  pageContainer.innerHTML = '';
  for (let i = 1; i <= pages; i++) {
    const pageItem = document.createElement('div');
    pageItem.className = 'page-item';
    pageItem.innerHTML = `
      <img src="/static/uploads/page_${i}.png" alt="Page ${i}">
      <div class="page-number">Page ${i}</div>
      <i class="fas fa-cut split-icon" data-page="${i}"></i>
    `;
    pageContainer.appendChild(pageItem);
  }

  document.querySelectorAll('.split-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      currentSplitPage = parseInt(icon.dataset.page);
      splitStart.value = currentSplitPage;
      splitEnd.value = currentSplitPage;
      splitStart.max = totalPages;
      splitEnd.max = totalPages;
      splitModal.style.display = 'flex';
    });
  });
}

cancelSplit.addEventListener('click', () => {
  splitModal.style.display = 'none';
});

confirmSplit.addEventListener('click', async () => {
  const start = parseInt(splitStart.value);
  const end = parseInt(splitEnd.value);

  if (start < 1 || end > totalPages || start > end) {
    alert('Invalid page range.');
    return;
  }

  const response = await fetch('/split', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start, end })
  });
  const data = await response.json();

  if (data.success) {
    splitModal.style.display = 'none';
    preview.classList.remove('d-none');
    previewContainer.innerHTML = '';
    for (let i = start; i <= end; i++) {
      const pageItem = document.createElement('div');
      pageItem.className = 'page-item';
      pageItem.innerHTML = `<img src="/static/uploads/page_${i}.png" alt="Page ${i}">`;
      previewContainer.appendChild(pageItem);
    }
    downloadLink.href = '/static/uploads/split_output.pdf';
  } else {
    alert('Failed to split PDF.');
  }
});