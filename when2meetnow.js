const puppeteer = require('puppeteer');
const screenshot = 'w2m.png';

//Command Line Argument with --name flag
//Sets the name to default "My Event" if there is no --name flag
//TODO: Use more elegant custom input method
const nameIndex = process.argv.indexOf('--name');
let nameValue;
if (nameIndex > -1) {
  nameValue = process.argv[nameIndex + 1];
}
const eventName = (nameValue || 'My Event');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://when2meet.com/');
    //DOM manipulation instead of page.type(...) because we need to delete pre-existing text
    await page.evaluate((eventName) => {
        document.getElementById('NewEventName').value = eventName;
    }, eventName);
    await page.evaluate(() => {
        //TODO: more robust selection over dates. Currently selects all days in next week

        //MouseDownDate(week,day) and MouseOverDate(week,day)
        //Selects next week (This week is 'week 1')
        //Select Sunday (Day 1)
        MouseDownDate(2,1);
        //Selects the rest of the week as a range to Saturday (Day 7)
        MouseOverDate(2,7);
        MouseUp();
    });
    await Promise.all([
        page.$eval('[action="SaveNewEvent.php"]', form => form.submit()),
        page.waitForNavigation()
    ])
    await page.waitForSelector('#GroupAvailability');
    
    const currentUrl = () => {
        return window.location.href;
    }
    const url = await page.evaluate(currentUrl);

    await page.screenshot({ path: screenshot })
    browser.close()
    console.log('See screenshot: ' + screenshot)
    console.log('URL created at: ' + url);
})();