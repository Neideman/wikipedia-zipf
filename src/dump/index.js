
const { paths } = require('../config');
const { generateList } = require('./scrape');

// get the output file paths from our config
const {
    allFile,
    canonFile
} = paths;

// run scraper with the output file paths specified
generateList(allFile, canonFile);

console.log('Article lists have been saved.');