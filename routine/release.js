// Set this to ROUTINE's verified public App Store URL only when releasing the page.
// Empty keeps the waitlist visible. This file does not release the app or publish the site.
const APP_STORE_URL = "";

(() => {
  if (!APP_STORE_URL) return;
  let url;
  try {
    url = new URL(APP_STORE_URL);
    if (url.protocol !== "https:" || url.hostname !== "apps.apple.com" ||
        !/\/id6759007085(?:\/|$)/.test(url.pathname) || url.username || url.password) {
      throw new Error("Expected ROUTINE's HTTPS App Store URL");
    }
  } catch (error) {
    console.error("ROUTINE download link is invalid; keeping the waitlist.", error);
    return;
  }

  for (const id of ["nav-download", "hero-download", "section-download"]) {
    document.getElementById(id).href = url.href;
  }
  document.getElementById("nav-download").textContent = "Get ROUTINE";
  const hero = document.getElementById("hero-download");
  hero.className = "app-store-badge";
  const badge = document.createElement("img");
  badge.src = "/routine/assets/download-on-the-app-store.svg";
  badge.alt = "Download on the App Store";
  badge.width = 160;
  badge.height = 54;
  hero.replaceChildren(badge);
  document.getElementById("availability").textContent = "Available on the App Store";
  document.getElementById("download-heading").textContent = "Your next workout starts here.";
  document.getElementById("download-description").textContent = "Build a plan around your goals and schedule. Start with ROUTINE for iPhone.";
  document.getElementById("launch-waitlist").hidden = true;
  document.getElementById("section-download").hidden = false;
  document.querySelector(".skip").textContent = "Skip to download";
})();
