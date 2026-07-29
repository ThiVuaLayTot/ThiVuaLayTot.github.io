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
        page_desktop.goto("http://127.0.0.1:4000/schedule.html")
        page_desktop.wait_for_load_state("networkidle")
        time.sleep(3) # Ensure Google API fetch is finished and calendar is loaded

        # Wait for the dropdown button to be visible
        dropdown_btn = page_desktop.locator(".tour-dropdown-btn").first
        dropdown_btn.wait_for(state="visible", timeout=10000)

        print("Opening Thể loại dropdown on Desktop...")
        dropdown_btn.click()
        time.sleep(0.5)
        page_desktop.screenshot(path="verification_schedule_desktop_calendar.png")
        print("Saved desktop calendar view with open dropdown.")

        # Click again to close it
        dropdown_btn.click()
        time.sleep(0.3)

        # Let's see if we have event icons in calendar
        event_icon = page_desktop.locator(".event-icon img").first
        if event_icon.is_visible():
            print("Found event icon, opening modal...")
            event_icon.click()
            time.sleep(1) # wait for modal animations
            page_desktop.screenshot(path="verification_schedule_desktop_modal.png")
            print("Saved desktop modal view.")

            # Close the modal
            close_btn = page_desktop.locator(".cc-modal-close").first
            if close_btn.is_visible():
                close_btn.click()
                time.sleep(0.5)
        else:
            print("No event icons visible in calendar view.")

        context_desktop.close()

        # ---------------- MOBILE ----------------
        print("Starting Mobile Verification...")
        context_mobile = browser.new_context(
            viewport={"width": 375, "height": 667},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        )
        page_mobile = context_mobile.new_page()

        page_mobile.goto("http://127.0.0.1:4000/schedule.html")
        page_mobile.wait_for_load_state("networkidle")
        time.sleep(3) # wait for API and cards load

        mob_dropdown_btn = page_mobile.locator(".tour-dropdown-btn").first
        mob_dropdown_btn.wait_for(state="visible", timeout=10000)

        print("Opening Thể loại dropdown on Mobile...")
        mob_dropdown_btn.click()
        time.sleep(0.5)
        page_mobile.screenshot(path="verification_schedule_mobile_list.png")
        print("Saved mobile list view with open dropdown.")

        # Close it
        mob_dropdown_btn.click()
        time.sleep(0.3)

        # Let's find a card in list view to click and open modal
        event_card = page_mobile.locator(".event-list-card").first
        if event_card.is_visible():
            print("Found event card, opening modal...")
            event_card.click()
            time.sleep(1)
            page_mobile.screenshot(path="verification_schedule_mobile_modal.png")
            print("Saved mobile modal view.")
        else:
            print("No event cards visible in list view.")

        context_mobile.close()
        browser.close()

if __name__ == "__main__":
    verify_schedule()
