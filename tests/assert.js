

class Assert {
    constructor(){
        this.counter = 1;
        this.passed = 0;
        this.failed = 0;
    }

    assert(test_data, expected) {
        if (test_data === expected) {
            this.passed++;
            console.log("Test " + this.counter.toString() + ": Passed");
        }
        else {
            this.failed++;
            console.log("-------------");
            console.log("Test " + this.counter.toString() + ": Failed");
            console.log("Expected: " + expected + ", Received: " + test_data);
            console.log("-------------");
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