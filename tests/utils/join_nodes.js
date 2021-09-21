const axios = require("axios");

const join_all = async function(num_nodes){
    
    for (var i = 1; i < num_nodes; i++) {
        try {
            await axios.post("http://localhost:300" + i.toString() + "/join", {
                "url": "http://localhost:3000"
            });
        }
        catch {
            
        }
    }

}
module.exports = join_all;