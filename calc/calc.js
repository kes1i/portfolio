const display = document.getElementById('display');

let currentExpression = '';
let lastResult = '';
let lastOperator = '';

//basic functions
function addToDisplay(value) {
   
    if (isOperator(value)) {
        if (currentExpression === '' && value !== '-') {
            return; // prevent other operatos at front
        }
        
        // Check if last character is an operator and replace it
        if (isOperator(currentExpression[currentExpression.length - 1])) {
            currentExpression = currentExpression.slice(0, -1);
        }
        
        currentExpression += value;
        updateDisplay();
        return; // Exit the function after handling the operator
    }

    // handle decimal point
    if (value === '.') {
        const numbers = currentExpression.split(/[\+\-\*\/]/);
        const lastNumber = numbers[numbers.length - 1];
        if (lastNumber.includes('.')) {
            return; // prevent multiple decimal points in a number
        }
    }

    currentExpression += value;
    updateDisplay();
}

// clear
function clearDisplay() {
    currentExpression = '';
    lastResult = '';
    lastOperator = '';
    updateDisplay();
}

// delete
function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

// result
function calculate() {
    try {
        if (currentExpression) {
            
            const result = evaluateExpression(currentExpression);
            
            // Format the result
            if (Number.isFinite(result)) {
                lastResult = result;
                currentExpression = formatResult(result);
                updateDisplay();
            } else {
                throw new Error('Invalid calculation');
            }
        }
    } catch (error) {
        currentExpression = 'Error';
        updateDisplay();
        setTimeout(() => {
            clearDisplay();
        }, 1500);
    }
}


function isOperator(char) {
    return ['+', '-', '*', '/', '%'].includes(char);
}

function evaluateExpression(expr) {
    
    return new Function('return ' + expr)();
}

function formatResult(number) {
    
    if (Number.isInteger(number)) {
        return number.toString();
    }
    
 
    const stringNumber = number.toString();
    if (stringNumber.includes('e')) {
        
        return Number(number).toFixed(8);
    }
    
    return parseFloat(number.toFixed(8)).toString();
}

function updateDisplay() {
    display.value = currentExpression;
}


document.addEventListener('keydown', (event) => {
    const key = event.key;
    
  
    if (/[\d\+\-\*\/\.\(\)]/.test(key)) {
        addToDisplay(key);
    }
    else if (key === 'Enter' || key === '=') {
        calculate();
    }
    else if (key === 'Escape') {
        clearDisplay();
    }
    else if (key === 'Backspace') {
        backspace();
    }
    
    
    if (key === 'Enter' || key === 'Backspace' || /[\d\+\-\*\/\.\(\)]/.test(key)) {
        event.preventDefault();
    }
});

//invalid expressions handling
window.onerror = function() {
    clearDisplay();
    display.value = 'Error';
    return true;
};