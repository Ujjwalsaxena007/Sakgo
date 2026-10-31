(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE_KEY = "sakgo.savedTrips.v1";
  const LANGUAGE_KEY = "sakgo.language.v1";
  let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || "en";
  let lastItinerary = null;
  let toastTimer;

  const copy = {
    en: {
      navPlan: "Plan a trip", navDiscover: "Discover", navSaved: "Saved trips", signIn: "Sign in", startPlanning: "Start planning",
      eyebrow: "YOUR AI TRAVEL COMPANION", heroTitle: 'Less scrolling.<br><span>More exploring.</span>',
      heroDesc: "Your next great trip starts here. Build a plan around your vibe, your budget, and the places you’ve always wanted to see.",
      planMyTrip: "Plan my trip", exploreIdeas: "Explore ideas", madeFor: "Made for your kind of travel", madeForSub: "Solo escapes · Friends · Family · Weekend breaks",
      plannerEyebrow: "THE TRIP BUILDER", plannerTitle: "Where to next?", plannerDesc: "A few details in. A trip that feels like you.",
      destinationLabel: "DESTINATION", durationLabel: "HOW LONG?", budgetLabel: "BUDGET / PERSON", styleLabel: "YOUR VIBE", generate: "Build my itinerary",
      demoNote: "Demo mode: this creates a starter itinerary locally. Live AI, accounts and bookings need backend/API integration.",
      discoverEyebrow: "A LITTLE INSPIRATION", discoverTitle: "Pick a direction.", makeItYours: "Make it yours ↗",
      savedEyebrow: "YOUR COLLECTION", savedTitle: "Trips worth keeping.", emptySaved: "Your saved trips will show up here.", createFirst: "Create your first itinerary ↗",
      closingTitle: 'The world is big.<br><span>Your plans can be simple.</span>', letsGo: "Let's go", footerLine: "Built for curious minds and open roads.", footerNote: "Concept preview"
    },
    hi: {
      navPlan: "ट्रिप प्लान करें", navDiscover: "जगहें खोजें", navSaved: "सेव की गई ट्रिप", signIn: "साइन इन", startPlanning: "प्लान शुरू करें",
      eyebrow: "आपका AI ट्रैवल साथी", heroTitle: 'कम स्क्रॉलिंग।<br><span>ज़्यादा घूमना।</span>',
      heroDesc: "आपकी अगली शानदार ट्रिप यहीं से शुरू होती है। अपने बजट, पसंद और पसंदीदा जगहों के हिसाब से प्लान बनाएं।",
      planMyTrip: "मेरी ट्रिप प्लान करें", exploreIdeas: "आइडिया देखें", madeFor: "आपके घूमने के अंदाज़ के लिए", madeForSub: "सोलो ट्रिप · दोस्त · परिवार · वीकेंड",
      plannerEyebrow: "ट्रिप बिल्डर", plannerTitle: "अब कहाँ चलें?", plannerDesc: "कुछ जानकारी दें, अपनी पसंद की ट्रिप पाएं।",
      destinationLabel: "कहाँ जाना है?", durationLabel: "कितने दिन?", budgetLabel: "बजट / व्यक्ति", styleLabel: "आपकी पसंद", generate: "मेरा प्लान बनाएं",
      demoNote: "डेमो मोड: यह शुरुआती itinerary आपके ब्राउज़र में बनाता है। असली AI, अकाउंट और बुकिंग के लिए backend/API चाहिए।",
      discoverEyebrow: "थोड़ी प्रेरणा", discoverTitle: "अपनी अगली जगह चुनें।", makeItYours: "अपना प्लान बनाएं ↗",
      savedEyebrow: "आपकी कलेक्शन", savedTitle: "अपनी ट्रिप्स सेव करें।", emptySaved: "आपकी सेव की गई ट्रिप यहाँ दिखेंगी।", createFirst: "पहली itinerary बनाएं ↗",
      closingTitle: 'दुनिया बड़ी है।<br><span>प्लान आसान रखो।</span>', letsGo: "चलो चलें", footerLine: "घूमने के शौकीनों के लिए बनाया गया।", footerNote: "कॉन्सेप्ट प्रीव्यू"
    }
  };

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function getSavedTrips() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Could not read saved trips:", error);
      return [];
    }
  }

  function saveTrips(trips) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
      renderSavedTrips();
      return true;
    } catch (error) {
      showToast("Browser storage is unavailable. Please check privacy settings.");
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function getDestinationPlan(destination, duration, style) {
    const places = {
      manali: {
        adventure: ["Solang Valley activities", "Old Manali cafés", "Jogini Waterfall trail", "Atal Tunnel / Sissu day trip", "Vashisht hot springs"],
        food: ["Mall Road food walk", "Old Manali café hopping", "Local Himachali meal", "Hadimba Temple & nearby market"],
        relax: ["Slow morning with mountain views", "Riverside walk", "Vashisht village", "Sunset viewpoint"],
        nature: ["Hadimba Temple cedar forest", "Jogini Waterfall", "Solang Valley viewpoints", "Sissu valley landscapes"]
      },
      jaipur: {
        adventure: ["Nahargarh Fort viewpoint", "Cycle or walking heritage tour", "Amber Fort exploration", "Local bazaar discovery"],
        food: ["Jaipur street-food walk", "Johari Bazaar", "Traditional Rajasthani thali", "Local sweets tasting"],
        relax: ["Patrika Gate photo stop", "Jal Mahal viewpoint", "Garden café break", "Sunset at Nahargarh"],
        nature: ["Jal Mahal lakeside view", "Sisodia Rani Garden", "Nahargarh sunset", "Central Park morning walk"]
      },
      goa: {
        adventure: ["Kayaking or water sports (check local conditions)", "Fort Aguada", "Beach-hopping route", "Scenic coastal drive"],
        food: ["Goan cuisine tasting", "Local market walk", "Beach shack meal", "Café and bakery crawl"],
        relax: ["Quiet beach morning", "Sunset by the coast", "Spa or slow café break", "Leisurely coastal stroll"],
        nature: ["Dona Paula viewpoint", "Butterfly Beach (check access)", "Salim Ali Bird Sanctuary", "Sunset beach walk"]
      },
      default: {
        adventure: ["Explore a popular outdoor spot", "Try a local guided activity", "Find a scenic walking route", "Visit a viewpoint or nature area"],
        food: ["Try a well-reviewed local breakfast spot", "Explore a market or food street", "Taste a regional speciality", "Find a local café"],
        relax: ["Start with a relaxed breakfast", "Explore the main area at your own pace", "Take a café break", "Enjoy an easy sunset walk"],
        nature: ["Visit a nearby park or nature area", "Find a scenic viewpoint", "Take a relaxed outdoor walk", "Catch the sunset at a public spot"]
      }
    };
    const key = destination.toLowerCase();
    const data = places[key] || places.default;
    const selected = data[style] || data.nature;
    const dayCount = Math.min(Number(duration) || 3, 10);
    return Array.from({ length: dayCount }, (_, index) => ({
      day: index + 1,
      title: ["Arrive & get your bearings", "Explore the highlights", "Go a little off-route", "Take the scenic route", "Local favourites", "A day at your own pace", "One last adventure", "Explore nearby", "Slow discoveries", "Wrap up & wander"][index] || `Day ${index + 1}`,
      activities: [selected[(index * 2) % selected.length], selected[(index * 2 + 1) % selected.length] || selected[0], index === dayCount - 1 ? "Keep time for your return journey" : "Leave room for a spontaneous stop"]
    }));
  }

  function budgetText(budget, days) {
    const perDay = budget === "budget" ? [1200, 2200] : budget === "premium" ? [5000, 10000] : [2500, 5000];
    return `Estimated on-ground spend: ₹${(perDay[0] * days).toLocaleString("en-IN")}–₹${(perDay[1] * days).toLocaleString("en-IN")} per person, excluding travel to the destination.`;
  }

  function makeItinerary(formData) {
    const destination = formData.get("destination").trim();
    const duration = Number(formData.get("duration"));
    const budget = formData.get("budget");
    const style = formData.get("travelStyle");
    if (!destination) {
      $("#destination").focus();
      showToast("Enter a destination to build your plan.");
      return;
    }
    lastItinerary = {
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
      destination, duration, budget, style,
      days: getDestinationPlan(destination, duration, style),
      createdAt: new Date().toISOString()
    };
    renderItinerary(lastItinerary);
    $("#itineraryResult").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderItinerary(trip) {
    const result = $("#itineraryResult");
    const dayHTML = trip.days.map(day => `
      <article class="day-card">
        <h4>DAY ${day.day.toString().padStart(2, "0")} <span style="color:var(--lime)">/</span> ${escapeHTML(day.title)}</h4>
        <ul>${day.activities.map(activity => `<li>${escapeHTML(activity)}</li>`).join("")}</ul>
      </article>`).join("");
    result.innerHTML = `
      <div class="itinerary-card">
        <div class="itinerary-top">
          <div><div class="mini-label">YOUR STARTER ITINERARY</div><h3>${escapeHTML(trip.destination)} <span style="color:var(--lime)">↗</span></h3><p>${trip.duration} days · ${escapeHTML(trip.style)} · ${trip.budget === "budget" ? "Budget" : trip.budget === "premium" ? "Premium" : "Balanced"} travel</p></div>
          <div class="itinerary-actions"><button class="small-button" id="copyTrip" type="button">Copy plan</button><button class="small-button primary" id="saveTrip" type="button">Save trip +</button></div>
        </div>
        <div class="itinerary-days">${dayHTML}</div>
        <div class="budget-estimate">◈ &nbsp;${escapeHTML(budgetText(trip.budget, trip.duration))}<br><br><span style="color:#aab39f">Planning starter only. Confirm opening hours, routes, weather, local conditions and prices before travel.</span></div>
      </div>`;
    $("#copyTrip").addEventListener("click", () => copyTrip(trip));
    $("#saveTrip").addEventListener("click", () => saveTrip(trip));
  }

  async function copyTrip(trip) {
    const text = [`SAKGO — ${trip.destination}`, `${trip.duration} days · ${trip.style}`, "", ...trip.days.flatMap(day => [`Day ${day.day}: ${day.title}`, ...day.activities.map(activity => `- ${activity}`), ""]), budgetText(trip.budget, trip.duration)].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast("Itinerary copied!");
    } catch (error) {
      const temp = document.createElement("textarea");
      temp.value = text; temp.setAttribute("readonly", ""); temp.style.position = "fixed"; temp.style.opacity = "0";
      document.body.appendChild(temp); temp.select();
      const ok = document.execCommand("copy"); temp.remove();
      showToast(ok ? "Itinerary copied!" : "Copy was blocked by your browser.");
    }
  }

  function saveTrip(trip) {
    const trips = getSavedTrips();
    if (trips.some(item => item.destination.toLowerCase() === trip.destination.toLowerCase() && item.duration === trip.duration)) {
      showToast("A similar trip is already saved.");
      return;
    }
    trips.unshift(trip);
    if (saveTrips(trips)) showToast("Trip saved on this device.");
  }

  function renderSavedTrips() {
    const trips = getSavedTrips();
    $("#savedCount").textContent = `${trips.length} SAVED`;
    const container = $("#savedTrips");
    if (!trips.length) {
      container.innerHTML = `<div class="empty-state"><span class="empty-icon">↗</span><p>${copy[currentLanguage].emptySaved}</p><a href="#planner" class="text-link">${copy[currentLanguage].createFirst}</a></div>`;
      return;
    }
    container.innerHTML = trips.map(trip => `
      <article class="saved-trip">
        <div class="mini-label">${Number(trip.duration)} DAY${Number(trip.duration) === 1 ? "" : "S"} · SAVED TRIP</div>
        <h3>${escapeHTML(trip.destination)}</h3><p>${escapeHTML(trip.style)} · ${trip.budget === "premium" ? "Premium" : trip.budget === "budget" ? "Budget" : "Balanced"}</p>
        <button class="small-button primary" type="button" data-open-trip="${escapeHTML(trip.id)}">Open plan</button>
        <button class="small-button" type="button" data-delete-trip="${escapeHTML(trip.id)}">Remove</button>
      </article>`).join("");
    $$("[data-open-trip]", container).forEach(button => button.addEventListener("click", () => {
      const trip = getSavedTrips().find(item => item.id === button.dataset.openTrip);
      if (trip) { lastItinerary = trip; renderItinerary(trip); $("#planner").scrollIntoView({ behavior: "smooth" }); }
    }));
    $$("[data-delete-trip]", container).forEach(button => button.addEventListener("click", () => {
      saveTrips(getSavedTrips().filter(item => item.id !== button.dataset.deleteTrip));
      showToast("Saved trip removed.");
    }));
  }

  function applyLanguage() {
    document.documentElement.lang = currentLanguage === "hi" ? "hi" : "en";
    document.body.classList.toggle("hindi", currentLanguage === "hi");
    $$("[data-i18n]").forEach(element => {
      const value = copy[currentLanguage][element.dataset.i18n];
      if (value) element.innerHTML = value;
    });
    $("#languageToggle").textContent = currentLanguage === "en" ? "हिंदी" : "English";
    $("#destination").placeholder = currentLanguage === "hi" ? "जैसे मनाली, जयपुर, गोवा" : "e.g. Manali, Jaipur, Goa";
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
    renderSavedTrips();
  }

  $("#tripForm").addEventListener("submit", event => {
    event.preventDefault();
    makeItinerary(new FormData(event.currentTarget));
  });

  $$(".destination-card").forEach(card => card.addEventListener("click", () => {
    $("#destination").value = card.dataset.destination;
    $("#planner").scrollIntoView({ behavior: "smooth" });
    $("#destination").focus({ preventScroll: true });
  }));

  $("#languageToggle").addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "hi" : "en";
    applyLanguage();
  });

  $("#mobileMenu").addEventListener("click", () => {
    const nav = $(".desktop-nav");
    const open = nav.classList.toggle("open");
    $("#mobileMenu").setAttribute("aria-expanded", String(open));
  });
  $$(".desktop-nav a").forEach(link => link.addEventListener("click", () => $(".desktop-nav").classList.remove("open")));

  const authDialog = $("#authDialog");
  $("#loginButton").addEventListener("click", () => {
    $("#authMessage").textContent = "";
    if (typeof authDialog.showModal === "function") authDialog.showModal();
    else showToast("Your browser does not support this sign-in preview.");
  });
  $("#closeDialog").addEventListener("click", () => authDialog.close());
  authDialog.addEventListener("click", event => { if (event.target === authDialog) authDialog.close(); });
  $("#authForm").addEventListener("submit", event => {
    event.preventDefault();
    $("#authMessage").textContent = "UI preview only: no credentials were sent or stored. Connect a secure authentication backend before launch.";
  });

  $("#year").textContent = new Date().getFullYear();
  applyLanguage();
})();