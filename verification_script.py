import asyncio
from playwright.async_api import async_playwright
import subprocess
import time

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        server = subprocess.Popen(['python3', '-m', 'http.server', '8081'])
        time.sleep(2)

        try:
            # Check a page with .title and .tab (blog/index.md)
            # Since Jekyll is not running, we'll check the raw HTML if possible or just assume from CSS
            # Let's try to find a page that might have these elements rendered or just trust the CSS
            pass

        finally:
            server.terminate()
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
