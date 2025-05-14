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
        
        // Gradient elements
        const colorStyleRadios = document.querySelectorAll('input[name="colorStyle"]');
        const solidColorGroup = document.getElementById('solidColorGroup');
        const gradientColorGroup = document.getElementById('gradientColorGroup');
        const gradientColor1 = document.getElementById('gradientColor1');
        const gradientColor2 = document.getElementById('gradientColor2');
        const gradientColor1Hex = document.getElementById('gradientColor1Hex');
        const gradientColor2Hex = document.getElementById('gradientColor2Hex');
        const gradientType = document.getElementById('gradientType');
        const gradientDirection = document.getElementById('gradientDirection');
        const linearDirectionGroup = document.getElementById('linearDirectionGroup');
        
        let qrCode;

        // Generate QR code
        function generateQRCode() {
            // Clear previous QR codes first by emptying the container
            qrCanvas.innerHTML = '';
            if(qrCode) {
                qrCode.clear();
                qrCode = null;
            }
            
            const url = urlInput.value.trim() || 'https://example.com';
            const size = parseInt(qrSize.value);
            
            // Create QR Code with initial settings
            qrCode = new QRCode(qrCanvas, {
                text: url,
                width: size,
                height: size,
                colorDark: foregroundColor.value, // This may be overridden by gradient
                colorLight: backgroundColor.value,
                correctLevel: QRCode.CorrectLevel.H // High error correction for better readability
            });

            // Apply custom styles after initial QR generation
            setTimeout(() => {
                const dotStyle = document.querySelector('input[name="dotStyle"]:checked').value;
                const colorStyle = document.querySelector('input[name="colorStyle"]:checked').value;
                const qrImg = qrCanvas.querySelector('img');
                
                // Only proceed if the QR image exists
                if (qrImg) {
                    // Wait until QR image is fully loaded
                    if (!qrImg.complete) {
                        qrImg.onload = function() {
                            applyCustomStyle(dotStyle, colorStyle);
                        };
                    } else {
                        applyCustomStyle(dotStyle, colorStyle);
                    }
                } else {
                    console.error("QR image not found in canvas");
                }
            }, 200); // Longer timeout for reliability
            
            // Enable download button
            downloadBtn.disabled = false;
        }

        // Function to apply custom styles
        function applyCustomStyle(dotStyle, colorStyle) {
            const qrImg = qrCanvas.querySelector('img');
            if (!qrImg) return;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to match QR code
            const size = parseInt(qrSize.value);
            canvas.width = size;
            canvas.height = size;

            // Wait for QR image to be fully loaded
            if (!qrImg.complete) {
                qrImg.onload = function() {
                    proceedWithStyling();
                };
            } else {
                proceedWithStyling();
            }

            function proceedWithStyling() {
                // Fill the background
                ctx.fillStyle = backgroundColor.value;
                ctx.fillRect(0, 0, size, size);
                
                // Create and apply the styled QR code
                drawStyledQR(ctx, qrImg, dotStyle, colorStyle, size);
            }
        }

        // Helper function to draw the styled QR code
        function drawStyledQR(ctx, qrImg, dotStyle, colorStyle, size) {
            // Create temporary canvas to analyze QR code
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = size;
            tempCanvas.height = size;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw original QR to analyze it
            tempCtx.drawImage(qrImg, 0, 0, size, size);
            const imageData = tempCtx.getImageData(0, 0, size, size);

            // Get the actual module count from the QR code
            // This is more accurate than using a fixed divisor
            let moduleCount = 0;
            // Find the first dark pixel
            let firstDarkX = 0;
            let firstDarkY = 0;
            let foundFirst = false;

            // Find the first dark pixel
            for (let y = 0; y < size && !foundFirst; y++) {
                for (let x = 0; x < size && !foundFirst; x++) {
                    const pixelIndex = (y * size + x) * 4;
                    if (imageData.data[pixelIndex] < 128) { // Dark pixel
                        firstDarkX = x;
                        firstDarkY = y;
                        foundFirst = true;
                    }
                }
            }

            // Count modules in one row
            if (foundFirst) {
                let lastDarkX = firstDarkX;
                // Find the last black pixel in the same row
                for (let x = firstDarkX; x < size; x++) {
                    const pixelIndex = (firstDarkY * size + x) * 4;
                    if (imageData.data[pixelIndex] < 128) { // Dark pixel
                        lastDarkX = x;
                    }
                }

                // Now count transitions from dark to light in this row
                let isInDark = true; // We start in a dark module since firstDarkX is dark
                let moduleStartX = firstDarkX;
                let count = 0;

                for (let x = firstDarkX + 1; x <= lastDarkX; x++) {
                    const pixelIndex = (firstDarkY * size + x) * 4;
                    const isDark = imageData.data[pixelIndex] < 128;
                    
                    if (isDark !== isInDark) { // We've found a transition
                        count++;
                        isInDark = isDark;
                    }
                }
                
                moduleCount = Math.ceil(count / 2) + 1; // +1 because we count transitions, not modules
            }

            // Use a default if we couldn't determine
            if (moduleCount < 21) { // Minimum size for QR
                moduleCount = 25; // Default estimate
            }

            const moduleSize = size / moduleCount;

            // Create gradient if needed
            let gradient = null;
            if (colorStyle === 'gradient' && gradientColor1 && gradientColor2) {
                if (gradientType.value === 'linear') {
                    // Create linear gradient
                    switch(gradientDirection.value) {
                        case 'horizontal':
                            gradient = ctx.createLinearGradient(0, 0, size, 0);
                            break;
                        case 'vertical':
                            gradient = ctx.createLinearGradient(0, 0, 0, size);
                            break;
                        case 'diagonal':
                        default:
                            gradient = ctx.createLinearGradient(0, 0, size, size);
                            break;
                    }
                } else { // radial
                    // Create radial gradient from center
                    gradient = ctx.createRadialGradient(
                        size/2, size/2, 0,
                        size/2, size/2, size/2
                    );
                }
                
                // Add colors to gradient
                gradient.addColorStop(0, gradientColor1.value);
                gradient.addColorStop(1, gradientColor2.value);
            }

            // Draw the modules
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    const x = Math.floor(col * moduleSize);
                    const y = Math.floor(row * moduleSize);
                    const centerX = x + moduleSize / 2;
                    const centerY = y + moduleSize / 2;
                    
                    // Check if this is a dark module
                    const pixelIndex = (Math.floor(y + moduleSize/2) * size + Math.floor(x + moduleSize/2)) * 4;
                    if (imageData.data[pixelIndex] < 128) { // Dark module
                        // Set fill style based on color options
                        if (colorStyle === 'gradient' && gradient) {
                            ctx.fillStyle = gradient;
                        } else {
                            ctx.fillStyle = foregroundColor.value;
                        }
                        
                        if (dotStyle === 'rounded') {
                            // Draw rounded rectangle
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
                        } else if (dotStyle === 'dots') {
                            // Draw circle
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, moduleSize / 2 * 0.85, 0, Math.PI * 2);
                            ctx.fill();
                        } else if (dotStyle === 'diamond') {
                            // Draw diamond
                            ctx.beginPath();
                            ctx.moveTo(centerX, y);
                            ctx.lineTo(x + moduleSize, centerY);
                            ctx.lineTo(centerX, y + moduleSize);
                            ctx.lineTo(x, centerY);
                            ctx.closePath();
                            ctx.fill();
                        } else {
                            // Default square style
                            ctx.fillRect(x, y, moduleSize, moduleSize);
                        }
                    }
                }
            }

            // Update the QR code image
            const qrContainer = qrCanvas.querySelector('img');
            qrContainer.src = canvas.toDataURL('image/png');
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

        // For color inputs, regenerate on 'change' but update UI on 'input'
        [foregroundColor, backgroundColor, gradientColor1, gradientColor2].forEach(colorInput => {
            if (!colorInput) return; // Skip if element doesn't exist
            
            colorInput.addEventListener('change', generateQRCode); // Regenerate QR on final color selection
            colorInput.addEventListener('input', function() { // Update UI elements in real-time
                let hexDisplayId;
                if (this.id === 'foregroundColor') hexDisplayId = 'fgColorHex';
                else if (this.id === 'backgroundColor') hexDisplayId = 'bgColorHex';
                else if (this.id === 'gradientColor1') hexDisplayId = 'gradientColor1Hex';
                else if (this.id === 'gradientColor2') hexDisplayId = 'gradientColor2Hex';
                
                if (hexDisplayId) {
                    document.getElementById(hexDisplayId).textContent = this.value;
                }
                
                // Update the color preview circle next to the input
                const previewSpan = this.nextElementSibling;
                if (previewSpan && previewSpan.classList.contains('color-preview')) {
                    previewSpan.style.backgroundColor = this.value;
                }
            });
        });
        
        // Toggle between solid color and gradient options
        colorStyleRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'solid') {
                    solidColorGroup.style.display = 'block';
                    gradientColorGroup.style.display = 'none';
                } else {
                    solidColorGroup.style.display = 'none';
                    gradientColorGroup.style.display = 'block';
                }
                generateQRCode();
            });
        });
        
        // Handle gradient type change to show/hide direction dropdown
        if (gradientType) {
            gradientType.addEventListener('change', function() {
                if (this.value === 'linear' && linearDirectionGroup) {
                    linearDirectionGroup.style.display = 'block';
                } else if (linearDirectionGroup) {
                    linearDirectionGroup.style.display = 'none';
                }
                generateQRCode();
            });
        }
        
        // Also regenerate QR code when gradient options change
        if (gradientDirection) {
            gradientDirection.addEventListener('change', generateQRCode);
        }
        
        // Also listen for radio button changes for QR style
        document.querySelectorAll('input[name="dotStyle"]').forEach(radio => {
            radio.addEventListener('change', generateQRCode);
        });

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
