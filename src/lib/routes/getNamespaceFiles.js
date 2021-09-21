module.exports = async function(req, res) {
    const namespace = req.params.namespace;
    const dirpath = this.path.join(this.data_dir, namespace);

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