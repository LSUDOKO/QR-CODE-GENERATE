// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Show corresponding tab pane
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // QR Code Generator functionality
    if(document.getElementById('qrGenerator')) {
        const qrForm = document.getElementById('qrForm');
        const qrCanvas = document.getElementById('qrCode');
        const downloadBtn = document.getElementById('downloadBtn');
        const urlInput = document.getElementById('urlInput');
        const foregroundColor = document.getElementById('foregroundColor');
        const backgroundColor = document.getElementById('backgroundColor');
        const qrSize = document.getElementById('qrSize');
        const userBackgroundImageInput = document.getElementById('userBackgroundImage'); // ADDED
        const imagePreview = document.getElementById('imagePreview');
        const canvas = document.createElement('canvas');
        let qrCode;
        let userUploadedBgSrc = null; // ADDED: To store the data URL of user-uploaded image

        // Initialize QR code
        function generateQRCode() {
            // Clear previous QR codes first by emptying the container
            qrCanvas.innerHTML = '';
            if(qrCode) {
                qrCode.clear();
                qrCode = null;
            }
            
            const url = urlInput.value.trim() || 'https://example.com';
            const size = parseInt(qrSize.value);
            const fgColor = foregroundColor.value;
            const bgColor = backgroundColor.value;
            
            qrCode = new QRCode(qrCanvas, {
                text: url,
                width: size,
                height: size,
                colorDark: fgColor,
                colorLight: bgColor,
                correctLevel: QRCode.CorrectLevel.H // High error correction for better readability with backgrounds
            });
            
            // Apply dot style first, then background image if needed
            setTimeout(() => {
                const dotStyle = document.querySelector('input[name="dotStyle"]:checked').value;
                if (dotStyle !== 'square') {
                    applyDotStyle(); // This function will internally check for userUploadedBgSrc
                } else if (userUploadedBgSrc) { // MODIFIED: Check if user uploaded an image
                    // If square style and has user background image
                    applyBackgroundImage(userUploadedBgSrc); // MODIFIED: Pass the uploaded image src
                }
                // If square style and NO userUploadedBgSrc, qrcode.js handled it.
            }, 100);
            
            // Enable download button
            downloadBtn.disabled = false;
        }
        
        // Handle form submission
        qrForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateQRCode();
        });

        // Generate QR code on input changes for regeneration
        [urlInput, qrSize].forEach(input => {
            input.addEventListener('change', generateQRCode);
        });

        // Event listener for user-uploaded background image
        if (userBackgroundImageInput) {
            userBackgroundImageInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        userUploadedBgSrc = e.target.result;
                        imagePreview.innerHTML = ''; // Clear previous preview
                        const preview = document.createElement('img');
                        preview.src = userUploadedBgSrc;
                        preview.style.maxWidth = '100px';
                        preview.style.maxHeight = '100px';
                        preview.style.borderRadius = '5px';
                        imagePreview.appendChild(preview);
                        generateQRCode(); // Regenerate QR code with new background
                    };
                    reader.readAsDataURL(file);
                } else {
                    userUploadedBgSrc = null;
                    imagePreview.innerHTML = '<span class="preview-placeholder">No image selected</span>'; // Reset preview
                    generateQRCode(); // Regenerate QR code without background
                }
            });
        }

        // For color inputs, regenerate on 'change' but update UI on 'input'
        [foregroundColor, backgroundColor].forEach(colorInput => {
            colorInput.addEventListener('change', generateQRCode); // Regenerate QR on final color selection
            colorInput.addEventListener('input', function() { // Update UI elements in real-time
                const hexDisplayId = this.id === 'foregroundColor' ? 'fgColorHex' : 'bgColorHex';
                document.getElementById(hexDisplayId).textContent = this.value;
                
                // Update the color preview circle next to the input
                const previewSpan = this.nextElementSibling;
                if (previewSpan && previewSpan.classList.contains('color-preview')) {
                    previewSpan.style.backgroundColor = this.value;
                }
            });
        });
        
        // Also listen for radio button changes for QR style
        document.querySelectorAll('input[name="dotStyle"]').forEach(radio => {
            radio.addEventListener('change', generateQRCode);
        });
        
        // Apply background image to QR code
        function applyBackgroundImage(imageSrc) {
            if (!qrCode || !imageSrc) return; // MODIFIED: Added !imageSrc check

            const qrImg = qrCanvas.querySelector('img');
            if (!qrImg) return; // Ensure qrImg exists
            
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to match QR code
            canvas.width = parseInt(qrSize.value);
            canvas.height = parseInt(qrSize.value);
            
            // Create background image
            const bgImg = new Image();
            bgImg.onload = function() {
                // Draw background first (scaled to fit)
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                
                // Modified approach for better scannability with visible background
                // First, analyze the QR code image to identify dark modules
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = qrImg.width;
                tempCanvas.height = qrImg.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(qrImg, 0, 0);
                
                // Get the QR code pixel data
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                const data = imageData.data;
                
                // Create a transparent output for the QR code
                const outputData = tempCtx.createImageData(tempCanvas.width, tempCanvas.height);
                const outData = outputData.data;
                
                // Process each pixel
                for (let i = 0; i < data.length; i += 4) {
                    // If it's a dark pixel in the original QR code (dark modules)
                    if (data[i] < 128) {
                        // Make it black with 85% opacity - dark enough to scan but slightly transparent
                        outData[i] = 0;      // R
                        outData[i+1] = 0;    // G
                        outData[i+2] = 0;    // B
                        outData[i+3] = 215;  // Alpha (85% of 255 = ~215)
                    } else {
                        // Light modules are completely transparent
                        outData[i] = 0;
                        outData[i+1] = 0;
                        outData[i+2] = 0;
                        outData[i+3] = 0;  // Fully transparent
                    }
                }
                
                // Put the modified data back to temp canvas
                tempCtx.putImageData(outputData, 0, 0);
                
                // Draw the modified QR code on top of the background
                ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
                
                // Replace QR image with our combined image
                qrImg.src = canvas.toDataURL('image/png');
            };
            bgImg.src = imageSrc;
        }
        
        // Handle download button
        downloadBtn.addEventListener('click', function() {
            const qrImg = qrCanvas.querySelector('img');
            if (!qrImg) return;
            
            // Create a temporary anchor to download the image
            const a = document.createElement('a');
            a.href = qrImg.src;
            a.download = 'custom-qrcode.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
        
        // Generate initial QR code
        generateQRCode();
        
        // Apply QR code dot style
        function applyDotStyle() {
            setTimeout(() => {
                const qrImg = qrCanvas.querySelector('img');
                if (!qrImg || !qrCode || !qrCode.qrcode || typeof qrCode.qrcode.isDark !== 'function' || typeof qrCode.qrcode.moduleCount === 'undefined') {
                    console.error("QR code object not ready or isDark/moduleCount not available for styling.");
                    if (userUploadedBgSrc) {
                        applyBackgroundImage(userUploadedBgSrc);
                    }
                    return;
                }

                const style = document.querySelector('input[name="dotStyle"]:checked').value;

                if (style === 'square') {
                    if (userUploadedBgSrc) {
                        applyBackgroundImage(userUploadedBgSrc);
                    }
                    return;
                }

                const outputCanvas = document.createElement('canvas');
                const ctx = outputCanvas.getContext('2d');
                
                const outputSize = parseInt(qrSize.value);
                outputCanvas.width = outputSize;
                outputCanvas.height = outputSize;
                
                ctx.fillStyle = backgroundColor.value;
                ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
                
                ctx.fillStyle = foregroundColor.value;
                
                const moduleCount = qrCode.qrcode.moduleCount;
                if (moduleCount === 0) {
                    console.error("Module count is zero, cannot apply style.");
                    return;
                }

                const moduleSize = outputCanvas.width / moduleCount;

                for (let row = 0; row < moduleCount; row++) {
                    for (let col = 0; col < moduleCount; col++) {
                        if (qrCode.qrcode.isDark(row, col)) {
                            const x = col * moduleSize;
                            const y = row * moduleSize;
                            const centerX = x + moduleSize / 2;
                            const centerY = y + moduleSize / 2;
                            
                            if (style === 'rounded') {
                                const radius = moduleSize / 3;
                                ctx.beginPath();
                                ctx.moveTo(x + radius, y);
                                ctx.lineTo(x + moduleSize - radius, y);
                                ctx.quadraticCurveTo(x + moduleSize, y, x + moduleSize, y + radius);
                                ctx.lineTo(x + moduleSize, y + moduleSize - radius);
                                ctx.quadraticCurveTo(x + moduleSize, y + moduleSize, x + moduleSize - radius, y + moduleSize);
                                ctx.lineTo(x + radius, y + moduleSize);
                                ctx.quadraticCurveTo(x, y + moduleSize, x, y + moduleSize - radius);
                                ctx.lineTo(x, y + radius);
                                ctx.quadraticCurveTo(x, y, x + radius, y);
                                ctx.closePath();
                                ctx.fill();
                            } else if (style === 'dots') { // 'dots' is the value for circular dots
                                ctx.beginPath();
                                ctx.arc(centerX, centerY, (moduleSize / 2) * 0.85, 0, Math.PI * 2); // Relative radius
                                ctx.fill();
                            } else if (style === 'diamond') {
                                ctx.beginPath();
                                ctx.moveTo(x + moduleSize / 2, y); // Top point
                                ctx.lineTo(x + moduleSize, y + moduleSize / 2); // Right point
                                ctx.lineTo(x + moduleSize / 2, y + moduleSize); // Bottom point
                                ctx.lineTo(x, y + moduleSize / 2); // Left point
                                ctx.closePath();
                                ctx.fill();
                            }
                        }
                    }
                }
                
                qrImg.src = outputCanvas.toDataURL('image/png');
                
                if (userUploadedBgSrc) {
                    setTimeout(() => {
                        applyBackgroundImage(userUploadedBgSrc);
                    }, 50);
                }
            }, 100);
        }
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animation for feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');
    
    function checkScroll() {
        featureCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight - 100) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }
    
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    window.addEventListener('scroll', checkScroll);
    checkScroll();
});
