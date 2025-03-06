let grid = [];
let width = 64;
let height = 64;

// Initialize the grid when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createGrid();
});

function createGrid() {
    const table = document.getElementById('grid');
    table.innerHTML = '';
    grid = [];

    // Create the grid array
    for (let y = 0; y < height; y++) {
        const row = [];
        const tableRow = document.createElement('tr');
        
        for (let x = 0; x < width; x++) {
            const cell = document.createElement('td');
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // Only add click listeners to the first row
            if (y === 0) {
                cell.addEventListener('click', () => toggleCell(x, y));
            }
            
            tableRow.appendChild(cell);
            row.push(false); // false = dead, true = alive
        }
        
        table.appendChild(tableRow);
        grid.push(row);
    }

    // Calculate and apply scaling if needed
    adjustGridScale();
}

function adjustGridScale() {
    const table = document.getElementById('grid');
    const container = document.querySelector('.grid-container');
    
    // Reset transform to calculate true size
    table.style.transform = 'scale(1)';
    
    const tableWidth = table.offsetWidth;
    const tableHeight = table.offsetHeight;
    const containerWidth = container.clientWidth - 40; // Account for padding
    const containerHeight = container.clientHeight - 40;
    
    // Calculate scale factors
    const scaleX = containerWidth / tableWidth;
    const scaleY = containerHeight / tableHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    
    if (scale < 1) {
        table.style.transform = `scale(${scale})`;
    }
}

// Add window resize handler
window.addEventListener('resize', adjustGridScale);

function toggleCell(x, y) {
    if (y !== 0) return; // Only first row cells can be toggled
    
    grid[y][x] = !grid[y][x];
    const cell = document.querySelector(`td[data-x="${x}"][data-y="${y}"]`);
    cell.classList.toggle('alive');
}

function updateGridSize() {
    width = parseInt(document.getElementById('gridWidth').value) || 64;
    height = parseInt(document.getElementById('gridHeight').value) || 64;
    
    // Enforce reasonable limits
    width = Math.min(Math.max(width, 1), 2048);
    height = Math.min(Math.max(height, 1), 2048);
    
    // Show warning for large grids
    const warning = document.getElementById('sizeWarning');
    if (width > 256 || height > 256) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
    
    createGrid();
}

function getParents(x, y) {
    if (y === 0) return []; // First row has no parents
    
    const parents = [];
    
    // Parent directly above
    parents.push({ x: x, y: y - 1 });
    
    // Left diagonal parent (if not at left edge)
    if (x > 0) {
        parents.push({ x: x - 1, y: y - 1 });
    }
    
    // Right diagonal parent (if not at right edge)
    if (x < width - 1) {
        parents.push({ x: x + 1, y: y - 1 });
    }
    
    return parents;
}

function countLiveParents(x, y) {
    return getParents(x, y)
        .filter(parent => grid[parent.y][parent.x])
        .length;
}

function getNewState(x, y) {
    if (y === 0) return grid[y][x]; // First row doesn't change
    
    const liveParents = countLiveParents(x, y);
    const rule = document.getElementById(`rule${liveParents}`).value;
    
    switch (rule) {
        case 'alive':
            return true;
        case 'dead':
            return false;
        case 'nochange':
            // Match the cell directly above
            return grid[y-1][x];
        default:
            return false;
    }
}

function generate() {
    // Disable the generate button during animation
    const generateBtn = document.querySelector('button[onclick="generate()"]');
    generateBtn.disabled = true;

    let currentRow = 1; // Start from row 1 (row 0 is the input row)

    function generateRow() {
        if (currentRow >= height) {
            // Re-enable the generate button when done
            generateBtn.disabled = false;
            return;
        }

        // Generate the current row
        for (let x = 0; x < width; x++) {
            grid[currentRow][x] = getNewState(x, currentRow);
            const cell = document.querySelector(`td[data-x="${x}"][data-y="${currentRow}"]`);
            cell.classList.toggle('alive', grid[currentRow][x]);
        }

        currentRow++;
        // Schedule the next row
        requestAnimationFrame(generateRow);
    }

    // Start the generation
    requestAnimationFrame(generateRow);
}

function reset() {
    // Clear all cells except first row
    for (let y = 1; y < height; y++) {
        for (let x = 0; x < width; x++) {
            grid[y][x] = false;
            const cell = document.querySelector(`td[data-x="${x}"][data-y="${y}"]`);
            cell.classList.remove('alive');
        }
    }
}

// Preset pattern functions
function clearFirstRow() {
    // Clear just the first row
    for (let x = 0; x < width; x++) {
        grid[0][x] = false;
        const cell = document.querySelector(`td[data-x="${x}"][data-y="0"]`);
        cell.classList.remove('alive');
    }
}

function setFirstRowCell(x, alive) {
    grid[0][x] = alive;
    const cell = document.querySelector(`td[data-x="${x}"][data-y="0"]`);
    if (alive) {
        cell.classList.add('alive');
    } else {
        cell.classList.remove('alive');
    }
}

function setEveryN() {
    const n = parseInt(document.getElementById('everyN').value) || 3;
    if (n < 1) return;
    
    clearFirstRow();
    for (let x = 0; x < width; x++) {
        if ((x + 1) % n === 0) {
            setFirstRowCell(x, true);
        }
    }
}

function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function setPrimes() {
    clearFirstRow();
    for (let x = 0; x < width; x++) {
        if (isPrime(x + 1)) { // Add 1 since we want to start counting from 1
            setFirstRowCell(x, true);
        }
    }
}

function fibonacci(n) {
    const fib = new Set();
    let a = 1, b = 1;
    while (a <= n) {
        fib.add(a);
        [a, b] = [b, a + b];
    }
    return fib;
}

function setFibonacci() {
    clearFirstRow();
    const fibNumbers = fibonacci(width);
    for (let x = 0; x < width; x++) {
        if (fibNumbers.has(x + 1)) {
            setFirstRowCell(x, true);
        }
    }
}

function setSquares() {
    clearFirstRow();
    const squares = new Set();
    let i = 1;
    while (i * i <= width) {
        squares.add(i * i);
        i++;
    }
    
    for (let x = 0; x < width; x++) {
        if (squares.has(x + 1)) {
            setFirstRowCell(x, true);
        }
    }
}

function setPowerOfTwo() {
    clearFirstRow();
    const powers = new Set();
    let power = 1;
    while (power <= width) {
        powers.add(power);
        power *= 2;
    }
    
    for (let x = 0; x < width; x++) {
        if (powers.has(x + 1)) {
            setFirstRowCell(x, true);
        }
    }
}
