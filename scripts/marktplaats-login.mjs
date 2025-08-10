import puppeteer from 'puppeteer';

const EMAIL = process.env.MARKTPLAATS_EMAIL;
const PASSWORD = process.env.MARKTPLAATS_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Please set MARKTPLAATS_EMAIL and MARKTPLAATS_PASSWORD environment variables.');
  process.exit(1);
}

async function login() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
    ignoreHTTPSErrors: true
  });
  const page = await browser.newPage();
  await page.goto('https://www.marktplaats.nl/', { waitUntil: 'networkidle2' });

  // Accept cookie banner if present
  try {
    await page.waitForSelector('button#gdpr-consent-banner-accept', { timeout: 5000 });
    await page.click('button#gdpr-consent-banner-accept');
  } catch (err) {
    // Cookie banner did not appear
  }

  // Navigate to login page
  await page.goto('https://www.marktplaats.nl/identity/v2/login?target=', { waitUntil: 'networkidle2' });

  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', EMAIL);
  await page.type('input[type="password"]', PASSWORD);

  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('Login attempt completed');
  await browser.close();
}

login().catch(err => {
  console.error(err);
  process.exit(1);
});
