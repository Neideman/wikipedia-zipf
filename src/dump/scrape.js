
const axios = require('axios');
const fs = require('fs');

const patterns = {
    ARTICLES: /<li(?: class="allpagesredirect")?><a href="\/wiki\/([^"]+)"( class="mw-redirect")? title="[^"]+">/g,
    NEXT: /<a href="\/w\/index.php\?title=Special:AllPages&amp;from=([^"]+)" title="Special:AllPages">Next page/
};

async function getPage (from, attempts = 0) {

    console.log(`Loading page starting with: ${from}`);

    const url = `https://en.wikipedia.org/w/index.php?title=Special:AllPages&from=${from}`;
    
    try {
        
        var response = await axios(url, { timeout: 2_000 });

    } catch (e) {

        if (attempts === 3) {

            // after three failed attempts give up and throw
            throw e;

        } else {

            // try again up to three times
            console.log(`Trying again due to failed fetch: ${e}`);

            return new Promise(resolve => {

                setTimeout(async () => {

                    const result = await getPage(from, attempts + 1);

                    resolve(result);

                }, 5_000);
                
            });

        }

    }

    return response.data;

}

async function generateList (allFile, canonFile) {

    // create the output files
    fs.writeFileSync(allFile, '');
    fs.writeFileSync(canonFile, '');

    // get the first page
    let page = await getPage('');

    // prevents empty lines
    let allPrefix = '';
    let canonPrefix = '';
    
    while (true) {

        // create an array from the iterator
        const articles = [...page.matchAll(patterns.ARTICLES)];

        // get all links on the page
        const all = articles.map(a => a[1]);

        // get only the links that do not redirect
        const canon = articles.filter(a => !a[2]).map(a => a[1]);

        // get the "first item of next page" text
        const next = page.match(patterns.NEXT);

        if (all.length !== 0) {

            // append links to "all" list output file
            fs.appendFileSync(allFile, allPrefix + all.join('\n'));
            allPrefix = '\n';

            if (canon.length !== 0) {

                // append links to "canon" list output file
                fs.appendFileSync(canonFile, canonPrefix + canon.join('\n'));
                canonPrefix = '\n';
    
            }

        }
        
        if (next === null) {

            // there is no next page, we are done
            console.log('Scraped all pages!');
            return;

        } else {

            // load the next page
            page = await getPage(next[1]);

        }

    }
}

exports.generateList = generateList;