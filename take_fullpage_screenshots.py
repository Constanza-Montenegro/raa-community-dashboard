from playwright.sync_api import sync_playwright
import time, os

URL = "https://raa-community-dashboard.vercel.app/"
OUT = "/Users/constanzamontenegro/Desktop/RAA Dashboard/screenshots"

def full_screenshot(page, path):
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.5)
    page.screenshot(path=path, full_page=True)
    print(f"  Saved: {path}")

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        print("Loading platform...")
        page.goto(URL)
        page.wait_for_selector("#gate-input", timeout=15000)
        page.fill("#gate-input", "SDG15")
        page.click("button:has-text('Enter')")
        page.wait_for_selector(".hero-stat-num", timeout=20000)
        time.sleep(3)

        # 1. LANDING PAGE
        print("1. Landing page...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(0.5)
        full_screenshot(page, f"{OUT}/01_landing.png")

        # 2. GLOBAL PRESENCE
        print("2. Global Presence...")
        page.click('[data-section="global-presence"]')
        time.sleep(3)
        full_screenshot(page, f"{OUT}/02_global_presence.png")

        # 3. INITIATIVES DIRECTORY
        print("3. Initiatives Directory...")
        page.click('[data-section="initiatives-directory"]')
        time.sleep(2)
        full_screenshot(page, f"{OUT}/03_initiatives_directory.png")

        # 4. KNOWLEDGE AND TOOLS
        print("4. Resources & Opportunities...")
        page.click('[data-section="resources-opportunities"]')
        time.sleep(2)
        full_screenshot(page, f"{OUT}/04_land_ecosystem.png")

        # 5. COMMUNITY SNAPSHOT
        print("5. Community Snapshot...")
        page.click('[data-section="community-snapshot"]')
        time.sleep(3)
        full_screenshot(page, f"{OUT}/05_community_snapshot.png")

        # 6. PARTNERS
        print("6. Partners...")
        page.click('[data-section="partners-list"]')
        time.sleep(2)
        full_screenshot(page, f"{OUT}/06_partners.png")

        browser.close()
        print("\nDone! Screenshots saved to:", OUT)

run()
