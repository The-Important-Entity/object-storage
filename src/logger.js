const fs = require("fs");
const path = require("path");
class Logger {
    constructor(lock_log_dir){
        this.lock_log_dir = lock_log_dir;

        this.lock_log_id = this.get_log_id();
        this.lock_log_counter = 0;
    }

    get_log_id() {
        const files = fs.readdirSync(this.lock_log_dir)
        return files.length;
    }

    log_lock(key) {
        fs.appendFileSync(path.join(this.lock_log_dir, this.lock_log_id.toString()), "Locking key: " + key + "\n", function(err){

        });
        this.lock_log_counter++;
    }

    log_unlock(key) {
        fs.appendFileSync(path.join(this.lock_log_dir, this.lock_log_id.toString()), "Unlocking key: " + key + "\n", function(err){
            
        });
        this.lock_log_counter++;

        if (this.lock_log_counter > 1000) {
            this.lock_log_id++;
            this.lock_log_counter = 0;
        }
    }

    info(msg) {
        console.log(msg);
    }
}

fs.rmdirSync("C:\\Users\\Joe\\Desktop\\Code\\object-storage\\data\\lock_log", { recursive: true });
fs.mkdirSync("C:\\Users\\Joe\\Desktop\\Code\\object-storage\\data\\lock_log");
const logger1 = new Logger("C:\\Users\\Joe\\Desktop\\Code\\object-storage\\data\\lock_log");

var start = Date.now();
for (var i = 0; i < 20000; i++){
    logger1.log_lock("temp.txt");
    logger1.log_unlock("temp.txt");
}
var end = Date.now();
console.log(end - start);
