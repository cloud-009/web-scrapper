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
                    let content = '';
                    const captured = new Set();

                    while (distance < totalHeight) {
                        const visibleContent = Array.from(element.querySelectorAll('.CodeMirror-line'))
                            .map(el => el.textContent)
                            .filter(line => !captured.has(line));

                        visibleContent.forEach(line => captured.add(line));
                        content += visibleContent.join('\n') + '\n';

                        editor.scrollBy(0, 100);
                        distance += 100;
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                    return content;
                }
            }, selector);
        }

        const htmlCode = await slowScrollAndCapture('#box-html .CodeMirror-code');
        const cssCode = await slowScrollAndCapture('#box-css .CodeMirror-code');

        const htmlFileName = generateFileName('code', 'html');
        const cssFileName = generateFileName('code', 'css');

        if (!fs.existsSync('code')) {
            fs.mkdirSync('code');
        }

        fs.writeFileSync(path.join('code', htmlFileName), htmlCode);
        fs.writeFileSync(path.join('code', cssFileName), cssCode);

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
    while (fs.existsSync(path.join('code', fileName))) {
        count++;
        fileName = `${prefix}${count}.${ext}`;
    }
    return fileName;
};

const url = 'https://codepen.io/shadowstack/pen/wWQGzj';

scrapeCodePen(url);
