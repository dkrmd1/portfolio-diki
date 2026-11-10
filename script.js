const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Buka menu navigasi");
    });
  });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

function updateSkillChart() {
  const projectGrid = document.querySelector(".project-grid");
  const chart = document.getElementById("skillChart");
  const summary = document.getElementById("skillChartSummary");
  if (!projectGrid || !chart || !summary) return;

  const projects = [...projectGrid.querySelectorAll(".project-card")];
  const technologyCounts = new Map();

  projects.forEach((project) => {
    const technologies = new Set(
      [...project.querySelectorAll(".project-footer .tags span")]
        .map((tag) => tag.textContent.trim())
        .filter(Boolean)
    );

    technologies.forEach((technology) => {
      const key = technology.toLocaleLowerCase();
      const current = technologyCounts.get(key);
      technologyCounts.set(key, {
        label: current?.label || technology,
        count: (current?.count || 0) + 1
      });
    });
  });

  chart.replaceChildren();
  if (projects.length === 0 || technologyCounts.size === 0) {
    summary.textContent = "Belum ada data teknologi dari proyek pilihan.";
    return;
  }

  const technologies = [...technologyCounts.values()].sort(
    (first, second) => second.count - first.count || first.label.localeCompare(second.label)
  );

  technologies.forEach(({ label, count }) => {
    const row = document.createElement("div");
    row.className = "skill-chart-row";
    row.setAttribute("role", "listitem");

    const name = document.createElement("span");
    name.className = "skill-chart-name";
    name.textContent = label;

    const track = document.createElement("span");
    track.className = "skill-chart-track";
    track.setAttribute("aria-hidden", "true");

    const bar = document.createElement("span");
    bar.className = "skill-chart-bar";
    bar.style.setProperty("--bar-width", `${(count / projects.length) * 100}%`);
    track.append(bar);

    const total = document.createElement("span");
    total.className = "skill-chart-count";
    total.textContent = `${count} proyek`;

    row.setAttribute("aria-label", `${label}: digunakan di ${count} dari ${projects.length} proyek`);
    row.append(name, track, total);
    chart.append(row);
  });

  summary.textContent = `Dihitung dari ${projects.length} proyek pilihan.`;
}

function initScrollAnimations() {
  const targets = document.querySelectorAll(
    ".hero-copy, .hero-card, .about-grid > div, .skill-card, .skill-chart-panel, .project-card, .contact-row > *"
  );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

  targets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    observer.observe(target);
  });
}

updateSkillChart();
initScrollAnimations();

const projectGrid = document.querySelector(".project-grid");
if (projectGrid) {
  const projectObserver = new MutationObserver(updateSkillChart);
  projectObserver.observe(projectGrid, { childList: true, subtree: true, characterData: true });
}

async function loadGitHubStats() {
  const status = document.getElementById("githubStatus");
  const repoCount = document.getElementById("repoCount");
  const starCount = document.getElementById("starCount");

  try {
    const response = await fetch("https://api.github.com/users/dkrmd1/repos?type=owner&sort=updated&per_page=100");
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

    const repos = await response.json();
    if (!Array.isArray(repos)) throw new Error("GitHub API returned an unexpected response");

    const originals = repos.filter((repo) => !repo.fork);
    repoCount.textContent = String(originals.length);
    starCount.textContent = String(originals.reduce((sum, repo) => sum + repo.stargazers_count, 0));
    status.textContent = "Statistik dari repositori publik GitHub.";
  } catch (error) {
    console.error("Tidak dapat memuat statistik GitHub:", error);
    status.textContent = "Statistik belum tersedia. Kunjungi GitHub untuk melihat repositori terbaru.";
  }
}

loadGitHubStats();
