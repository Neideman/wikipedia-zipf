
const path = require('path');

const generated = path.join(__dirname, '..', '..', 'generated');

// the paths of the output and input files
const paths = {
    allFile: path.join(generated, 'articles', 'all.txt'),
    canonFile: path.join(generated, 'articles', 'canon.txt'),
    occurencesFolder: path.join(generated, 'occurences')
};

exports.paths = paths;