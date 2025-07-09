document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const fileNameSpan = document.getElementById('fileName');
    const previewImage = document.getElementById('previewImage');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const formatButtons = document.querySelectorAll('.format-btn');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusArea = document.getElementById('statusArea');
    const darkModeToggle = document.getElementById('darkModeToggle');

    let uploadedFile = null;
    let selectedFormat = 'png';
    let convertedBlob = null;

    // --- Utility Functions ---

    function showStatus(message, type = 'info') {
        statusArea.textContent = message;
        statusArea.className = `status-area ${type}`;
        console.log(`Status: ${message} (${type})`);
    }

    function clearStatus() {
        statusArea.textContent = '';
        statusArea.className = 'status-area';
        console.log('Status cleared.');
    }

    function resetUI() {
        uploadedFile = null;
        convertedBlob = null;
        imageInput.value = '';
        fileNameSpan.textContent = 'No file chosen';
        previewImage.src = '#';
        previewImage.style.display = 'none';
        previewPlaceholder.style.display = 'block';
        downloadBtn.disabled = true;
        clearStatus();

        formatButtons.forEach(btn => btn.classList.remove('selected'));
        const defaultPngBtn = document.querySelector('.format-btn[data-format="png"]');
        if (defaultPngBtn) {
            defaultPngBtn.classList.add('selected');
        }
        selectedFormat = 'png';
        console.log('UI reset. Default format set to PNG.');
    }

    // Fungsi untuk mengonversi gambar
    function convertImage(file, format) {
        return new Promise((resolve, reject) => {
            if (!file) {
                return reject(new Error('No file provided for conversion.'));
            }
            console.log(`Attempting to convert ${file.name} to ${format}...`);

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set canvas dimensions to image dimensions
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;

                    ctx.drawImage(img, 0, 0);

                    let mimeType;
                    let quality = 0.9; // Kualitas default untuk JPEG/WebP

                    switch (format) {
                        case 'png':
                            mimeType = 'image/png';
                            break;
                        case 'jpeg':
                        case 'jpg':
                            mimeType = 'image/jpeg';
                            break;
                        case 'webp':
                            mimeType = 'image/webp';
                            break;
                        case 'bmp':
                            mimeType = 'image/bmp';
                            break;
                        case 'gif':
                            mimeType = 'image/gif';
                            break;
                        case 'ico':
                            // ICO tidak didukung secara langsung oleh canvas.toBlob()
                            // Kita akan mengonversi ke PNG lalu mencoba mengunduhnya dengan ekstensi .ico
                            // atau menggunakan pustaka pihak ketiga untuk ICO yang proper
                            // Untuk simplisitas, kita akan biarkan sebagai PNG/JPEG/WebP dan mengubah ekstensi file saja.
                            // Pendekatan yang lebih baik untuk ICO adalah menggunakan library js-ico.
                            // Untuk saat ini, kita akan lakukan konversi dasar ke PNG dan menamai ulang sebagai .ico
                            mimeType = 'image/png'; // Default ke PNG untuk konversi internal
                            console.warn("ICO conversion is basic (PNG renamed to ICO). For multi-resolution ICO, consider a dedicated library.");
                            break;
                        default:
                            console.warn(`Unsupported format requested: ${format}. Defaulting to image/png.`);
                            mimeType = 'image/png';
                    }

                    // Konversi konten canvas ke Blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            console.log(`Conversion to ${mimeType} successful. Blob size: ${blob.size} bytes.`);
                            resolve(blob);
                        } else {
                            console.error('Failed to get Blob from canvas.');
                            reject(new Error(`Failed to convert image to ${format}. Your browser might not support this format for conversion.`));
                        }
                    }, mimeType, quality);
                };
                img.onerror = () => {
                    console.error('Failed to load image for conversion.');
                    reject(new Error('Failed to load image for conversion. Please ensure it is a valid image.'));
                };
                img.src = e.target.result;
            };
            reader.onerror = () => {
                console.error('FileReader error:', reader.error);
                reject(new Error('Failed to read file.'));
            };
            reader.readAsDataURL(file);
        });
    }

    // --- Event Handlers ---

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showStatus('Invalid file type. Please upload an image.', 'error');
                resetUI();
                return;
            }

            resetUI();
            uploadedFile = file;
            fileNameSpan.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (event) => {
                previewImage.src = event.target.result;
                previewImage.style.display = 'block';
                previewPlaceholder.style.display = 'none';
                
                showStatus('Image loaded. Converting to PNG (default)...', 'info');
                convertImage(uploadedFile, selectedFormat) // selectedFormat is 'png' by default
                    .then(blob => {
                        convertedBlob = blob;
                        showStatus(`Image loaded and converted to ${selectedFormat.toUpperCase()}. Ready to download.`, 'success');
                        downloadBtn.disabled = false;
                    })
                    .catch(error => {
                        showStatus(`Initial conversion failed: ${error.message}`, 'error');
                        downloadBtn.disabled = true;
                        convertedBlob = null;
                    });
            };
            reader.onerror = () => {
                showStatus('Error reading file.', 'error');
                resetUI();
            };
            reader.readAsDataURL(file);
        } else {
            resetUI();
        }
    });

    formatButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!uploadedFile) {
                showStatus('Please upload an image first.', 'error');
                return;
            }

            formatButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');

            const newFormat = button.dataset.format;
            selectedFormat = newFormat; // Update selectedFormat

            showStatus(`Converting to ${newFormat.toUpperCase()}...`, 'info');

            convertImage(uploadedFile, selectedFormat)
                .then(blob => {
                    convertedBlob = blob;
                    showStatus(`Conversion to ${newFormat.toUpperCase()} successful! Ready to download.`, 'success');
                    downloadBtn.disabled = false;
                })
                .catch(error => {
                    showStatus(`Conversion failed: ${error.message}`, 'error');
                    downloadBtn.disabled = true;
                    convertedBlob = null;
                });
        });
    });

    downloadBtn.addEventListener('click', () => {
        if (convertedBlob) {
            const url = URL.createObjectURL(convertedBlob);
            const a = document.createElement('a');
            a.href = url;
            
            const originalFileName = uploadedFile.name.split('.').slice(0, -1).join('.');
            let fileExtension = selectedFormat;
            if (selectedFormat === 'jpeg') {
                fileExtension = 'jpg';
            } else if (selectedFormat === 'ico') {
                fileExtension = 'ico'; // Pastikan ekstensi .ico
            }
            
            a.download = `${originalFileName}_converted.${fileExtension}`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showStatus('Image downloaded successfully!', 'success');
            console.log(`Downloaded: ${a.download}`);
        } else {
            showStatus('No image to download. Please convert an image first.', 'error');
            console.warn('Download button clicked but no converted blob available.');
        }
    });

    // --- Dark Mode Implementation ( unchanged ) ---
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
        updateDarkModeIcon();
        console.log('Dark mode toggled.');
    }

    function updateDarkModeIcon() {
        const icon = darkModeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    darkModeToggle.addEventListener('click', toggleDarkMode);

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeIcon();

    // --- Initial Setup ---
    resetUI();
    console.log('Image Converter script loaded and initialized.');
});