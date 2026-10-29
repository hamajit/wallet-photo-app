document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        en: { description: 'Create a 4×6 photo grid from 1–4 photos', select: 'Choose photos', hint: 'Choose up to 4 photos. Fewer than 4 will repeat to fill the grid.', save: 'Share and save image', saveHint: 'On iPhone, select “Save Image” in the share menu. You can also touch and hold the image to save it.', reset: 'Choose different photos', alt: 'Preview of the four-photo grid', invalid: 'Please choose 1–4 image files.', loadError: 'Could not read the image. Please choose another image.', createError: 'Could not create the image.', previewError: 'Could not display the preview. Please try again.', shareError: 'Could not share. Touch and hold the image to save it.' },
        ja: { description: '1〜4枚の写真から4×6サイズの画像を作成', select: '写真を選択', hint: '最大4枚まで選択できます。4枚未満の場合は繰り返して配置します。', save: '共有して画像を保存', saveHint: 'iPhoneでは共有メニューの「画像を保存」を選択。画像を長押しして保存することもできます。', reset: '別の写真を選ぶ', alt: '作成した4枚組画像のプレビュー', invalid: '画像を1〜4枚選択してください。', loadError: '画像を読み込めませんでした。別の画像を選んでください。', createError: '画像を作成できませんでした。', previewError: 'プレビューを表示できませんでした。もう一度お試しください。', shareError: '共有できませんでした。画像を長押しして保存してください。' },
        zh: { description: '将1至4张照片制作成4×6照片拼图', select: '选择照片', hint: '最多选择4张照片。不足4张时将重复填满。', save: '分享并保存图片', saveHint: '在 iPhone 上，请在分享菜单中选择“存储图像”。也可以长按图片保存。', reset: '选择其他照片', alt: '四格照片拼图预览', invalid: '请选择1至4个图片文件。', loadError: '无法读取图片，请选择其他图片。', createError: '无法生成图片。', previewError: '无法显示预览，请重试。', shareError: '无法分享，请长按图片保存。' },
        es: { description: 'Crea una cuadrícula de fotos de 4×6 con 1 a 4 fotos', select: 'Elegir fotos', hint: 'Elige hasta 4 fotos. Si hay menos, se repetirán para llenar la cuadrícula.', save: 'Compartir y guardar imagen', saveHint: 'En iPhone, selecciona «Guardar imagen» en el menú de compartir. También puedes mantener pulsada la imagen para guardarla.', reset: 'Elegir otras fotos', alt: 'Vista previa de la cuadrícula de cuatro fotos', invalid: 'Elige entre 1 y 4 archivos de imagen.', loadError: 'No se pudo leer la imagen. Elige otra.', createError: 'No se pudo crear la imagen.', previewError: 'No se pudo mostrar la vista previa. Inténtalo de nuevo.', shareError: 'No se pudo compartir. Mantén pulsada la imagen para guardarla.' },
        ko: { description: '사진 1~4장으로 4×6 사진 격자 만들기', select: '사진 선택', hint: '최대 4장까지 선택할 수 있습니다. 4장 미만이면 반복하여 채웁니다.', save: '공유하여 이미지 저장', saveHint: 'iPhone에서는 공유 메뉴에서 “이미지 저장”을 선택하세요. 이미지를 길게 눌러 저장할 수도 있습니다.', reset: '다른 사진 선택', alt: '4장 사진 격자 미리보기', invalid: '이미지 파일을 1~4개 선택하세요.', loadError: '이미지를 읽을 수 없습니다. 다른 이미지를 선택하세요.', createError: '이미지를 만들 수 없습니다.', previewError: '미리보기를 표시할 수 없습니다. 다시 시도하세요.', shareError: '공유할 수 없습니다. 이미지를 길게 눌러 저장하세요.' }
    };
    const language = document.getElementById('language');
    const t = key => translations[language.value][key];
    function updateLanguage() {
        document.documentElement.lang = language.value === 'zh' ? 'zh-Hans' : language.value;
        document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
        document.getElementById('result-image').alt = t('alt');
    }
    language.addEventListener('change', updateLanguage);
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
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(t('loadError'))); };
            img.src = url;
        });
    }

    async function handleFiles(fileList) {
        const files = Array.from(fileList);
        if (!files.length) return;
        if (files.length > 4 || files.some(file => !file.type.startsWith('image/'))) {
            alert(t('invalid'));
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
            if (!blob) throw new Error(t('createError'));
            if (outputUrl) URL.revokeObjectURL(outputUrl);
            outputUrl = URL.createObjectURL(blob);
            outputFile = new File([blob], 'wallet-photo.jpg', { type: 'image/jpeg' });
            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = () => reject(new Error(t('previewError')));
                image.src = outputUrl;
            });
            if (current !== generation) return;
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
                if (error.name !== 'AbortError') alert(t('shareError'));
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
