module.exports = async function(req, res) {
    const namespace = req.params.namespace;
    const dirpath = this.path.join(this.data_dir, namespace);

    if (!this.test_name.test(namespace)) {
        res.status(400).send("Error: bad namespace name");
        return;
    }

    // if (!fs.existsSync(dirpath)){
    //     res.status(400).send("Error: namespace doesn't exist");
    //     return;
    // }

    this.fs.readdir(dirpath, function (err, files) {
        //handling error
        if (err) {
            res.status(400).send("Error: namespace doesn't exist");
            return;
        } 
        //listing all files using forEach
        res.status(200).send(files);
        return;
    });
}