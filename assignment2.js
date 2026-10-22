let billInput = prompt("Enter your bill amount:");
let tipInput = prompt("Enter tip percentage:");

let bill = Number(billInput);
let percentage = Number(tipInput);

if (
    billInput === null ||
    tipInput === null ||
    billInput.trim() === "" ||
    tipInput.trim() === "" ||
    !Number.isFinite(bill) ||
    !Number.isFinite(percentage) ||
    bill < 0 ||
    percentage < 0
) {
    console.log("Invalid input");
} else {
    let tip = bill * percentage / 100;
    let total = bill;
    total += tip;

    console.log("Subtotal: $" + bill);
    console.log("Tip Percentage: " + percentage + "%");
    console.log("Calculated Tip: $" + tip);
    console.log("Total Amount to Pay: $" + total);
}