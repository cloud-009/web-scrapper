const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeCodePen(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    try {
        await page.waitForSelector('#box-html .CodeMirror-code', { timeout: 60000 });
        await page.waitForSelector('#box-css .CodeMirror-code', { timeout: 60000 });

        async function slowScrollAndCapture(selector) {
            return await page.evaluate(async (sel) => {
                const element = document.querySelector(sel);
                const editor = element.closest('.CodeMirror-scroll');
                if (editor) {
                    const totalHeight = editor.scrollHeight;
                    let distance = 0;
                    let content = [];

                    while (distance < totalHeight) {
                        editor.scrollBy(0, 100);
                        distance += 100;
                        await new Promise(resolve => setTimeout(resolve, 200));

                        // Capture the content after each scroll
                        const elements = document.querySelectorAll(sel + ' .CodeMirror-line');
                        const currentContent = Array.from(elements).map(el => el.textContent);
                        content = content.concat(currentContent);
                    }
                    return content.join('\n');
                }
            }, selector);
        }

        const htmlCode = await slowScrollAndCapture('#box-html .CodeMirror-code');
        const cssCode = await slowScrollAndCapture('#box-css .CodeMirror-code');

        console.log('HTML Code:', htmlCode);
        console.log('CSS Code:', cssCode);

        const htmlFileName = generateFileName('code', 'html');
        const cssFileName = generateFileName('code', 'css');

        fs.writeFileSync(`code/${htmlFileName}`, htmlCode);
        fs.writeFileSync(`code/${cssFileName}`, cssCode);

        console.log(`HTML saved to ${htmlFileName}`);
        console.log(`CSS saved to ${cssFileName}`);

    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        console.log('Closing the browser...');
        await browser.close();
    }
}

const generateFileName = (prefix, ext) => {
    let count = 1;
    let fileName = `${prefix}${count}.${ext}`;
    while (fs.existsSync(path.join(__dirname, fileName))) {
        count++;
        fileName = `${prefix}${count}.${ext}`;
    }
    return fileName;
};

const url = '';

scrapeCodePen(url);