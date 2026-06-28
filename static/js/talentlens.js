/* ==========================================================
   TalentLens — interactions
   Scroll-reveal · word stagger · dropzone · magnetic buttons
   ========================================================== */

(() => {
  "use strict";

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          // stagger by sibling index within parent
          const siblings = Array.from(e.target.parentElement?.querySelectorAll("[data-reveal]") || []);
          const idx = siblings.indexOf(e.target);
          e.target.style.transitionDelay = `${Math.min(idx, 6) * 80}ms`;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- Hero word stagger ---------- */
  document.querySelectorAll(".reveal-word").forEach((el, i) => {
    setTimeout(() => el.classList.add("is-visible"), 200 + i * 110);
  });

  /* ---------- Magnetic buttons with enhanced tracking ---------- */
  document.querySelectorAll(".magnetic").forEach((btn) => {
    let mouseX = 0, mouseY = 0, elementX = 0, elementY = 0;
    const r = btn.getBoundingClientRect();
    
    btn.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const rect = btn.getBoundingClientRect();
      const x = mouseX - rect.left - rect.width / 2;
      const y = mouseY - rect.top - rect.height / 2;
      elementX = x * 0.22;
      elementY = y * 0.3;
      btn.style.transform = `translate(${elementX}px, ${elementY}px) scale(1.02)`;
    });
    
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0, 0) scale(1)";
    });
  });

  /* ---------- Button glow effect tracking ---------- */
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      btn.style.setProperty("--mx", `${mx}px`);
      btn.style.setProperty("--my", `${my}px`);
    });
  });

  /* ---------- Dropzone ---------- */
  const dropzone = document.getElementById("dropzone");
  const input = document.getElementById("resume-file");
  const browseBtn = document.getElementById("browse-btn");
  const meta = document.getElementById("file-meta");
  const nameEl = document.getElementById("file-name");
  const sizeEl = document.getElementById("file-size");
  const removeBtn = document.getElementById("remove-file");
  const analyzeBtn = document.getElementById("analyze-btn");
  const form = document.getElementById("upload-form");

  if (dropzone) {
    // Enhanced cursor-follow gradient with smooth easing
    let mouseMoveTimer;
    dropzone.addEventListener("mousemove", (e) => {
      const r = dropzone.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      
      // Smooth easing on gradient position
      const currentMx = parseFloat(dropzone.style.getPropertyValue("--mx") || r.width / 2);
      const currentMy = parseFloat(dropzone.style.getPropertyValue("--my") || r.height / 2);
      
      dropzone.style.setProperty("--mx", `${currentMx + (mx - currentMx) * 0.15}px`);
      dropzone.style.setProperty("--my", `${currentMy + (my - currentMy) * 0.15}px`);
    });

    const setFile = (file) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large — max 10MB.");
        return;
      }
      // Sync into the file input via DataTransfer so it submits with the form
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;

      nameEl.textContent = file.name;
      sizeEl.textContent = `${(file.size / 1024).toFixed(0)} KB`;
      meta.classList.remove("hidden");
      analyzeBtn.disabled = false;
    };

    browseBtn?.addEventListener("click", () => input.click());
    input?.addEventListener("change", (e) => setFile(e.target.files[0]));

    ["dragenter", "dragover"].forEach((ev) =>
      dropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropzone.classList.add("is-dragover");
      })
    );
    ["dragleave", "drop"].forEach((ev) =>
      dropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropzone.classList.remove("is-dragover");
      })
    );
    dropzone.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      setFile(file);
    });

    removeBtn?.addEventListener("click", () => {
      input.value = "";
      meta.classList.add("hidden");
      analyzeBtn.disabled = true;
    });
  }

  /* ---------- Submit state (spinner) ---------- */
  if (form) {
    form.addEventListener("submit", () => {
      analyzeBtn.classList.add("is-loading");
      analyzeBtn.disabled = true;
    });
  }

  /* ---------- Animated counters with easing (results page) ---------- */
  document.querySelectorAll("[data-counter]").forEach((el) => {
    const target = parseInt(el.dataset.target || "0", 10);
    const start = performance.now();
    const dur = 1800; // Increased duration for smoother feel
    // Cubic easing function for smoother animation
    const ease = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * ease(p));
      el.parentElement?.classList.add('glow-effect');
      if (p < 1) requestAnimationFrame(tick);
      else el.parentElement?.classList.remove('glow-effect');
    };
    // Trigger when visible with smooth timing
    new IntersectionObserver(
      (ents, obs) => {
        ents.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => requestAnimationFrame(tick), 100);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    ).observe(el);
  });

  /* ---------- Copy buttons with enhanced feedback (results page) ---------- */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      try {
        e.preventDefault();
        await navigator.clipboard.writeText(btn.dataset.copy || "");
        const orig = btn.textContent;
        const origBg = btn.style.background;
        
        btn.textContent = "✓ Copied!";
        btn.classList.add("is-copied");
        btn.style.transform = "scale(1.05)";
        
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove("is-copied");
          btn.style.transform = "scale(1)";
        }, 2000);
      } catch (err) {
        console.error(err);
        btn.textContent = "Failed to copy";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 1500);
      }
    });
  });

  /* ---------- Parallax aurora on mouse ---------- */
  const blobs = document.querySelectorAll(".aurora__blob");
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    blobs.forEach((b, i) => {
      const f = (i + 1) * 8;
      b.style.translate = `${x * f}px ${y * f}px`;
    });
  });
})();
