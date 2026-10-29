document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const preview = document.getElementById('preview-section');
    const canvas = document.getElementById('result-canvas');
    const image = document.getElementById('result-image');
    const save = document.getElementById('download-btn');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1800;
    let outputUrl = null;
    let outputFile = null;
    let generation = 0;

    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('画像を読み込めませんでした。別の画像を選んでください。')); };
            img.src = url;
        });
    }

    async function handleFiles(fileList) {
        const files = Array.from(fileList);
        if (!files.length) return;
        if (files.length > 4 || files.some(file => !file.type.startsWith('image/'))) {
            alert('画像を1〜4枚選択してください。');
            input.value = '';
            return;
        }
        const current = ++generation;
        try {
            const images = await Promise.all(files.map(loadImage));
            if (current !== generation) return;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 4; i++) {
                const img = images[i % images.length];
                const width = 584, height = 884;
                const aspect = width / height;
                let sw = img.width, sh = img.height;
                if (sw / sh > aspect) sw = sh * aspect;
                else sh = sw / aspect;
                ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh,
                    (i % 2) * 600 + 8, Math.floor(i / 2) * 900 + 8, width, height);
            }
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.setLineDash([15, 15]);
            ctx.beginPath();
            ctx.moveTo(600, 0); ctx.lineTo(600, 1800);
            ctx.moveTo(0, 900); ctx.lineTo(1200, 900);
            ctx.stroke();
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
            if (current !== generation) return;
            if (!blob) throw new Error('画像を作成できませんでした。');
            if (outputUrl) URL.revokeObjectURL(outputUrl);
            outputUrl = URL.createObjectURL(blob);
            outputFile = new File([blob], 'wallet-photo.jpg', { type: 'image/jpeg' });
            image.src = outputUrl;
            dropZone.classList.add('hidden');
            preview.classList.remove('hidden');
        } catch (error) {
            if (current === generation) { alert(error.message); input.value = ''; }
        }
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
        dropZone.addEventListener(name, event => { event.preventDefault(); event.stopPropagation(); });
    });
    ['dragenter', 'dragover'].forEach(name => dropZone.addEventListener(name, () => dropZone.classList.add('dragover')));
    ['dragleave', 'drop'].forEach(name => dropZone.addEventListener(name, () => dropZone.classList.remove('dragover')));
    dropZone.addEventListener('drop', event => handleFiles(event.dataTransfer.files));
    input.addEventListener('change', () => handleFiles(input.files));
    save.addEventListener('click', async () => {
        if (!outputFile) return;
        const data = { files: [outputFile] };
        if (navigator.share && navigator.canShare && navigator.canShare(data)) {
            try { await navigator.share(data); } catch (error) {
                if (error.name !== 'AbortError') alert('共有できませんでした。画像を長押しして保存してください。');
            }
        } else {
            const link = document.createElement('a');
            link.href = outputUrl;
            link.download = outputFile.name;
            link.click();
        }
    });
    document.getElementById('reset-btn').addEventListener('click', () => {
        generation++;
        preview.classList.add('hidden');
        dropZone.classList.remove('hidden');
        input.value = '';
        image.removeAttribute('src');
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        outputUrl = null;
        outputFile = null;
    });
});
