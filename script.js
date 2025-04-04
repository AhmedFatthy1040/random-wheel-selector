document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const wheelCanvas = document.getElementById('wheel');
    const ctx = wheelCanvas.getContext('2d');
    const spinBtn = document.getElementById('spin-btn');
    const addBtn = document.getElementById('add-btn');
    const clearBtn = document.getElementById('clear-btn');
    const newItemInput = document.getElementById('new-item');
    const itemsList = document.getElementById('items-list');
    const selectedValue = document.getElementById('selected-value');
    
    // Wheel properties
    let items = [];
    let spinning = false;
    const wheelColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];
    let currentRotation = 0;
    let targetRotation = 0;
    
    // Save to localStorage
    const saveItems = () => {
        localStorage.setItem('wheelItems', JSON.stringify(items));
    };
    
    // Load from localStorage
    const loadItems = () => {
        const savedItems = localStorage.getItem('wheelItems');
        if (savedItems) {
            items = JSON.parse(savedItems);
            renderItemsList();
            drawWheel();
        }
    };
    
    // Draw the wheel
    const drawWheel = () => {
        // Clear canvas
        ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
        
        if (items.length === 0) {
            // Draw empty wheel message
            ctx.fillStyle = '#ddd';
            ctx.beginPath();
            ctx.arc(wheelCanvas.width / 2, wheelCanvas.height / 2, 150, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#555';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Add items to fill the wheel', wheelCanvas.width / 2, wheelCanvas.height / 2);
            return;
        }
        
        // Draw wheel segments
        const centerX = wheelCanvas.width / 2;
        const centerY = wheelCanvas.height / 2;
        const radius = 150;
        const anglePerItem = (2 * Math.PI) / items.length;
        
        for (let i = 0; i < items.length; i++) {
            const startAngle = i * anglePerItem + currentRotation;
            const endAngle = (i + 1) * anglePerItem + currentRotation;
            
            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = wheelColors[i % wheelColors.length];
            ctx.fill();
            ctx.stroke();
            
            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + anglePerItem / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText(items[i], radius - 10, 5);
            ctx.restore();
        }
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
    };
    
    // Animate wheel spinning
    const animateWheel = (timestamp) => {
        if (!spinning) return;
        
        const progress = Math.min((timestamp - startTime) / spinDuration, 1);
        const easedProgress = easeOut(progress);
        
        currentRotation = initialRotation + (targetRotation - initialRotation) * easedProgress;
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animateWheel);
        } else {
            spinning = false;
            determineWinner();
        }
    };
    
    // Easing function for smooth animation
    const easeOut = (t) => {
        return 1 - Math.pow(1 - t, 3);
    };
    
    // Find winner based on final rotation
    const determineWinner = () => {
        if (items.length === 0) return;
        
        const anglePerItem = (2 * Math.PI) / items.length;
        // The spinner is at the top (π/2 from the right horizontal)
        const normalizedRotation = (currentRotation % (2 * Math.PI) + Math.PI / 2) % (2 * Math.PI);
        
        // Determine which segment is at the top
        let winningIndex = items.length - Math.floor(normalizedRotation / anglePerItem) - 1;
        winningIndex = (winningIndex + items.length) % items.length;
        
        // Display the result
        selectedValue.textContent = `Selected: ${items[winningIndex]}`;
        selectedValue.style.color = wheelColors[winningIndex % wheelColors.length];
    };
    
    // Spin the wheel
    let initialRotation = 0;
    let startTime = 0;
    const spinDuration = 3000; // 3 seconds
    
    const spinWheel = () => {
        if (spinning || items.length === 0) return;
        
        spinning = true;
        initialRotation = currentRotation;
        // Spin between 2 and 5 full rotations plus a random offset
        targetRotation = initialRotation + (2 + Math.random() * 3) * 2 * Math.PI;
        startTime = performance.now();
        
        selectedValue.textContent = 'Spinning...';
        selectedValue.style.color = '#333';
        
        requestAnimationFrame(animateWheel);
    };
    
    // Add a new item to the wheel
    const addItem = () => {
        const newItem = newItemInput.value.trim();
        
        if (newItem && !items.includes(newItem)) {
            items.push(newItem);
            newItemInput.value = '';
            saveItems();
            renderItemsList();
            drawWheel();
        }
    };
    
    // Remove an item from the wheel
    const removeItem = (index) => {
        items.splice(index, 1);
        saveItems();
        renderItemsList();
        drawWheel();
    };
    
    // Clear all items
    const clearItems = () => {
        if (confirm('Are you sure you want to remove all items?')) {
            items = [];
            saveItems();
            renderItemsList();
            drawWheel();
            selectedValue.textContent = 'Add some values and spin the wheel!';
            selectedValue.style.color = '#333';
        }
    };
    
    // Render the items list
    const renderItemsList = () => {
        itemsList.innerHTML = '';
        
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item}</span>
                <button class="remove-btn" data-index="${index}">×</button>
            `;
            itemsList.appendChild(li);
        });
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                removeItem(index);
            });
        });
    };
    
    // Event listeners
    spinBtn.addEventListener('click', spinWheel);
    addBtn.addEventListener('click', addItem);
    clearBtn.addEventListener('click', clearItems);
    
    newItemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addItem();
        }
    });
    
    // Initialize
    loadItems();
    drawWheel();
});