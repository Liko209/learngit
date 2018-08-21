const puppeteer = require('puppeteer')
// jest.setTimeout(1000000);

async function setup (page) {
  await page.goto('https://demo-develop.fiji.gliprc.com/login')
  await page.select('select', 'Chris_sandbox')
  await page.goto('https://demo-develop.fiji.gliprc.com/login')
  await page.click('input[name=username]')
  await page.type('input[name=username]', '18662032065')
  await page.click('input[name=password]')
  await page.type('input[name=password]', 'Test!123')
  await page.click('button')
  await page.waitForSelector('.Resizer')
}

function getMB (bytes) {
  return bytes / 1024 / 1024
}

;(async () => {
  const browser = await puppeteer.launch({
    args: ['--enable-precise-memory-info', '--no-sandbox'],
    headless: false,
    ignoreHTTPSErrors: true
  })
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(60 * 1000)
  const client = await page.target().createCDPSession()
  await client.send('Performance.enable')
  await setup(page)
  // let performance = await page.metrics();
  const {
    usedSize: firstUsedSize,
    totalSize: firstTotalSize
  } = await client.send('Runtime.getHeapUsage')
  console.log(
    `First login usedMemory = ${firstUsedSize} && FirstTotalSize = ${firstTotalSize}`
  )
  await page.reload({
    waitUntil: 'load'
  })
  await page.waitFor(2 * 1000)
  const {
    usedSize: reloadUsedSize,
    totalSize: reloadTotalSize
  } = await client.send('Runtime.getHeapUsage')
  console.log(
    `Refresh loading usedMmory = ${reloadUsedSize} && TotalSize = ${reloadTotalSize}`
  )
  const otherPage = await browser.newPage()
  await otherPage.goto('http://www.google.com')
  await otherPage.waitForSelector('#main')

  const { usedSize: tabUsedSize, totalSize: tabTotalSize } = await client.send(
    'Runtime.getHeapUsage'
  )
  console.log(
    `Switch tab usedSize = ${tabUsedSize} && totalSize = ${tabTotalSize}`
  )
  await otherPage.close()
  // console.log(otherPage, '------otherPage');
  // console.log(await browser.pages());

  if (getMB(tabTotalSize) < 100) {
    console.error('Memory error')
    process.exit(1)
  }
  await browser.close()
})()
