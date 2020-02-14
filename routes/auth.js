const utils = require("utils");

var apiAuthed = utils.db.read().get("apiAuthed").cloneDeep().value();

setInterval(() => {
    apiAuthed = utils.db.read().get("apiAuthed").cloneDeep().value();
}, 3000)

module.exports = async (req, res) => {
    if(apiAuthed) {
        if (!req.session || !req.session.user) {
            console.log(`access denied[${req.path}]`);
            throw new Error('access denied');
        }
    }
};