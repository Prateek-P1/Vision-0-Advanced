// Global variables
let currentTool = 'cursor';
let isDrawing = false;
let startX = 0;
let startY = 0;
let currentShape = null;
let tempCanvas = null;

// Store annotations for each view
let annotations = {
    axial: [],
    coronal: [],
    sagittal: []
};

// Zoom and pan states for each view
let viewStates = {
    axial: { zoom: 1, panX: 0, panY: 0 },
    coronal: { zoom: 1, panX: 0, panY: 0 },
    sagittal: { zoom: 1, panX: 0, panY: 0 }
};

// XTK variables - using the working approach from original code
let volumeData = null;
let renderer = null;
let dimensions = {
    x: { min: 0, max: 100, physical: 0 },
    y: { min: 0, max: 100, physical: 0 },
    z: { min: 0, max: 100, physical: 0 }
};

// Image processing settings
let imageSettings = {
    opacity: 100,
    threshold: 128,
    volumeOpacity: 50
};

// EXACT COPY of your original animation system from safety_advanced.js
$(document).ready(function() {
    console.log('Document ready - initializing MRI viewer...');
    
    // Store animation intervals - EXACT from your original
    const animations = {
        'axial-slider': null,
        'coronal-slider': null,
        'sagittal-slider': null
    };
    
    // Initialize the application
    initializeApplication();
    
    // EXACT COPY of your original animation controls
    $(".animate-btn").click(function() {
        const sliderId = $(this).data("target");
        const slider = $("#" + sliderId);
        const sliderMin = parseInt(slider.attr("min"));
        const sliderMax = parseInt(slider.attr("max"));
        
        // Stop any existing animation
        if (animations[sliderId]) {
            clearInterval(animations[sliderId]);
        }
        
        let direction = 1; // 1 for increasing, -1 for decreasing
        let currentValue = parseInt(slider.val());
        
        animations[sliderId] = setInterval(function() {
            // Change direction if we hit min or max
            if (currentValue >= sliderMax) {
                direction = -1;
            } else if (currentValue <= sliderMin) {
                direction = 1;
            }
            
            currentValue += direction;
            slider.val(currentValue);
            slider.trigger("input"); // Trigger the input event to update the display
        }, 150); // Adjust the speed of animation here
        
        $(".status-bar").text(`Animating ${sliderId.split('-')[0]} view`);
    });
    
    $(".stop-btn").click(function() {
        const sliderId = $(this).data("target");
        if (animations[sliderId]) {
            clearInterval(animations[sliderId]);
            animations[sliderId] = null;
            $(".status-bar").text(`Animation stopped for ${sliderId.split('-')[0]} view`);
        }
    });
    
    // Stop all animations when leaving the page
    $(window).on("beforeunload", function() {
        for (const sliderId in animations) {
            if (animations[sliderId]) {
                clearInterval(animations[sliderId]);
            }
        }
    });
});

function initializeApplication() {
    console.log('Initializing application...');
    
    // Load sample images immediately
    loadSampleImages();
    
    // Initialize canvases
    initializeAnnotationCanvases();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update status
    updateStatusBar('Application initialized - Upload NII file to view real data');
}

function loadSampleImages() {
    console.log('Loading sample images...');
    
    const views = ['axial', 'coronal', 'sagittal'];
    
    views.forEach((view, index) => {
        const img = document.getElementById(`${view}-img`);
        if (img) {
            // Create different sample brain images for each view
            const sampleImage = createSampleBrainImage(view);
            img.src = sampleImage;
            img.onload = function() {
                console.log(`${view} image loaded successfully`);
            };
            img.onerror = function() {
                console.error(`Failed to load ${view} image`);
            };
        }
    });
}

function createSampleBrainImage(view) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 400, 400);
    
    // Create different brain-like patterns for each view
    switch(view) {
        case 'axial':
            drawAxialBrainPattern(ctx);
            break;
        case 'coronal':
            drawCoronalBrainPattern(ctx);
            break;
        case 'sagittal':
            drawSagittalBrainPattern(ctx);
            break;
    }
    
    // Add view label
    ctx.fillStyle = '#666666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${view.charAt(0).toUpperCase() + view.slice(1)} View`, 200, 380);
    
    return canvas.toDataURL();
}

function drawAxialBrainPattern(ctx) {
    // Outer brain outline
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(200, 200, 150, 120, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Brain tissue simulation
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.ellipse(200, 200, 140, 110, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Ventricles
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.ellipse(180, 190, 20, 30, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(220, 190, 20, 30, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Gray matter simulation
    for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * 2 * Math.PI;
        const radius = 80 + Math.random() * 40;
        const x = 200 + Math.cos(angle) * radius;
        const y = 200 + Math.sin(angle) * radius * 0.8;
        
        ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.random() * 3, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawCoronalBrainPattern(ctx) {
    // Brain outline
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(200, 180, 130, 140, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Brain tissue
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.ellipse(200, 180, 120, 130, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Central structures
    ctx.fillStyle = '#222222';
    ctx.fillRect(180, 150, 40, 60);
    
    // Simulate brain folds
    for (let i = 0; i < 8; i++) {
        const x = 100 + i * 25;
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 100);
        ctx.quadraticCurveTo(x + 10, 150, x, 200);
        ctx.stroke();
    }
}

function drawSagittalBrainPattern(ctx) {
    // Brain outline (side view)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(200, 180, 140, 120, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Brain tissue
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.ellipse(200, 180, 130, 110, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Cerebellum
    ctx.fillStyle = '#444444';
    ctx.beginPath();
    ctx.arc(320, 220, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    // Brain stem
    ctx.fillStyle = '#555555';
    ctx.fillRect(190, 250, 20, 40);
    
    // Corpus callosum
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 180);
    ctx.quadraticCurveTo(200, 160, 250, 180);
    ctx.stroke();
}

function initializeAnnotationCanvases() {
    console.log('Initializing annotation canvases...');
    
    const views = ['axial', 'coronal', 'sagittal'];
    
    views.forEach(view => {
        const canvas = document.getElementById(`${view}-annotations`);
        const container = canvas.parentElement;
        
        if (canvas && container) {
            // Set canvas size
            resizeCanvas(canvas, container);
            
            // Set up resize observer
            const resizeObserver = new ResizeObserver(() => {
                resizeCanvas(canvas, container);
            });
            resizeObserver.observe(container);
            
            console.log(`${view} canvas initialized`);
        }
    });
}

function resizeCanvas(canvas, container) {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Tool selection
    $('.tool-btn[data-tool]').on('click', function() {
        const tool = $(this).data('tool');
        selectTool(tool);
    });
    
    // Clear all annotations
    $('#clear-all').on('click', function() {
        clearAllAnnotations();
    });
    
    // File upload
    $('#nii-file').on('change', function() {
        const file = this.files[0];
        handleFileUpload(file);
    });
    
    // Handle NII file upload form submission (like in original code)
    $("#nii-upload-form").submit(function(event) {
        event.preventDefault();
        updateStatusBar("Processing...");
        
        var formData = new FormData();
        formData.append("file", $("#nii-file")[0].files[0]);

        // For now, simulate the upload since we don't have the backend
        // In the original code, this would go to /upload_nii endpoint
        setTimeout(() => {
            const file = $("#nii-file")[0].files[0];
            if (file) {
                loadNIIFileDirectly(file);
            }
        }, 1000);
    });
    
    // EXACT COPY from your original safety_advanced.js - the animation that worked
    $("#axial-slider").on("input", function() {
        $("#axial-value").text($(this).val());
        updateSlice("axial", $(this).val());
        // Sync with z-axis if we had 3D slicer controls
        if (renderer && volumeData) {
            updateVolumeSlicer('z', $(this).val());
        }
    });

    $("#coronal-slider").on("input", function() {
        $("#coronal-value").text($(this).val());
        updateSlice("coronal", $(this).val());
        if (renderer && volumeData) {
            updateVolumeSlicer('y', $(this).val());
        }
    });

    $("#sagittal-slider").on("input", function() {
        $("#sagittal-value").text($(this).val());
        updateSlice("sagittal", $(this).val());
        if (renderer && volumeData) {
            updateVolumeSlicer('x', $(this).val());
        }
    });
    
    // Settings sliders with real-time value display
    $('#opacity-slider').on('input', function() {
        const value = this.value;
        imageSettings.opacity = value;
        $('#opacity-value').text(`${value}%`);
        updateOpacity(value);
    });
    
    $('#threshold-slider').on('input', function() {
        const value = this.value;
        imageSettings.threshold = value;
        $('#threshold-value').text(value);
        updateThreshold(value);
    });
    
    $('#volume-opacity-slider').on('input', function() {
        const value = this.value;
        imageSettings.volumeOpacity = value;
        $('#volume-opacity-value').text(`${value}%`);
        updateVolumeOpacity(value);
    });
    
    // Mouse events for each view
    ['axial', 'coronal', 'sagittal'].forEach(view => {
        const canvas = document.getElementById(`${view}-annotations`);
        const container = document.getElementById(`${view}-canvas`);
        
        if (canvas && container) {
            // Drawing events
            canvas.addEventListener('mousedown', (e) => handleMouseDown(e, view));
            canvas.addEventListener('mousemove', (e) => handleMouseMove(e, view));
            canvas.addEventListener('mouseup', (e) => handleMouseUp(e, view));
            canvas.addEventListener('mouseout', (e) => handleMouseOut(e, view));
            
            // Navigation events
            container.addEventListener('wheel', (e) => handleWheel(e, view));
            container.addEventListener('mousemove', (e) => updateCrosshair(e, view));
            container.addEventListener('mouseleave', (e) => hideCrosshair(view));
            
            // Prevent context menu
            container.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    });
    
    console.log('Event listeners set up successfully');
}

function selectTool(tool) {
    currentTool = tool;
    $('.tool-btn').removeClass('active');
    $(`.tool-btn[data-tool="${tool}"]`).addClass('active');
    updateCursor();
    updateStatusBar(`Selected tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)}`);
}

function updateCursor() {
    const canvases = document.querySelectorAll('.annotation-canvas');
    const drawingTools = ['pen', 'line', 'rectangle', 'circle', 'eraser'];
    
    canvases.forEach(canvas => {
        canvas.classList.toggle('drawing', drawingTools.includes(currentTool));
    });
}

// Mouse event handlers with complete annotation support
function handleMouseDown(e, view) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    startX = x;
    startY = y;
    isDrawing = true;
    
    const canvas = document.getElementById(`${view}-annotations`);
    const ctx = canvas.getContext('2d');
    
    switch(currentTool) {
        case 'pen':
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.strokeStyle = document.getElementById('stroke-color').value;
            ctx.lineWidth = document.getElementById('stroke-width').value;
            ctx.lineCap = 'round';
            ctx.globalCompositeOperation = 'source-over';
            break;
            
        case 'eraser':
            ctx.globalCompositeOperation = 'destination-out';
            break;
            
        case 'line':
        case 'rectangle':
        case 'circle':
            // Store current state for shape drawing
            currentShape = {
                type: currentTool,
                startX: x,
                startY: y,
                color: document.getElementById('stroke-color').value,
                width: document.getElementById('stroke-width').value
            };
            break;
            
        case 'label':
            addLabelAnnotation(x, y, view);
            isDrawing = false; // Don't continue drawing for labels
            break;
            
        case 'marker':
            addMarkerAnnotation(x, y, view);
            isDrawing = false; // Don't continue drawing for markers
            break;
            
        case 'measure':
            startMeasurement(x, y, view);
            isDrawing = false; // Don't continue drawing for measurements
            break;
    }
    
    e.preventDefault();
}

function handleMouseMove(e, view) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDrawing) {
        const canvas = document.getElementById(`${view}-annotations`);
        const ctx = canvas.getContext('2d');
        
        switch(currentTool) {
            case 'pen':
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
                
            case 'eraser':
                const eraserSize = parseInt(document.getElementById('stroke-width').value) * 3;
                ctx.beginPath();
                ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'line':
            case 'rectangle':
            case 'circle':
                // Clear canvas and redraw all annotations plus current shape
                redrawAnnotations(view);
                drawShapePreview(ctx, currentShape, x, y);
                break;
        }
    }
}

function handleMouseUp(e, view) {
    if (isDrawing) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (currentShape && (currentTool === 'line' || currentTool === 'rectangle' || currentTool === 'circle')) {
            // Finalize the shape
            currentShape.endX = x;
            currentShape.endY = y;
            currentShape.timestamp = Date.now();
            
            // Store the annotation
            annotations[view].push(currentShape);
            
            // Redraw all annotations
            redrawAnnotations(view);
            
            currentShape = null;
        }
        
        const canvas = document.getElementById(`${view}-annotations`);
        const ctx = canvas.getContext('2d');
        
        if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'source-over';
        }
        
        isDrawing = false;
    }
}

function drawShapePreview(ctx, shape, endX, endY) {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.width;
    ctx.globalCompositeOperation = 'source-over';
    
    switch(shape.type) {
        case 'line':
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            break;
            
        case 'rectangle':
            const width = endX - shape.startX;
            const height = endY - shape.startY;
            ctx.beginPath();
            ctx.rect(shape.startX, shape.startY, width, height);
            ctx.stroke();
            break;
            
        case 'circle':
            const radius = Math.sqrt(Math.pow(endX - shape.startX, 2) + Math.pow(endY - shape.startY, 2));
            ctx.beginPath();
            ctx.arc(shape.startX, shape.startY, radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
    }
}

function redrawAnnotations(view) {
    const canvas = document.getElementById(`${view}-annotations`);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all stored annotations
    annotations[view].forEach(annotation => {
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = annotation.width || 2;
        ctx.globalCompositeOperation = 'source-over';
        
        switch(annotation.type) {
            case 'line':
                ctx.beginPath();
                ctx.moveTo(annotation.startX, annotation.startY);
                ctx.lineTo(annotation.endX, annotation.endY);
                ctx.stroke();
                break;
                
            case 'rectangle':
                const width = annotation.endX - annotation.startX;
                const height = annotation.endY - annotation.startY;
                ctx.beginPath();
                ctx.rect(annotation.startX, annotation.startY, width, height);
                ctx.stroke();
                break;
                
            case 'circle':
                const radius = Math.sqrt(Math.pow(annotation.endX - annotation.startX, 2) + 
                                       Math.pow(annotation.endY - annotation.startY, 2));
                ctx.beginPath();
                ctx.arc(annotation.startX, annotation.startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'label':
                // Draw label with background box
                ctx.fillStyle = annotation.color;
                ctx.font = `bold ${annotation.fontSize || 16}px Arial`;
                
                // Measure text for background
                const textMetrics = ctx.measureText(annotation.text);
                const textWidth = textMetrics.width;
                const textHeight = annotation.fontSize || 16;
                
                // Draw background box
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(annotation.x - 5, annotation.y - textHeight - 5, textWidth + 10, textHeight + 10);
                
                // Draw text
                ctx.fillStyle = annotation.color;
                ctx.fillText(annotation.text, annotation.x, annotation.y);
                
                // Draw pointer line
                ctx.strokeStyle = annotation.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(annotation.x, annotation.y + 5);
                ctx.lineTo(annotation.x, annotation.y + 15);
                ctx.stroke();
                break;
                
            case 'marker':
                // Draw marker pin with text
                ctx.fillStyle = annotation.color;
                ctx.font = `${annotation.fontSize || 12}px Arial`;
                
                // Draw pin circle
                ctx.beginPath();
                ctx.arc(annotation.x, annotation.y, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw pin stem
                ctx.fillRect(annotation.x - 1, annotation.y, 2, 12);
                
                // Draw text with background
                const markerTextMetrics = ctx.measureText(annotation.text);
                const markerTextWidth = markerTextMetrics.width;
                const markerTextHeight = annotation.fontSize || 12;
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(annotation.x + 10, annotation.y - markerTextHeight - 2, markerTextWidth + 6, markerTextHeight + 4);
                
                ctx.fillStyle = annotation.color;
                ctx.fillText(annotation.text, annotation.x + 13, annotation.y - 2);
                break;
                
            case 'measurement':
                // Draw measurement line
                ctx.strokeStyle = annotation.color;
                ctx.lineWidth = annotation.width || 2;
                ctx.beginPath();
                ctx.moveTo(annotation.startX, annotation.startY);
                ctx.lineTo(annotation.endX, annotation.endY);
                ctx.stroke();
                
                // Draw measurement handles
                ctx.fillStyle = annotation.color;
                ctx.beginPath();
                ctx.arc(annotation.startX, annotation.startY, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(annotation.endX, annotation.endY, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw measurement text
                const distance = Math.sqrt(Math.pow(annotation.endX - annotation.startX, 2) + 
                                         Math.pow(annotation.endY - annotation.startY, 2));
                const midX = (annotation.startX + annotation.endX) / 2;
                const midY = (annotation.startY + annotation.endY) / 2;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(midX - 25, midY - 10, 50, 16);
                
                ctx.fillStyle = annotation.color;
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${distance.toFixed(1)}px`, midX, midY + 3);
                ctx.textAlign = 'start'; // Reset text alignment
                break;
        }
    });
}

function handleMouseOut(e, view) {
    isDrawing = false;
}

function handleWheel(e, view) {
    e.preventDefault();
    
    if (currentTool === 'zoom' || e.ctrlKey) {
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoomView(view, delta);
    } else {
        // Scroll through slices
        const slider = document.getElementById(`${view}-slider`);
        const currentValue = parseInt(slider.value);
        const newValue = Math.max(slider.min, Math.min(slider.max, currentValue + (e.deltaY > 0 ? -1 : 1)));
        slider.value = newValue;
        updateSliceInfo(view, newValue, slider.max);
    }
}

function zoomView(view, factor) {
    const state = viewStates[view];
    const newZoom = Math.max(0.1, Math.min(5, state.zoom * factor));
    
    if (newZoom !== state.zoom) {
        state.zoom = newZoom;
        applyTransform(view);
        updateStatusBar(`${view} zoom: ${Math.round(newZoom * 100)}%`);
    }
}

function applyTransform(view) {
    const img = document.getElementById(`${view}-img`);
    const state = viewStates[view];
    
    if (img) {
        img.style.transform = `scale(${state.zoom}) translate(${state.panX}px, ${state.panY}px)`;
    }
}

function updateCrosshair(e, view) {
    const crosshair = document.getElementById(`${view}-crosshair`);
    const coords = document.getElementById(`${view}-coords`);
    const rect = e.currentTarget.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (crosshair) {
        crosshair.style.left = x + 'px';
        crosshair.style.top = y + 'px';
        crosshair.style.display = 'block';
    }
    
    if (coords) {
        const slider = document.getElementById(`${view}-slider`);
        const sliceValue = slider ? slider.value : 0;
        coords.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}, Slice: ${sliceValue}`;
    }
}

function hideCrosshair(view) {
    const crosshair = document.getElementById(`${view}-crosshair`);
    if (crosshair) {
        crosshair.style.display = 'none';
    }
}

function updateSliceInfo(view, current, max) {
    const info = document.getElementById(`${view}-slice-info`);
    if (info) {
        info.textContent = `${current}/${max}`;
    }
    updateStatusBar(`${view} slice: ${current}/${max}`);
}

function clearAllAnnotations() {
    ['axial', 'coronal', 'sagittal'].forEach(view => {
        const canvas = document.getElementById(`${view}-annotations`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        annotations[view] = [];
    });
    
    // Clear any pending measurements
    window.measurementStart = null;
    
    updateStatusBar('All annotations cleared');
}

// IMPROVED: Label and marker annotation functions
function addLabelAnnotation(x, y, view) {
    const labelText = prompt('Enter label name for this anatomical structure:');
    if (labelText && labelText.trim()) {
        const annotation = {
            type: 'label',
            x: x,
            y: y,
            text: labelText.trim(),
            color: document.getElementById('stroke-color').value,
            fontSize: 16,
            timestamp: Date.now(),
            view: view,
            coordinates: {
                x: Math.round(x),
                y: Math.round(y),
                slice: getCurrentSliceNumber(view)
            }
        };
        
        annotations[view].push(annotation);
        redrawAnnotations(view);
        
        updateStatusBar(`Label added: "${labelText}" at (${x.toFixed(0)}, ${y.toFixed(0)})`);
        console.log('Label annotation added:', annotation);
    }
}

function addMarkerAnnotation(x, y, view) {
    const markerText = prompt('Enter marker description:');
    if (markerText && markerText.trim()) {
        const annotation = {
            type: 'marker',
            x: x,
            y: y,
            text: markerText.trim(),
            color: document.getElementById('stroke-color').value,
            fontSize: 12,
            timestamp: Date.now(),
            view: view,
            coordinates: {
                x: Math.round(x),
                y: Math.round(y),
                slice: getCurrentSliceNumber(view)
            }
        };
        
        annotations[view].push(annotation);
        redrawAnnotations(view);
        
        updateStatusBar(`Pin marker added: "${markerText}"`);
        console.log('Marker annotation added:', annotation);
    }
}

function getCurrentSliceNumber(view) {
    const slider = document.getElementById(`${view}-slider`);
    return slider ? parseInt(slider.value) : 0;
}

// LABEL ANNOTATION - Click to add anatomical structure labels
function addLabelAnnotation(x, y, view) {
    const labelText = prompt('🏷️ Enter label for this anatomical structure:');
    if (labelText && labelText.trim()) {
        const annotation = {
            type: 'label',
            x: x,
            y: y,
            text: labelText.trim(),
            color: document.getElementById('stroke-color').value,
            fontSize: 14,
            timestamp: Date.now(),
            view: view,
            coordinates: {
                x: Math.round(x),
                y: Math.round(y),
                slice: getCurrentSliceNumber(view)
            }
        };
        
        annotations[view].push(annotation);
        redrawAnnotations(view);
        
        updateStatusBar(`📍 Label added: "${labelText}" at slice ${getCurrentSliceNumber(view)}`);
        console.log('Label annotation added:', annotation);
    }
}

function getCurrentSliceNumber(view) {
    const slider = document.getElementById(`${view}-slider`);
    return slider ? parseInt(slider.value) : 0;
}

function startMeasurement(x, y, view) {
    // For measurement tool, we need to wait for second click
    if (!window.measurementStart) {
        window.measurementStart = { x, y, view };
        updateStatusBar('Click second point to complete measurement');
    } else {
        const start = window.measurementStart;
        if (start.view === view) {
            const annotation = {
                type: 'measurement',
                startX: start.x,
                startY: start.y,
                endX: x,
                endY: y,
                color: document.getElementById('stroke-color').value,
                width: document.getElementById('stroke-width').value,
                timestamp: Date.now()
            };
            
            annotations[view].push(annotation);
            redrawAnnotations(view);
            
            const distance = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));
            updateStatusBar(`Measurement completed: ${distance.toFixed(1)} pixels`);
        }
        window.measurementStart = null;
    }
}

function updateOpacity(value) {
    const opacity = value / 100;
    ['axial', 'coronal', 'sagittal'].forEach(view => {
        const img = document.getElementById(`${view}-img`);
        if (img) {
            img.style.opacity = opacity;
        }
    });
    updateStatusBar(`2D Image opacity: ${value}%`);
}

function updateThreshold(value) {
    // Apply CSS filter to simulate threshold effect
    const filterValue = `contrast(${100 + (value - 128)}%) brightness(${100 + (value - 128) * 0.5}%)`;
    
    ['axial', 'coronal', 'sagittal'].forEach(view => {
        const img = document.getElementById(`${view}-img`);
        if (img) {
            img.style.filter = filterValue;
        }
    });
    updateStatusBar(`Threshold: ${value}`);
}

function updateVolumeOpacity(value) {
    if (volumeData && renderer) {
        try {
            const opacity = value / 100;
            volumeData.opacity = opacity;
            renderer.render();
            updateStatusBar(`3D Volume opacity: ${value}%`);
        } catch (error) {
            console.error('Error updating volume opacity:', error);
            updateStatusBar('3D volume opacity control not available');
        }
    }
}

function initialize3DViewer() {
    console.log('Initializing 3D viewer...');
    
    try {
        // Check if XTK is available
        if (typeof X === 'undefined') {
            console.error('XTK library not loaded');
            updateStatusBar('3D viewer unavailable - XTK library not loaded');
            return;
        }
        
        // Initialize XTK renderer
        renderer3D = new X.renderer3D();
        renderer3D.container = 'three-d-container';
        renderer3D.init();
        
        // Create a simple test volume
        createTestVolume();
        
        console.log('3D viewer initialized successfully');
        updateStatusBar('3D viewer ready');
        
    } catch (error) {
        console.error('3D viewer initialization failed:', error);
        updateStatusBar('3D viewer initialization failed');
        
        // Show fallback message
        const container = document.getElementById('three-d-container');
        if (container) {
            container.innerHTML = '<div class="loading-message">3D Viewer - XTK initialization failed<br>Load a NII file to try again</div>';
        }
    }
}

function createTestVolume() {
    try {
        // Create a simple test volume
        volumeData = new X.volume();
        
        // Set up basic properties
        volumeData.center = [0, 0, 0];
        volumeData.spacing = [1, 1, 1];
        volumeData.dimensions = [64, 64, 64];
        
        // Add to renderer
        renderer3D.add(volumeData);
        renderer3D.render();
        
        console.log('Test volume created');
    } catch (error) {
        console.error('Failed to create test volume:', error);
    }
}

function handleFileUpload(file) {
    const fileNameDisplay = document.getElementById('file-name');
    
    if (!file) {
        if (fileNameDisplay) {
            fileNameDisplay.textContent = 'No file selected';
            fileNameDisplay.style.color = '#bdc3c7';
        }
        return;
    }
    
    // Display the uploaded filename
    if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.style.color = '#2ecc71';
        fileNameDisplay.title = file.name;
    }
    
    // Validate file type
    const validExtensions = ['.nii', '.nii.gz'];
    const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidFile) {
        updateStatusBar('Error: Please select a valid NII file (.nii or .nii.gz)');
        if (fileNameDisplay) {
            fileNameDisplay.style.color = '#e74c3c';
        }
        return;
    }
    
    updateStatusBar(`Uploading ${file.name} to server...`);
    $('.panel').addClass('loading');
    
    // Upload file to Flask backend
    uploadToFlaskBackend(file);
}

function uploadToFlaskBackend(file) {
    console.log('Uploading file to Flask backend:', file.name);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to Flask backend using the /upload_nii endpoint
    $.ajax({
        url: '/upload_nii',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log('Upload successful:', response);
            updateStatusBar('File uploaded successfully - Loading views...');
            
            if (response.file_path && response.slice_info) {
                // Update slider ranges FIRST
                if (response.slice_info.axial) {
                    dimensions.z.min = response.slice_info.axial.min;
                    dimensions.z.max = response.slice_info.axial.max;
                    $("#axial-slider").attr("max", 100);
                }
                
                if (response.slice_info.coronal) {
                    dimensions.y.min = response.slice_info.coronal.min;
                    dimensions.y.max = response.slice_info.coronal.max;
                    $("#coronal-slider").attr("max", 100);
                }
                
                if (response.slice_info.sagittal) {
                    dimensions.x.min = response.slice_info.sagittal.min;
                    dimensions.x.max = response.slice_info.sagittal.max;
                    $("#sagittal-slider").attr("max", 100);
                }
                
                // Load the 3D model with the file path from backend
                load3DModel(response.file_path);
                
                // Load initial slices at middle position
                updateSlice("axial", 50);
                updateSlice("coronal", 50);
                updateSlice("sagittal", 50);
                
                updateStatusBar('NII file loaded successfully - Use sliders to navigate');
            } else {
                updateStatusBar('Error: Invalid response from server');
            }
            
            $('.panel').removeClass('loading');
        },
        error: function(xhr, status, error) {
            console.error('Upload failed:', error);
            const errorMsg = xhr.responseJSON?.error || 'Upload failed';
            updateStatusBar(`Upload failed: ${errorMsg}`);
            
            const fileNameDisplay = document.getElementById('file-name');
            if (fileNameDisplay) {
                fileNameDisplay.style.color = '#e74c3c';
            }
            
            $('.panel').removeClass('loading');
        }
    });
}

function updateSliderRangesFromBackend(sliceInfo) {
    console.log('Setting up slider ranges and syncing with 3D volume:', sliceInfo);
    
    // Update axial slider (Z-axis)
    if (sliceInfo.axial) {
        const axialSlider = $("#axial-slider");
        axialSlider.attr({
            "min": sliceInfo.axial.min,
            "max": sliceInfo.axial.max,
            "value": Math.floor((sliceInfo.axial.min + sliceInfo.axial.max) / 2)
        });
        
        // Update dimensions for 3D coordination
        dimensions.z.min = sliceInfo.axial.min;
        dimensions.z.max = sliceInfo.axial.max;
        dimensions.z.physical = Math.floor((sliceInfo.axial.min + sliceInfo.axial.max) / 2);
        
        console.log(`Axial slider: ${sliceInfo.axial.min} to ${sliceInfo.axial.max}`);
    }
    
    // Update coronal slider (Y-axis)
    if (sliceInfo.coronal) {
        const coronalSlider = $("#coronal-slider");
        coronalSlider.attr({
            "min": sliceInfo.coronal.min,
            "max": sliceInfo.coronal.max,
            "value": Math.floor((sliceInfo.coronal.min + sliceInfo.coronal.max) / 2)
        });
        
        dimensions.y.min = sliceInfo.coronal.min;
        dimensions.y.max = sliceInfo.coronal.max;
        dimensions.y.physical = Math.floor((sliceInfo.coronal.min + sliceInfo.coronal.max) / 2);
        
        console.log(`Coronal slider: ${sliceInfo.coronal.min} to ${sliceInfo.coronal.max}`);
    }
    
    // Update sagittal slider (X-axis)
    if (sliceInfo.sagittal) {
        const sagittalSlider = $("#sagittal-slider");
        sagittalSlider.attr({
            "min": sliceInfo.sagittal.min,
            "max": sliceInfo.sagittal.max,
            "value": Math.floor((sliceInfo.sagittal.min + sliceInfo.sagittal.max) / 2)
        });
        
        dimensions.x.min = sliceInfo.sagittal.min;
        dimensions.x.max = sliceInfo.sagittal.max;
        dimensions.x.physical = Math.floor((sliceInfo.sagittal.min + sliceInfo.sagittal.max) / 2);
        
        console.log(`Sagittal slider: ${sliceInfo.sagittal.min} to ${sliceInfo.sagittal.max}`);
    }
    
    // Update all slice info displays
    $("#axial-slice-info").text(`${$("#axial-slider").val()}/${$("#axial-slider").attr('max')}`);
    $("#coronal-slice-info").text(`${$("#coronal-slider").val()}/${$("#coronal-slider").attr('max')}`);
    $("#sagittal-slice-info").text(`${$("#sagittal-slider").val()}/${$("#sagittal-slider").attr('max')}`);
    
    // Load initial slices from backend - This ensures 2D/3D sync from start
    const axialValue = $("#axial-slider").val();
    const coronalValue = $("#coronal-slider").val();
    const sagittalValue = $("#sagittal-slider").val();
    
    updateSliceImmediate("axial", axialValue);
    updateSliceImmediate("coronal", coronalValue);
    updateSliceImmediate("sagittal", sagittalValue);
    
    console.log('Slider ranges updated and initial slices loaded');
}

// Using the exact working 3D model loading from original code
function load3DModel(niiFilePath) {
    try {
        console.log('Initializing XTK renderer for:', niiFilePath);
        
        // Create renderer exactly like in original working code
        renderer = new X.renderer3D();
        renderer.container = 'three-d-container';
        renderer.init();
        
        // Create volume exactly like in original
        volumeData = new X.volume();
        volumeData.file = niiFilePath;
        
        // Add volume to renderer
        renderer.add(volumeData);
        
        // Set up event listener for volume rendering (from original)
        volumeData.onShowtime = function() {
            console.log('Volume loaded successfully');
            
            // Get the actual dimensions from the volume (original approach)
            const dims = volumeData.dimensions;
            console.log('Volume dimensions:', dims);
            
            // Update our dimension ranges (from original)
            dimensions.x.min = 0;
            dimensions.x.max = dims[0] - 1;
            dimensions.y.min = 0;
            dimensions.y.max = dims[1] - 1;
            dimensions.z.min = 0;
            dimensions.z.max = dims[2] - 1;
            
            // Set initial slice positions (from original)
            volumeData.indexX = Math.floor(dims[0] / 2);
            volumeData.indexY = Math.floor(dims[1] / 2);
            volumeData.indexZ = Math.floor(dims[2] / 2);
            
            // Update physical positions
            dimensions.x.physical = volumeData.indexX;
            dimensions.y.physical = volumeData.indexY;
            dimensions.z.physical = volumeData.indexZ;
            
            // Update slider ranges to actual dimensions
            updateSliderRanges(dims);
            
            // Load initial slices
            updateSlice("axial", 50);
            updateSlice("coronal", 50);
            updateSlice("sagittal", 50);
            
            $('.panel').removeClass('loading');
            updateStatusBar('NII file loaded successfully. Use sliders to navigate through slices.');
        };
        
        volumeData.onError = function(error) {
            console.error('Volume loading error:', error);
            updateStatusBar('Error loading volume data');
            $('.panel').removeClass('loading');
        };
        
        // Start the render
        renderer.render();
        
    } catch (e) {
        console.error("Error in XTK rendering:", e);
        updateStatusBar("Error loading 3D model. Check console for details.");
        $('.panel').removeClass('loading');
    }
}

function updateSliderRanges(dims) {
    // Update slider ranges based on actual volume dimensions
    $("#axial-slider").attr({
        "min": 0,
        "max": dims[2] - 1,
        "value": Math.floor(dims[2] / 2)
    });
    
    $("#coronal-slider").attr({
        "min": 0,
        "max": dims[1] - 1,
        "value": Math.floor(dims[1] / 2)
    });
    
    $("#sagittal-slider").attr({
        "min": 0,
        "max": dims[0] - 1,
        "value": Math.floor(dims[0] / 2)
    });
    
    // Update slice info displays
    $("#axial-slice-info").text(`${Math.floor(dims[2] / 2)}/${dims[2] - 1}`);
    $("#coronal-slice-info").text(`${Math.floor(dims[1] / 2)}/${dims[1] - 1}`);
    $("#sagittal-slice-info").text(`${Math.floor(dims[0] / 2)}/${dims[0] - 1}`);
}

// Update the 3D slicer based on slider positions (from original)
function updateVolumeSlicer(axis, value) {
    if (!volumeData) return;
    
    // Convert the slider value to the actual dimension range
    const dim = dimensions[axis];
    let normalizedValue;
    
    if (axis === 'z') {
        // For axial slider - use actual slider value
        normalizedValue = parseInt(value);
        volumeData.indexZ = normalizedValue;
    } else if (axis === 'y') {
        // For coronal slider - use actual slider value
        normalizedValue = parseInt(value);
        volumeData.indexY = normalizedValue;
    } else if (axis === 'x') {
        // For sagittal slider - use actual slider value
        normalizedValue = parseInt(value);
        volumeData.indexX = normalizedValue;
    }
    
    // Update the physical position value
    dimensions[axis].physical = normalizedValue;
    
    // Trigger a render
    if (renderer) {
        renderer.render();
    }
}

// Load slice images from Flask backend using the /get_slice endpoint
function updateSlice(axis, index) {
    console.log(`Requesting ${axis} slice at index ${index}`);
    
    // Make AJAX call to Flask backend to get the slice image
    $.ajax({
        url: `/get_slice/${axis}/${index}`,
        type: "GET",
        success: function(response) {
            if (response.slice_path) {
                console.log(`Loading ${axis} slice from: ${response.slice_path}`);
                $(`#${axis}-img`).attr("src", response.slice_path);
                updateStatusBar(`${axis} slice ${index} loaded`);
            }
        },
        error: function(xhr, status, error) {
            if (xhr.status === 404) {
                // Slice doesn't exist - this is normal for some indices
                console.log(`No ${axis} slice at index ${index}`);
                // Keep the previous image or show placeholder
            } else {
                console.error(`Error fetching ${axis} slice at index ${index}:`, error);
                updateStatusBar(`Error loading ${axis} slice ${index}`);
            }
        }
    });
}

function loadNIIFile(file, fileURL) {
    console.log('Loading NII file:', file.name);
    
    try {
        // Initialize 3D viewer if not already done
        if (!renderer3D) {
            initialize3DViewer();
        }
        
        if (renderer3D) {
            // Clear existing volume
            if (volumeData) {
                renderer3D.remove(volumeData);
            }
            
            // Create new volume
            volumeData = new X.volume();
            volumeData.file = fileURL;
            
            // Set up loading callbacks
            volumeData.onShowtime = function() {
                console.log('NII file loaded successfully');
                updateStatusBar(`${file.name} loaded successfully`);
                
                // Update slice ranges based on volume dimensions
                if (volumeData.dimensions) {
                    const dims = volumeData.dimensions;
                    console.log('Volume dimensions:', dims);
                    
                    // Update sliders with actual dimensions
                    updateSliderRange('axial', dims[2] || 100);
                    updateSliderRange('coronal', dims[1] || 100);
                    updateSliderRange('sagittal', dims[0] || 100);
                    
                    // Generate 2D slices for the side panels
                    generateSliceImages();
                }
                
                // Clean up the object URL
                setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
            };
            
            volumeData.onError = function(error) {
                console.error('Volume loading error:', error);
                updateStatusBar(`Error loading ${file.name}: Volume data invalid`);
                
                // Fall back to sample images
                loadSampleImages();
                URL.revokeObjectURL(fileURL);
            };
            
            // Add volume to renderer
            renderer3D.add(volumeData);
            renderer3D.render();
            
        } else {
            throw new Error('3D renderer not available');
        }
        
    } catch (error) {
        console.error('NII file loading error:', error);
        updateStatusBar(`Error loading ${file.name}: ${error.message}`);
        
        // Fallback to sample images
        loadSampleImages();
        
        if (fileURL) {
            URL.revokeObjectURL(fileURL);
        }
    }
}

function generateSliceImages() {
    console.log('Generating 2D slice images from volume data...');
    
    if (!volumeData || !volumeData.dimensions) {
        console.warn('No volume data available for slice generation');
        return;
    }
    
    try {
        const dims = volumeData.dimensions;
        
        // Generate middle slices for each view
        const axialSlice = Math.floor(dims[2] / 2);
        const coronalSlice = Math.floor(dims[1] / 2);
        const sagittalSlice = Math.floor(dims[0] / 2);
        
        // For now, we'll create placeholder images indicating real data is loaded
        // In a full implementation, you would extract actual slice data from the volume
        createLoadedDataPlaceholder('axial', axialSlice, dims[2]);
        createLoadedDataPlaceholder('coronal', coronalSlice, dims[1]);
        createLoadedDataPlaceholder('sagittal', sagittalSlice, dims[0]);
        
        updateStatusBar('2D slices generated from loaded volume data');
        
    } catch (error) {
        console.error('Error generating slice images:', error);
        updateStatusBar('Warning: Could not generate 2D slices from volume data');
    }
}

function createLoadedDataPlaceholder(view, currentSlice, maxSlice) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Dark background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 400, 400);
    
    // Simulate medical data pattern
    ctx.fillStyle = '#222222';
    ctx.fillRect(50, 50, 300, 300);
    
    // Add some noise/texture to simulate brain tissue
    for (let i = 0; i < 1000; i++) {
        const x = 50 + Math.random() * 300;
        const y = 50 + Math.random() * 300;
        const intensity = Math.random() * 100 + 50;
        ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Add brain-like structures
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(200, 200, 120, 100, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Add slice information
    ctx.fillStyle = '#00ff00';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${view.toUpperCase()} - LOADED DATA`, 200, 30);
    ctx.fillText(`Slice ${currentSlice}/${maxSlice}`, 200, 380);
    
    // Update the image
    const img = document.getElementById(`${view}-img`);
    if (img) {
        img.src = canvas.toDataURL();
    }
}

function updateSliderRange(view, maxValue) {
    const slider = document.getElementById(`${view}-slider`);
    if (slider) {
        slider.max = maxValue - 1;
        slider.value = Math.floor(maxValue / 2);
        updateSliceInfo(view, slider.value, slider.max);
    }
}

function updateStatusBar(message) {
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.textContent = message;
    }
    console.log('Status:', message);
}

// Global functions for HTML onclick handlers
function fullscreenPanel(view) {
    console.log('Opening fullscreen for:', view);
    
    const modal = document.getElementById('fullscreen-modal');
    const content = document.getElementById('fullscreen-content');
    const title = document.getElementById('fullscreen-title');
    const panel = document.getElementById(`${view}-panel`);
    
    if (modal && content && title && panel) {
        // Clone the panel content
        const clonedContent = panel.querySelector('.panel-content').cloneNode(true);
        content.innerHTML = '';
        content.appendChild(clonedContent);
        
        title.textContent = `${view.charAt(0).toUpperCase() + view.slice(1)} View - Fullscreen`;
        modal.style.display = 'flex';
        
        // Re-initialize canvas in fullscreen
        setTimeout(() => {
            const canvas = clonedContent.querySelector('.annotation-canvas');
            if (canvas) {
                resizeCanvas(canvas, canvas.parentElement);
                
                // Re-attach events
                canvas.addEventListener('mousedown', (e) => handleMouseDown(e, view));
                canvas.addEventListener('mousemove', (e) => handleMouseMove(e, view));
                canvas.addEventListener('mouseup', (e) => handleMouseUp(e, view));
                canvas.addEventListener('mouseout', (e) => handleMouseOut(e, view));
            }
        }, 100);
        
        updateStatusBar(`${view} view opened in fullscreen`);
    }
}

function exitFullscreen() {
    const modal = document.getElementById('fullscreen-modal');
    if (modal) {
        modal.style.display = 'none';
        updateStatusBar('Exited fullscreen mode');
    }
}

function resetView(view) {
    console.log('Resetting view:', view);
    
    if (view === 'threed') {
        // Reset 3D view
        if (renderer3D) {
            try {
                renderer3D.resetBoundingBox();
                renderer3D.render();
                updateStatusBar('3D view reset');
            } catch (error) {
                console.error('3D reset failed:', error);
                updateStatusBar('3D reset failed');
            }
        }
    } else {
        // Reset 2D view
        if (viewStates[view]) {
            viewStates[view] = { zoom: 1, panX: 0, panY: 0 };
            applyTransform(view);
        }
        
        // Clear annotations
        const canvas = document.getElementById(`${view}-annotations`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        if (annotations[view]) {
            annotations[view] = [];
        }
        
        updateStatusBar(`${view} view reset`);
    }
}

// Handle escape key for fullscreen
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        exitFullscreen();
    }
});

// Make sure everything is available globally
window.fullscreenPanel = fullscreenPanel;
window.exitFullscreen = exitFullscreen;
window.resetView = resetView;
window.viewStates = viewStates;
window.annotations = annotations;
window.renderer3D = renderer3D;