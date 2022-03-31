
const axios = require('axios');
const fs = require('fs');

const patterns = {
    HTML_TAGS: /<[^>]+>/g,
    WORDS: /[ (]([A-Za-z0-9']+)[ ).,:;]/g,
};

// modified implementation of fisher-yates shuffle 
function sampleArray (arr, n) {

    let len = arr.length;

    if (n > len) {
        
        throw new RangeError('Sample size cannot exceed length of array.');

    }

    let taken = new Array(len);
    let result = new Array(n);

    let i;

    while (n--) {

        i = Math.floor(Math.random() * len);
        result[n] = arr[i in taken ? taken[i] : i];
        taken[i] = --len in taken ? taken[len] : len;

    }

    return result;

}

async function downloadArticle (link, attempts = 0) {

    console.log(`Downloading article: ${link}`);

    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&titles=${link}`;
    
    try {
        
        var response = await axios(url, { timeout: 10_000 });

    } catch (e) {

        if (attempts === 3) {

            // after three failed attempts give up and throw
            throw e;

        } else {

            // try again up to three times
            console.log(`Trying again due to failed fetch: ${e}`);

            return new Promise(resolve => {

                setTimeout(async () => {

                    const result = await downloadArticle(link, attempts + 1);

                    resolve(result);

                }, 5_000);
                
            });

        }

    }

    const page = Object.values(response.data.query.pages)[0];

    return page.extract ?? '';

}

function extractWords (text) {

    // remove all text within html tags
    const cleaned = text.replace(patterns.HTML_TAGS, '');

    const words = [...cleaned.matchAll(patterns.WORDS)];

    // make all words lowercase
    return words.map(w => w[1].toLowerCase());

}

async function gatherWords (links, n) {

    const result = [];

    while (true) {

        console.log(`Gathering words: ${result.length}/${n}`);

        // get a random link
        const index = [Math.floor(Math.random() * links.length)];
        const link = links.splice(index, 1);

        // download article and extract words
        const article = await downloadArticle(link);
        const words = extractWords(article);

        // if article has more words than the missing amount...
        if (result.length + words.length > n) {

            // ...randomize remaining words
            const sample = sampleArray(words, n - result.length);
            result.push(...sample);

            console.log('Finished gathering words!');

            return result;

        }

        // otherwise add all words and keep going
        result.push(...words);

    }

}

function generateOccurencesList (words, occurencesFile) {

    // to avoid problems with inheritance we use a null prototype here
    // https://2ality.com/2012/01/objects-as-maps.html
    const occurences = Object.create(null);

    // count occurences
    words.forEach(word => {

        if (occurences[word] === undefined) {

            occurences[word] = 1;

        } else {

            occurences[word] += 1;

        }

    });

    // format result
    const result = Object.entries(occurences)
        .sort((a, b) => b[1] - a[1])
        .map(entry => `${entry[0]}:${entry[1]}`);

    // save to disk
    fs.writeFileSync(occurencesFile, result.join('\n'));

}

exports.gatherWords = gatherWords;
exports.generateOccurencesList = generateOccurencesList;