let score = 85;
let grade;

if (score < 0 || score > 100) {
    console.log("Invalid score");
} else {
    switch (Math.floor(score / 10)) {
        case 10:
        case 9:
            grade = "A";
            break;
        case 8:
            grade = "B";
            break;
        case 7:
            grade = "C";
            break;
        case 6:
            grade = "D";
            break;
        default:
            grade = "F";
    }

    let status = score >= 40 ? "Passed" : "Failed";

    console.log("Score:", score);
    console.log("Grade:", grade);
    console.log("Status:", status);
}