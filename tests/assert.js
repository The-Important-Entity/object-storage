const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const Reset = "\x1b[0m";

class Assert {
    constructor(){
        this.counter = 1;
        this.passed = 0;
        this.failed = 0;
    }

    assert(info, test_data, expected) {
        if (test_data === expected) {
            this.passed++;
            console.log("Test " + this.counter.toString() + ": " + FgGreen + "Passed" + Reset);
        }
        else {
            this.failed++;
            console.log(FgRed + "----------------------------------------" + Reset);
            console.log("Test " + this.counter.toString() + ": " + FgRed + "Failed" + Reset);
            console.log(info);
            console.log("Expected: " + FgGreen + expected + Reset + ", Received: " + FgRed + test_data + Reset);
            console.log(FgRed + "----------------------------------------" + Reset);
        }
        this.counter++;
    }

    printResults(){
        console.log();
        console.log("Tests Passed: " + this.passed.toString());
        console.log("Tests Failed: " + this.failed.toString());
    }
}
module.exports = Assert;