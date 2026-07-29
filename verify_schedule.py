import time
from playwright.sync_api import sync_playwright

def verify_schedule():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ---------------- DESKTOP ----------------
        print("Starting Desktop Verification...")
        context_desktop = browser.new_context(viewport={"width": 1280, "height": 850})
        page_desktop = context_desktop.new_page()

        # Navigate to the schedule page
        page_desktop.goto("http://127.0.0.1:4000/schedule")
        # Wait for the network idle and a small delay for API and content rendering
        page_desktop.wait_for_load_state("networkidle")
        time.sleep(3) # Ensure Google API fetch is finished and calendar is loaded

        # Take desktop calendar screenshot
        page_desktop.screenshot(path="verification_schedule_desktop_calendar.png")
        print("Saved desktop calendar view.")

        # Let's find an event icon to click in calendar view
        # The icon has an img element that opens the modal
        event_icon = page_desktop.locator(".event-icon img").first
        if event_icon.count() > 0:
            print("Found event icon, opening modal...")
            event_icon.click()
            time.sleep(1) # wait for modal animations
            page_desktop.screenshot(path="verification_schedule_desktop_modal.png")
            print("Saved desktop modal view.")

            # Close the modal
            close_btn = page_desktop.locator(".cc-modal-close").first
            if close_btn.count() > 0:
                close_btn.click()
                time.sleep(0.5)
        else:
            print("No event icons found in calendar view (maybe no events this month or load error).")

        context_desktop.close()

        # ---------------- MOBILE ----------------
        print("Starting Mobile Verification...")
        context_mobile = browser.new_context(
            viewport={"width": 375, "height": 667},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        )
        page_mobile = context_mobile.new_page()

        page_mobile.goto("http://127.0.0.1:4000/schedule")
        page_mobile.wait_for_load_state("networkidle")
        time.sleep(3) # wait for API and cards load

        # Take mobile list screenshot
        page_mobile.screenshot(path="verification_schedule_mobile_list.png")
        print("Saved mobile list view.")

        # Let's find a card in list view to click and open modal
        event_card = page_mobile.locator(".event-list-card").first
        if event_card.count() > 0:
            print("Found event card, opening modal...")
            event_card.click()
            time.sleep(1)
            page_mobile.screenshot(path="verification_schedule_mobile_modal.png")
            print("Saved mobile modal view.")
        else:
            print("No event cards found in list view.")

        context_mobile.close()
        browser.close()

if __name__ == "__main__":
    verify_schedule()
