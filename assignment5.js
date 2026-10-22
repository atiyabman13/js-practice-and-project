function rectangleArea(length = 5, width = 4) {
    return length * width;
}

const calculateArea = (length = 5, width = 4) => {
    return length * width;
};

console.log(
    "Standard Function Area (Default 5x4):",
    rectangleArea()
);

console.log(
    "Arrow Function Area (Custom 10x3):",
    calculateArea(10, 3)
);

function scopeDemo() {
    var functionVar = "I am function-scoped";
    console.log(functionVar);
}

scopeDemo();

if (true) {
    let blockVar = "I am block-scoped";
    console.log(blockVar);
}

try {
    console.log(blockVar);
} catch (error) {
    console.log("Scope Test Error:", error.toString());
}