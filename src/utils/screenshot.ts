import puppeteer from 'puppeteer';

export async function takeUserProfileScreenshot(instagramUrl: string, instagramHandle: string): Promise<string> {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(instagramUrl);
        await page.setViewport({ width: 1920, height: 1080 });
        await page.screenshot({ path: `./img/screenshot_${instagramHandle}.png` });
        await browser.close();
        console.log(`Screenshot for ${instagramHandle} saved successfully.`);
        return `./img/screenshot_${instagramHandle}.png`;
    } catch (error) {
        console.error(`Failed to take screenshot for ${instagramHandle}: ${error}`);
        throw error;
    }
}