document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const previewSection = document.getElementById('preview-section');
    const canvas = document.getElementById('result-canvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Canvas size for 4x6 at 300 DPI (1200x1800 pixels)
    // Wallet size output (2 cols x 2 rows = 4 photos)
    const CANVAS_WIDTH = 1200;
    const CANVAS_HEIGHT = 1800;

    // Each photo cell dimension in the grid
    const CELL_WIDTH = CANVAS_WIDTH / 2;
    const CELL_HEIGHT = CANVAS_HEIGHT / 2;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Handle Drag and Drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) handleFile(files[0]);
    });

    // Handle standard click upload
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください。');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => processImage(img);
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function processImage(img) {
        // Clear canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Aspect ratio for each cell (600x900 = 2:3)
        const cellAspect = CELL_WIDTH / CELL_HEIGHT;
        const imgAspect = img.width / img.height;

        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

        // Crop center of the image to perfectly fit the 2:3 cell
        if (imgAspect > cellAspect) {
            // Original is wider, crop horizontal centers
            srcW = img.height * cellAspect;
            srcX = (img.width - srcW) / 2;
        } else {
            // Original is taller, crop vertical centers
            srcH = img.width / cellAspect;
            srcY = (img.height - srcH) / 2;
        }

        // Add padding inside cells if desired (e.g., 10px white border for easier cutting)
        const padding = 16;
        const drawW = CELL_WIDTH - padding;
        const drawH = CELL_HEIGHT - padding;

        // Draw 2x2 grid
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const destX = col * CELL_WIDTH + padding / 2;
                const destY = row * CELL_HEIGHT + padding / 2;
                ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, drawW, drawH);
            }
        }

        // Draw subtle cut-lines (guidelines) in the center
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 15]);

        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT / 2);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
        ctx.stroke();

        // Switch UI to show preview
        dropZone.classList.add('hidden');
        previewSection.classList.remove('hidden');
    }

    // Handle Download
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.download = `wallet-photo-${timestamp}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
    });

    // Handle Reset
    resetBtn.addEventListener('click', () => {
        previewSection.classList.add('hidden');
        dropZone.classList.remove('hidden');
        fileInput.value = ''; // Reset input to allow re-uploading the same file
    });
});
