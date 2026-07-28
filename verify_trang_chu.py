import time
from playwright.sync_api import sync_playwright

def verify_trang_chu():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Desktop - Home Dropdown Open
        print("Starting Desktop Verification (Home Dropdown Open)...")
        context_desktop = browser.new_context(viewport={"width": 1280, "height": 800})
        page_desktop = context_desktop.new_page()

        page_desktop.goto("http://127.0.0.1:4000/")
        page_desktop.wait_for_load_state("networkidle")
        time.sleep(1)

        # Hover over the first dropdown (Trang chủ)
        trang_chu_trigger = page_desktop.locator(".dropdown-trigger").first
        if trang_chu_trigger:
            trang_chu_trigger.hover()
            time.sleep(0.5)
            page_desktop.screenshot(path="verification_trang_chu_desktop.png")
            print("Trang chủ dropdown hover screenshot saved.")

        # Navigate to /contact and capture
        print("Navigating to Contact Page...")
        page_desktop.goto("http://127.0.0.1:4000/contact")
        page_desktop.wait_for_load_state("networkidle")
        time.sleep(1)
        page_desktop.screenshot(path="verification_contact_desktop.png")
        print("Contact page screenshot saved.")

        context_desktop.close()

        # Mobile
        print("Starting Mobile Verification...")
        context_mobile = browser.new_context(
            viewport={"width": 375, "height": 667},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        )
        page_mobile = context_mobile.new_page()

        page_mobile.goto("http://127.0.0.1:4000/")
        page_mobile.wait_for_load_state("networkidle")
        time.sleep(1)

        menu_btn = page_mobile.locator("#menu")
        if menu_btn:
            menu_btn.click()
            time.sleep(0.5)

            # Click the first dropdown (Trang chủ)
            trang_chu_mobile = page_mobile.locator(".dropdown-trigger").first
            if trang_chu_mobile:
                trang_chu_mobile.click()
                time.sleep(0.5)
                page_mobile.screenshot(path="verification_trang_chu_mobile.png")
                print("Trang chủ mobile dropdown click screenshot saved.")

        context_mobile.close()
        browser.close()

if __name__ == "__main__":
    verify_trang_chu()
