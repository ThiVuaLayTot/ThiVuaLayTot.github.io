import time
from playwright.sync_api import sync_playwright

def verify_nav():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 850})
        page = context.new_page()

        page.goto("http://127.0.0.1:4000/schedule.html")
        page.wait_for_load_state("networkidle")
        time.sleep(3) # Wait for page load

        # Take initial screenshot
        page.screenshot(path="verification_july_2026.png")
        print("Saved July 2026 screenshot")

        # Click next month button
        next_btn = page.locator("#btn-next-month")
        next_btn.click()
        time.sleep(1)
        page.screenshot(path="verification_august_2026.png")
        print("Saved August 2026 screenshot after clicking next month")

        # Click prev month button to go back to July, then to June
        prev_btn = page.locator("#btn-prev-month")
        prev_btn.click() # Back to July
        time.sleep(0.5)
        prev_btn.click() # To June
        time.sleep(1)
        page.screenshot(path="verification_june_2026.png")
        print("Saved June 2026 screenshot after clicking prev month twice")

        browser.close()

if __name__ == "__main__":
    verify_nav()
