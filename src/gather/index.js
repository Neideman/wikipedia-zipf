
const fs = require('fs');
const path = require('path');
const { paths } = require('../config');
const { gatherWords, generateOccurencesList } = require('./util.js');

// get the input file paths from our config
const {
    canonFile,
    occurencesFolder
} = paths;

// load all canon links
const canon = fs.readFileSync(canonFile, 'ascii').split(/\r?\n/).filter(l => l !== '');

console.log(`Loaded ${canon.length} links!`);

(async () => {

    // the number of words to gather
    const n = Number(process.argv[2]);

    if (isNaN(n)) {
        throw new Error('Number of words to gather must be specified.');
    }

    // get array of words
    const words = await gatherWords(canon, n);

    // full path including name of output file
    const occurencesFile = path.join(occurencesFolder, `${n}.txt`);

    // generate and save output file containing occurence counts
    generateOccurencesList(words, occurencesFile);

    console.log('Word frequencies have been saved.');

})();