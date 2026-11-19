/* =========================================================
   BersihKilat — Interaksi Landing Page
   - Menu mobile
   - Header saat scroll & penanda menu aktif
   - Animasi muncul saat scroll
   - Pemilihan layanan cepat
   - Kalkulasi estimasi biaya & konfirmasi WhatsApp
   ========================================================= */

(function () {
  "use strict";

  /* Ganti nomor ini dengan nomor WhatsApp bisnis Anda (format internasional, tanpa "+"). */
  const WHATSAPP_NUMBER = "6281234567890";

  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  const formatRupiah = (value) => rupiah.format(value).replace(/\s/g, " ");

  /* ---------------------------------------------------------
     1. Menu mobile
     --------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  const nav = document.getElementById("mainNav");
  const navToggle = document.getElementById("navToggle");

  const closeNav = () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Buka menu navigasi");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
    );
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("open")) return;
    if (!nav.contains(event.target) && !navToggle.contains(event.target)) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  /* ---------------------------------------------------------
     2. Header saat scroll + menu aktif
     --------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 12);

    const offset = window.scrollY + window.innerHeight * 0.32;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= offset) current = section;
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        current && link.getAttribute("href") === "#" + current.id
      );
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     3. Animasi reveal
     --------------------------------------------------------- */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     4. Form pemesanan & estimasi biaya
     --------------------------------------------------------- */
  const form = document.getElementById("bookingForm");
  const serviceSelect = document.getElementById("service");
  const sizeSelect = document.getElementById("size");
  const dateInput = document.getElementById("date");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const timeSelect = document.getElementById("time");
  const addressInput = document.getElementById("address");

  const estimateService = document.getElementById("estimateService");
  const estimateBase = document.getElementById("estimateBase");
  const estimateDetail = document.getElementById("estimateDetail");
  const estimateTotal = document.getElementById("estimateTotal");

  const getBasePrice = () => Number(serviceSelect.selectedOptions[0].dataset.base) || 0;
  const getPerRoom = () =>
    Number(serviceSelect.selectedOptions[0].dataset.perRoom) || 0;
  const getExtraRooms = () =>
    Number(sizeSelect.selectedOptions[0].dataset.extra) || 0;
  const getRoomCount = () => Number(sizeSelect.value) || 1;

  const calculateTotal = () => {
    const extraRooms = getExtraRooms();
    return getBasePrice() + getPerRoom() * extraRooms;
  };

  const updateEstimate = () => {
    const base = getBasePrice();
    const perRoom = getPerRoom();
    const extraRooms = getExtraRooms();
    const rooms = getRoomCount();
    const roomLabel = rooms >= 5 ? "5+ kamar" : `${rooms} kamar`;
    const total = base + perRoom * extraRooms;

    estimateService.textContent = `${serviceSelect.selectedOptions[0].text.split(" — ")[0]} · ${roomLabel}`;
    estimateBase.textContent = formatRupiah(total);
    estimateDetail.textContent =
      extraRooms > 0
        ? `${formatRupiah(base)} + ${formatRupiah(perRoom)} × ${extraRooms} kamar tambahan`
        : `${formatRupiah(base)} (harga dasar)`;
    estimateTotal.textContent = formatRupiah(total);

    estimateTotal.classList.remove("bump");
    // Restart animasi singkat tanpa memaksa reflow berlebihan.
    void estimateTotal.offsetWidth;
    estimateTotal.classList.add("bump");
    window.setTimeout(() => estimateTotal.classList.remove("bump"), 220);
  };

  serviceSelect.addEventListener("change", updateEstimate);
  sizeSelect.addEventListener("change", updateEstimate);
  updateEstimate();

  /* Tanggal minimal = hari ini */
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  dateInput.min = todayISO;

  /* Tombol "Pilih layanan" dari kartu layanan & harga */
  document.querySelectorAll("[data-select-service]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.selectService;
      if (!value) return;
      serviceSelect.value = value;
      updateEstimate();
      window.setTimeout(() => {
        if (window.innerWidth < 900) closeNav();
      }, 10);
    });
  });

  /* ---------------------------------------------------------
     5. Validasi & kirim ke WhatsApp
     --------------------------------------------------------- */
  const fields = {
    name: {
      el: nameInput,
      message: "Mohon isi nama lengkap Anda.",
      validate: (value) => value.trim().length >= 2,
    },
    phone: {
      el: phoneInput,
      message: "Masukkan nomor WhatsApp yang valid (contoh: 081234567890).",
      validate: (value) => {
        const digits = value.replace(/[^\d]/g, "");
        return digits.length >= 9 && digits.length <= 15;
      },
    },
    service: {
      el: serviceSelect,
      message: "Pilih jenis layanan.",
      validate: (value) => Boolean(value),
    },
    size: {
      el: sizeSelect,
      message: "Pilih ukuran ruangan.",
      validate: (value) => Boolean(value),
    },
    date: {
      el: dateInput,
      message: "Pilih tanggal kunjungan (hari ini atau setelahnya).",
      validate: (value) => Boolean(value) && value >= todayISO,
    },
    time: {
      el: timeSelect,
      message: "Pilih waktu kunjungan.",
      validate: (value) => Boolean(value),
    },
    address: {
      el: addressInput,
      message: "Alamat terlalu singkat. Sertakan nama jalan dan nomor rumah.",
      validate: (value) => value.trim().length >= 10,
    },
  };

  const setFieldState = (key, isValid) => {
    const field = fields[key];
    const wrapper = field.el.closest(".field");
    const errorBox = form.querySelector(`[data-error-for="${key}"]`);
    wrapper.classList.toggle("invalid", !isValid);
    if (errorBox) errorBox.textContent = isValid ? "" : field.message;
  };

  Object.entries(fields).forEach(([key, field]) => {
    field.el.addEventListener("input", () => {
      if (field.el.closest(".field").classList.contains("invalid")) {
        setFieldState(key, field.validate(field.el.value));
      }
    });
    field.el.addEventListener("change", () => {
      if (field.el.closest(".field").classList.contains("invalid")) {
        setFieldState(key, field.validate(field.el.value));
      }
    });
  });

  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(`${isoDate}T00:00:00`);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const buildMessage = () => {
    const serviceName = serviceSelect.selectedOptions[0].text.split(" — ")[0];
    const sizeText = sizeSelect.selectedOptions[0].text;

    return [
      "Halo BersihKilat! Saya ingin memesan layanan housekeeping.",
      "",
      `Nama: ${nameInput.value.trim()}`,
      `No. WhatsApp: ${phoneInput.value.trim()}`,
      `Layanan: ${serviceName}`,
      `Ukuran: ${sizeText}`,
      `Tanggal: ${formatDate(dateInput.value)}`,
      `Waktu: ${timeSelect.value}`,
      `Alamat: ${addressInput.value.trim()}`,
      "",
      `Estimasi biaya: ${formatRupiah(calculateTotal())}`,
      "",
      "Mohon konfirmasi ketersediaan tim. Terima kasih!",
    ].join("\n");
  };

  const submitButton = form.querySelector(".submit-btn");
  let submitting = false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submitting) return;

    let firstInvalid = null;

    Object.entries(fields).forEach(([key, field]) => {
      const isValid = field.validate(field.el.value);
      setFieldState(key, isValid);
      if (!isValid && !firstInvalid) firstInvalid = field.el;
    });

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.closest(".field").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener");

    const originalHTML = submitButton.innerHTML;
    submitting = true;
    submitButton.disabled = true;
    submitButton.innerHTML = "Membuka WhatsApp…";

    window.setTimeout(() => {
      submitButton.innerHTML = originalHTML;
      submitButton.disabled = false;
      submitting = false;
    }, 2600);
  });

  /* ---------------------------------------------------------
     6. Tahun di footer
     --------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
