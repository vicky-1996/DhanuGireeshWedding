(() => {
  const config = window.WEDDING_CONFIG;
  const state = {
    galleryIndex: 0,
    slideshowTimer: null,
    wishes: [],
    rsvps: [],
    scratched: false,
    audioContext: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const setText = () => {
    const values = {
      initials: config.couple.initials,
      bride: config.couple.bride,
      groom: config.couple.groom,
      coupleNames: `${config.couple.bride} & ${config.couple.groom}`,
      dateDisplay: config.wedding.dateDisplay,
      timeDisplay: config.wedding.timeDisplay,
      venue: config.wedding.venue,
      place: config.wedding.place,
      quote: config.couple.quote,
      handwritten: config.couple.handwritten,
      welcomeEyebrow: config.welcome.eyebrow,
      welcomeTitle: config.welcome.title,
      welcomeBody: config.welcome.body,
      coupleNote: config.coupleIntro.note,
      brideLine: config.coupleIntro.brideLine,
      groomLine: config.coupleIntro.groomLine
    };

    $$("[data-config]").forEach((node) => {
      const key = node.dataset.config;
      if (values[key]) node.textContent = values[key];
    });

    $("#bgMusic").src = config.assets.music;
    $("#mapButton").href = config.wedding.mapUrl;
    $("#mapEmbed").src = config.wedding.mapEmbed;
    document.documentElement.style.setProperty("--hero-image", `url("${config.assets.hero}")`);
    $$(".monogram").forEach((node) => { node.textContent = config.couple.initials; });
    setPicture(".hero-panel__media picture", config.assets.portraitOneSmall, config.assets.portraitOne);
    $(".portrait-card img").src = config.assets.portraitOneSmall;
    $(".portrait-card--offset img").src = config.assets.portraitTwoSmall;
    $(".venue-banner img").src = config.assets.venue;
    document.title = `${config.couple.bride} & ${config.couple.groom} | Wedding Invitation`;
  };

  const setPicture = (selector, small, large) => {
    const picture = $(selector);
    if (!picture) return;
    const source = $("source", picture);
    const image = $("img", picture);
    if (source) source.srcset = small;
    if (image) image.src = large;
  };

  const createPetals = () => {
    const field = $("#petalField");
    for (let i = 0; i < 28; i += 1) {
      const petal = document.createElement("span");
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.animationDuration = `${10 + Math.random() * 12}s`;
      petal.style.animationDelay = `${Math.random() * -14}s`;
      petal.style.setProperty("--drift", `${-30 + Math.random() * 60}vw`);
      petal.style.opacity = `${0.24 + Math.random() * 0.52}`;
      field.appendChild(petal);
    }
  };

  const observeReveals = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    $$(".reveal").forEach((node) => observer.observe(node));
  };

  const openInvitation = async () => {
    const opening = $("#opening");
    const shell = $("#siteShell");
    opening.classList.add("is-opening");
    document.body.classList.add("invitation-open");
    shell.removeAttribute("aria-hidden");
    setTimeout(() => opening.classList.add("is-open"), 760);

    const music = $("#bgMusic");
    music.volume = 0.34;
    try {
      await music.play();
    } catch {
      $("#musicToggle").classList.add("is-muted");
    }

    if (navigator.vibrate) navigator.vibrate(24);
  };

  const setupMusic = () => {
    const button = $("#musicToggle");
    const music = $("#bgMusic");
    button.addEventListener("click", async () => {
      if (music.paused) {
        try {
          await music.play();
          button.classList.remove("is-muted");
          button.setAttribute("aria-label", "Mute music");
        } catch {
          button.classList.add("is-muted");
        }
      } else {
        music.pause();
        button.classList.add("is-muted");
        button.setAttribute("aria-label", "Play music");
      }
      if (navigator.vibrate) navigator.vibrate(12);
    });
  };

  const updateProgress = () => {
    const progress = $(".progress span");
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  };

  const renderJourney = () => {
    $("#journeyTrack").innerHTML = config.journey.map((item) => `
      <article class="journey-card reveal">
        <div class="journey-card__dot" aria-hidden="true"></div>
        <h3>${escapeHtml(item.title)}</h3>
        <time>${escapeHtml(item.date)}</time>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `).join("");
  };

  const renderLoveStory = () => {
    $("#loveStory").innerHTML = config.loveStory.map((line) => `<p class="reveal">${escapeHtml(line)}</p>`).join("");
  };

  const renderCountdown = () => {
    const grid = $("#countdownGrid");
    const target = new Date(config.wedding.dateISO).getTime();

    const tick = () => {
      const distance = Math.max(0, target - Date.now());
      const days = Math.floor(distance / 86400000);
      const hours = Math.floor((distance % 86400000) / 3600000);
      const minutes = Math.floor((distance % 3600000) / 60000);
      const seconds = Math.floor((distance % 60000) / 1000);
      const data = [
        ["Days", days],
        ["Hours", hours],
        ["Minutes", minutes],
        ["Seconds", seconds]
      ];
      grid.innerHTML = data.map(([label, value]) => `
        <div class="countdown-card">
          <strong>${String(value).padStart(2, "0")}</strong>
          <span>${label}</span>
        </div>
      `).join("");
    };

    tick();
    setInterval(tick, 1000);
  };

  const setupScratchCard = () => {
    const canvas = $("#scratchCanvas");
    const card = $("#scratchCard");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;

    const paintFoil = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = card.getBoundingClientRect();
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (state.scratched) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        return;
      }

      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#8b641e");
      gradient.addColorStop(0.28, "#f8e7a8");
      gradient.addColorStop(0.52, "#c99731");
      gradient.addColorStop(0.78, "#fff4c9");
      gradient.addColorStop(1, "#a97622");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 120; i += 1) {
        ctx.fillStyle = Math.random() > 0.5 ? "#fff9d7" : "#6f4c13";
        ctx.beginPath();
        ctx.arc(Math.random() * rect.width, Math.random() * rect.height, Math.random() * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(23,16,13,0.76)";
      ctx.font = "800 13px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "2px";
      ctx.fillText("SCRATCH TO REVEAL", rect.width / 2, rect.height / 2);
    };

    const pointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      const client = event.touches ? event.touches[0] : event;
      return {
        x: client.clientX - rect.left,
        y: client.clientY - rect.top
      };
    };

    const scratch = (event) => {
      if (!isDrawing) return;
      event.preventDefault();
      const point = pointer(event);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      checkScratchProgress();
    };

    const checkScratchProgress = () => {
      if (state.scratched) return;
      const { width, height } = canvas;
      const data = ctx.getImageData(0, 0, width, height).data;
      let clear = 0;
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] < 40) clear += 1;
      }
      if (clear / (data.length / 16) > 0.42) {
        state.scratched = true;
        ctx.clearRect(0, 0, width, height);
        burstPetals(card);
        playChime();
      }
    };

    paintFoil();
    window.addEventListener("resize", paintFoil, { passive: true });
    canvas.addEventListener("pointerdown", (event) => {
      isDrawing = true;
      scratch(event);
    });
    canvas.addEventListener("pointermove", scratch);
    window.addEventListener("pointerup", () => { isDrawing = false; });
    canvas.addEventListener("touchstart", (event) => {
      isDrawing = true;
      scratch(event);
    }, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    window.addEventListener("touchend", () => { isDrawing = false; });
  };

  const burstPetals = (anchor) => {
    const rect = anchor.getBoundingClientRect();
    for (let i = 0; i < 34; i += 1) {
      const petal = document.createElement("span");
      petal.className = "burst-petal";
      petal.style.left = `${rect.left + rect.width / 2}px`;
      petal.style.top = `${rect.top + rect.height / 2}px`;
      petal.style.width = "0.7rem";
      petal.style.height = "1rem";
      petal.style.borderRadius = "70% 30% 70% 30%";
      petal.style.background = i % 3 === 0 ? "#c97a7e" : "#f4d775";
      petal.style.setProperty("--x", `${-150 + Math.random() * 300}px`);
      petal.style.setProperty("--y", `${-190 + Math.random() * 230}px`);
      petal.style.animation = `burst ${0.85 + Math.random() * 0.65}s ease forwards`;
      document.body.appendChild(petal);
      setTimeout(() => petal.remove(), 1600);
    }
  };

  const playChime = () => {
    try {
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) return;
      state.audioContext ||= new AudioEngine();
      const now = state.audioContext.currentTime;
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const osc = state.audioContext.createOscillator();
        const gain = state.audioContext.createGain();
        osc.frequency.value = frequency;
        osc.type = "sine";
        gain.gain.setValueAtTime(0, now + index * 0.1);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.5);
        osc.connect(gain).connect(state.audioContext.destination);
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.55);
      });
    } catch {
      return;
    }
  };

  const renderGallery = () => {
    $("#galleryGrid").innerHTML = config.gallery.map((item, index) => `
      <button class="gallery-item reveal" type="button" data-index="${index}" aria-label="Open image: ${escapeHtml(item.caption)}">
        <figure>
          <picture>
            <source media="(max-width: 720px)" srcset="${item.small}">
            <img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy">
          </picture>
          <figcaption>${escapeHtml(item.caption)}</figcaption>
        </figure>
      </button>
    `).join("");

    $$(".gallery-item").forEach((button) => {
      button.addEventListener("click", () => openLightbox(Number(button.dataset.index)));
    });
  };

  const openLightbox = (index) => {
    state.galleryIndex = index;
    updateLightbox();
    $("#lightbox").hidden = false;
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    $("#lightbox").hidden = true;
    document.body.style.overflow = "";
  };

  const updateLightbox = () => {
    const item = config.gallery[state.galleryIndex];
    $("#lightboxImage").src = item.src;
    $("#lightboxImage").alt = item.alt;
    $("#lightboxCaption").textContent = item.caption;
  };

  const moveLightbox = (direction) => {
    state.galleryIndex = (state.galleryIndex + direction + config.gallery.length) % config.gallery.length;
    updateLightbox();
  };

  const setupLightbox = () => {
    $("#lightboxClose").addEventListener("click", closeLightbox);
    $("#lightboxPrev").addEventListener("click", () => moveLightbox(-1));
    $("#lightboxNext").addEventListener("click", () => moveLightbox(1));

    let startX = 0;
    $("#lightbox").addEventListener("pointerdown", (event) => { startX = event.clientX; });
    $("#lightbox").addEventListener("pointerup", (event) => {
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 50) moveLightbox(delta > 0 ? -1 : 1);
    });

    document.addEventListener("keydown", (event) => {
      if ($("#lightbox").hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    });

    $("#slideshowToggle").addEventListener("click", (event) => {
      if (state.slideshowTimer) {
        clearInterval(state.slideshowTimer);
        state.slideshowTimer = null;
        event.currentTarget.textContent = "Auto Slideshow";
        return;
      }
      openLightbox(0);
      state.slideshowTimer = setInterval(() => moveLightbox(1), 2800);
      event.currentTarget.textContent = "Stop Slideshow";
    });
  };

  const loadStorage = () => {
    state.wishes = JSON.parse(localStorage.getItem("dg_wishes") || "null") || config.blessingsDefaults.map((wish) => ({
      ...wish,
      approved: true,
      id: crypto.randomUUID()
    }));
    state.rsvps = JSON.parse(localStorage.getItem("dg_rsvps") || "[]");
  };

  const saveWishes = () => localStorage.setItem("dg_wishes", JSON.stringify(state.wishes));
  const saveRsvps = () => localStorage.setItem("dg_rsvps", JSON.stringify(state.rsvps));

  const renderWishes = () => {
    $("#wishesList").innerHTML = state.wishes
      .filter((wish) => wish.approved)
      .map((wish) => `
        <article class="wish-card reveal is-visible">
          <strong>${escapeHtml(wish.name)}</strong>
          <p>${escapeHtml(wish.message)}</p>
        </article>
      `).join("");
  };

  const setupWishes = () => {
    $("#wishForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const wish = {
        id: crypto.randomUUID(),
        name: String(form.get("name")).trim(),
        message: String(form.get("message")).trim(),
        approved: true,
        createdAt: new Date().toISOString()
      };
      state.wishes.unshift(wish);
      saveWishes();
      renderWishes();
      renderModeration();
      event.currentTarget.reset();
      popHeart(window.innerWidth / 2, window.innerHeight / 2);
      if (navigator.vibrate) navigator.vibrate([12, 24, 12]);
    });

    $("#moderationToggle").addEventListener("click", () => {
      const panel = $("#moderationPanel");
      panel.hidden = !panel.hidden;
    });

    $("#unlockModeration").addEventListener("click", () => {
      const ok = $("#moderationPasscode").value === config.moderationPasscode;
      $("#moderationPanel").classList.toggle("is-unlocked", ok);
      renderModeration(ok);
    });
  };

  const renderModeration = (unlocked = $("#moderationPanel").classList.contains("is-unlocked")) => {
    const list = $("#moderationList");
    if (!unlocked) {
      list.innerHTML = "";
      return;
    }
    list.innerHTML = state.wishes.map((wish) => `
      <div class="moderation-row">
        <strong>${escapeHtml(wish.name)}</strong>
        <span>${escapeHtml(wish.message)}</span>
        <div class="action-row">
          <button class="text-button" type="button" data-action="toggle" data-id="${wish.id}">
            ${wish.approved ? "Hide" : "Approve"}
          </button>
          <button class="text-button" type="button" data-action="delete" data-id="${wish.id}">Delete</button>
        </div>
      </div>
    `).join("");

    $$("[data-action]", list).forEach((button) => {
      button.addEventListener("click", () => {
        const wish = state.wishes.find((item) => item.id === button.dataset.id);
        if (!wish) return;
        if (button.dataset.action === "toggle") wish.approved = !wish.approved;
        if (button.dataset.action === "delete") state.wishes = state.wishes.filter((item) => item.id !== wish.id);
        saveWishes();
        renderWishes();
        renderModeration(true);
      });
    });
  };

  const popHeart = (x, y) => {
    const heart = document.createElement("div");
    heart.className = "heart-pop";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.2-4.35-9.7-8.4C.2 9.2 2.05 5 5.9 5c2.05 0 3.3 1.14 4.1 2.3C10.7 6.14 11.95 5 14.1 5c3.85 0 5.7 4.2 3.6 7.6C15.2 16.65 12 21 12 21Z"/></svg>`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
  };

  const renderFamilies = () => {
    const cards = [config.families.bride, config.families.groom];
    $("#familyGrid").innerHTML = cards.map((family) => `
      <article class="family-card reveal">
        <h3>${escapeHtml(family.title)}</h3>
        <ul>
          ${family.people.map((person) => `<li>${escapeHtml(person)}</li>`).join("")}
        </ul>
      </article>
    `).join("");
  };

  const renderSchedule = () => {
    $("#scheduleList").innerHTML = config.schedule.map((item) => `
      <article class="schedule-item reveal">
        <time>${escapeHtml(item.time)}</time>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.detail)}</p>
      </article>
    `).join("");
  };

  const renderVenue = () => {
    $("#travelTips").innerHTML = config.travelTips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
  };

  const renderPalette = () => {
    $("#palette").innerHTML = config.dressCode.map((color) => `
      <article class="palette-card reveal">
        <span style="background:${color.color}"></span>
        <strong>${escapeHtml(color.name)}</strong>
      </article>
    `).join("");
  };

  const setupRsvp = () => {
    const whatsapp = $("#whatsappRsvp");
    const callButton = $("#callButton");
    updateWhatsappLink();

    $("#rsvpForm").addEventListener("input", updateWhatsappLink);
    $("#rsvpForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const rsvp = {
        id: crypto.randomUUID(),
        name: String(form.get("name")).trim(),
        guests: String(form.get("guests")),
        attendance: String(form.get("attendance")),
        message: String(form.get("message")).trim(),
        createdAt: new Date().toISOString()
      };
      state.rsvps.unshift(rsvp);
      saveRsvps();
      $("#rsvpStatus").textContent = "RSVP saved on this device.";
      popHeart(window.innerWidth / 2, window.innerHeight / 2);
    });

    if (config.contact.phone) {
      callButton.href = `tel:${config.contact.phone}`;
    } else {
      callButton.href = "#rsvp";
      callButton.setAttribute("aria-disabled", "true");
      callButton.title = "Add a phone number in config.js to enable calling";
    }

    function updateWhatsappLink() {
      const form = new FormData($("#rsvpForm"));
      const name = String(form.get("name") || "Guest").trim();
      const guests = String(form.get("guests") || "1");
      const attendance = String(form.get("attendance") || "Attending");
      const message = [
        config.contact.whatsappMessage,
        `Name: ${name}`,
        `Guests: ${guests}`,
        `Attendance: ${attendance}`
      ].join("\n");
      const encoded = encodeURIComponent(message);
      whatsapp.href = config.contact.whatsappPhone
        ? `https://wa.me/${config.contact.whatsappPhone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;
    }
  };

  const setupShareAndCalendar = () => {
    $("#shareInvite").addEventListener("click", async () => {
      const shareData = {
        title: `${config.couple.bride} & ${config.couple.groom}`,
        text: `Join us for the wedding of ${config.couple.bride} & ${config.couple.groom} on ${config.wedding.dateDisplay}.`,
        url: location.href
      };
      try {
        if (navigator.share) await navigator.share(shareData);
        else {
          await navigator.clipboard.writeText(location.href);
          toast("Invitation link copied.");
        }
      } catch {
        return;
      }
    });

    $("#calendarButton").addEventListener("click", () => {
      const start = toIcsDate(new Date(config.wedding.dateISO));
      const end = toIcsDate(new Date(new Date(config.wedding.dateISO).getTime() + 3 * 60 * 60 * 1000));
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${config.couple.bride} & ${config.couple.groom} Wedding`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `LOCATION:${config.wedding.address}`,
        `DESCRIPTION:${config.wedding.mapUrl}`,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
      downloadBlob("dhanusree-girish-wedding.ics", "text/calendar", ics);
    });
  };

  const setupDigitalCard = () => {
    $("#downloadCard").addEventListener("click", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1500;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1500);
      gradient.addColorStop(0, "#fff8ec");
      gradient.addColorStop(0.5, "#f1dfb4");
      gradient.addColorStop(1, "#fffaf1");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#c99731";
      ctx.lineWidth = 8;
      ctx.strokeRect(72, 72, 936, 1356);
      ctx.strokeStyle = "rgba(201,151,49,0.34)";
      ctx.lineWidth = 2;
      ctx.strokeRect(100, 100, 880, 1300);
      ctx.fillStyle = "#17100d";
      ctx.textAlign = "center";
      ctx.font = "700 74px Georgia, serif";
      ctx.fillText(config.couple.initials, 540, 210);
      ctx.font = "44px Georgia, serif";
      ctx.fillText("With the blessings of our families", 540, 338);
      ctx.font = "700 96px Georgia, serif";
      ctx.fillText(config.couple.bride, 540, 520);
      ctx.fillStyle = "#c99731";
      ctx.font = "italic 64px Georgia, serif";
      ctx.fillText("&", 540, 612);
      ctx.fillStyle = "#17100d";
      ctx.font = "700 96px Georgia, serif";
      ctx.fillText(config.couple.groom, 540, 720);
      ctx.font = "40px Georgia, serif";
      ctx.fillText("request the pleasure of your presence", 540, 850);
      ctx.fillStyle = "#5f2637";
      ctx.font = "700 58px Georgia, serif";
      ctx.fillText(config.wedding.dateDisplay, 540, 1010);
      ctx.font = "42px Georgia, serif";
      ctx.fillText(config.wedding.timeDisplay, 540, 1085);
      ctx.fillStyle = "#17100d";
      ctx.font = "46px Georgia, serif";
      ctx.fillText(config.wedding.venue, 540, 1220);
      ctx.font = "38px Georgia, serif";
      ctx.fillText(config.wedding.place, 540, 1284);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "dhanusree-girish-wedding-card.png";
        link.click();
        URL.revokeObjectURL(url);
      });
    });
  };

  const registerServiceWorker = () => {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  };

  const toast = (message) => {
    const node = document.createElement("div");
    node.textContent = message;
    node.style.cssText = "position:fixed;left:50%;bottom:2rem;z-index:60;transform:translateX(-50%);padding:.8rem 1rem;border-radius:999px;background:#17100d;color:#fff8ec;box-shadow:0 16px 40px rgba(0,0,0,.24);";
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  };

  const toIcsDate = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const downloadBlob = (name, type, content) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const init = () => {
    setText();
    createPetals();
    renderJourney();
    renderLoveStory();
    renderCountdown();
    renderGallery();
    loadStorage();
    renderWishes();
    renderFamilies();
    renderSchedule();
    renderVenue();
    renderPalette();
    setupMusic();
    setupScratchCard();
    setupLightbox();
    setupWishes();
    setupRsvp();
    setupShareAndCalendar();
    setupDigitalCard();
    observeReveals();
    registerServiceWorker();
    updateProgress();

    $("#openInvitation").addEventListener("click", openInvitation);
    window.addEventListener("scroll", updateProgress, { passive: true });
  };

  document.addEventListener("DOMContentLoaded", init);
})();
