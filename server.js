  const puppeteer = require('puppeteer');

(async () => {

    let foodUrl = 'https://www.yelp.com/biz/olive-mediterranean-grill-chicago-3?osq=Olive+Mediterranean+Grill';

    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    await page.goto(foodUrl, { waitUntil: 'networkidle2'});

    //await page.click('[aria-label=" Next page "]')
    //debugger;
    //await page.click('a[target=_blank]');
    let data = await page.evaluate(() => {

        let title = document.querySelector('div[class="lemon--div__373c0__1mboc u-space-b1 border-color--default__373c0__2oFDT"] > h1').innerText;
        let amenities = document.querySelector('div[class="lemon--div__373c0__1mboc arrange__373c0__UHqhV gutter-12__373c0__3kguh layout-wrap__373c0__34d4b layout-2-units__373c0__3CiAk border-color--default__373c0__2oFDT"]').innerText;
        
        let reviews = document.querySelector('div[class="lemon--div__373c0__1mboc arrange-unit__373c0__1piwO border-color--default__373c0__2oFDT nowrap__373c0__1_N1j"]').innerText;
        
        return {
            title,
            amenities,
            reviews
        }
    });

console.log(data);

debugger;

await browser.close();
})();