# Web scraper to scrape the codepens.
Scrape the codepen website contents (html & css).

## How to run ?
1. Clone the repository using `git clone https://github.com/cloud-009/web-scrapper.git`.
2. Install the dependencies using `npm install`.
3. Provide the codepen url inside the script.

```javascript
const url = 'provide/codepen/url';

scrapeCodePen(url);
```

4. Run the script using `node scrapper.js`.

## Output
The **scrapper** script generates the html and css code, and adds it into the `code/code1.html` && `code/code1.css` files.
As of now the content is being scraped, but the content is being skipped little bit, working on the same issue
