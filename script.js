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

  const projects = publicRepos.length
    ? publicRepos
    : [...projectGrid.querySelectorAll(".project-card")];
  const technologyCounts = new Map();

  projects.forEach((project) => {
    const technologies = new Set(project.name
      ? getRepositoryTechnologies(project)
      : [...project.querySelectorAll(".project-footer .tags span")]
        .map((tag) => tag.textContent.trim())
        .filter(Boolean));

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
    summary.textContent = "Belum ada data teknologi dari repo publik.";
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
    total.textContent = `${count} repo`;

    row.setAttribute("aria-label", `${label}: digunakan di ${count} dari ${projects.length} repo publik`);
    row.append(name, track, total);
    chart.append(row);
  });

  summary.textContent = `Dihitung dari ${projects.length} repo publik.`;
}

let scrollRevealObserver;

function initScrollAnimations() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) return;

  if (!scrollRevealObserver) {
    scrollRevealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
  }

  document.querySelectorAll(
    ".hero-copy, .hero-card, .about-grid > div, .skill-card, .skill-chart-panel, .project-card, .contact-row > *"
  ).forEach((target) => {
    if (target.classList.contains("reveal-on-scroll")) return;
    target.classList.add("reveal-on-scroll");
    scrollRevealObserver.observe(target);
  });
}

function initDraggableProfile() {
  const card = document.querySelector(".hero-card");
  const hero = document.querySelector(".hero");
  if (!card || !hero) return;

  let pointerStartX = 0;
  let pointerStartY = 0;
  let offsetStartX = 0;
  let offsetStartY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const applyPosition = (tiltX = 0, tiltY = 0) => {
    card.style.setProperty("--profile-x", `${offsetX}px`);
    card.style.setProperty("--profile-y", `${offsetY}px`);
    card.style.setProperty("--profile-rotate-x", `${tiltX}deg`);
    card.style.setProperty("--profile-rotate-y", `${tiltY}deg`);
  };

  const moveBy = (x, y) => {
    const heroRect = hero.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const baseLeft = cardRect.left - offsetX;
    const baseTop = cardRect.top - offsetY;
    const minX = heroRect.left + 8 - baseLeft;
    const maxX = heroRect.right - cardRect.width - 8 - baseLeft;
    const minY = heroRect.top + 8 - baseTop;
    const maxY = heroRect.bottom - cardRect.height - 8 - baseTop;
    offsetX = Math.min(maxX, Math.max(minX, x));
    offsetY = Math.min(maxY, Math.max(minY, y));
    applyPosition();
  };

  card.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("a, button")) return;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    offsetStartX = offsetX;
    offsetStartY = offsetY;
    isDragging = true;
    card.classList.add("is-dragging");
    card.setPointerCapture(event.pointerId);
  });

  card.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      if (reduceMotion || event.pointerType === "touch") return;
      const bounds = card.getBoundingClientRect();
      const tiltY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 7;
      const tiltX = (0.5 - (event.clientY - bounds.top) / bounds.height) * 7;
      applyPosition(tiltX, tiltY);
      return;
    }

    moveBy(
      offsetStartX + event.clientX - pointerStartX,
      offsetStartY + event.clientY - pointerStartY
    );
  });

  const finishDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove("is-dragging");
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
    applyPosition();
  };

  card.addEventListener("pointerup", finishDrag);
  card.addEventListener("pointercancel", finishDrag);
  card.addEventListener("pointerleave", () => {
    if (!isDragging) applyPosition();
  });
  card.addEventListener("keydown", (event) => {
    const directions = {
      ArrowLeft: [-12, 0],
      ArrowRight: [12, 0],
      ArrowUp: [0, -12],
      ArrowDown: [0, 12]
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    moveBy(offsetX + direction[0], offsetY + direction[1]);
  });

  window.addEventListener("resize", () => {
    offsetX = 0;
    offsetY = 0;
    applyPosition();
  });
}

const projectGrid = document.querySelector(".project-grid");
const projectStatus = document.getElementById("projectStatus");
const projectNote = document.querySelector(".project-note");
const githubStatus = document.getElementById("githubStatus");
const repoCount = document.getElementById("repoCount");
const starCount = document.getElementById("starCount");
const previousProjects = document.getElementById("previousProjects");
const nextProjects = document.getElementById("nextProjects");
const projectPageIndicator = document.getElementById("projectPageIndicator");
const projectsPerPage = 3;
let publicRepos = [];
let currentProjectPage = 0;

const projectHighlights = {
  "sistem-berita-acara": {
    title: "Sistem Berita Acara",
    description: "Aplikasi Laravel untuk mengelola berita acara verifikasi nasabah, dengan approval berjenjang, tanda tangan digital, notifikasi, dan ekspor PDF.",
    technologies: ["Laravel", "PHP", "MySQL"]
  },
  "absen-attendly": {
    title: "Attendly",
    description: "Prototipe absensi dengan aplikasi Flutter dan API Laravel untuk login, check-in/out, riwayat, dan pengajuan.",
    technologies: ["Laravel", "Flutter"]
  },
  "log-activity": {
    title: "Log Activity",
    description: "Aplikasi Laravel dengan laporan bulanan dan pembuatan PDF, termasuk format cover serta nomor halaman.",
    technologies: ["Laravel", "PHP"]
  }
};

function getRepositoryTechnologies(repo) {
  const highlight = projectHighlights[repo.name];
  if (highlight) return highlight.technologies;
  return repo.language ? [repo.language] : [];
}

function createProjectCard(repo, index) {
  const highlight = projectHighlights[repo.name];
  const card = document.createElement("article");
  card.className = "project-card";

  const meta = document.createElement("div");
  meta.className = "project-meta";
  const language = document.createElement("span");
  language.textContent = repo.language || "REPOSITORI PUBLIK";
  const number = document.createElement("span");
  number.textContent = `${String(index + 1).padStart(2, "0")} / ${String(repo.totalCount).padStart(2, "0")}`;
  meta.append(language, number);

  const art = document.createElement("div");
  art.className = `project-art art-${["blue", "orange", "green"][index % 3]}`;
  art.setAttribute("aria-hidden", "true");
  const mark = document.createElement("span");
  mark.className = "repo-art-mark";
  mark.textContent = repo.name.slice(0, 2).toUpperCase();
  art.append(mark);

  const title = document.createElement("h3");
  title.textContent = highlight?.title || repo.name;
  const description = document.createElement("p");
  description.textContent = highlight?.description
    || repo.description
    || `Repositori publik${repo.language ? ` dengan bahasa utama ${repo.language}` : ""}.`;

  const footer = document.createElement("div");
  footer.className = "project-footer";
  const tags = document.createElement("div");
  tags.className = "tags";
  (highlight?.technologies || (repo.language ? [repo.language] : [])).forEach((technology) => {
    const tag = document.createElement("span");
    tag.textContent = technology;
    tags.append(tag);
  });
  footer.append(tags);
  card.append(meta, art, title, description, footer);
  return card;
}

function renderProjectPage() {
  if (!projectGrid) return;

  const pageCount = Math.max(1, Math.ceil(publicRepos.length / projectsPerPage));
  currentProjectPage = Math.min(currentProjectPage, pageCount - 1);
  const firstIndex = currentProjectPage * projectsPerPage;
  const visibleRepos = publicRepos.slice(firstIndex, firstIndex + projectsPerPage);

  projectGrid.replaceChildren(...visibleRepos.map((repo, index) => createProjectCard(
    { ...repo, totalCount: publicRepos.length },
    firstIndex + index
  )));
  if (previousProjects) previousProjects.disabled = currentProjectPage === 0;
  if (nextProjects) nextProjects.disabled = currentProjectPage >= pageCount - 1;
  if (projectPageIndicator) {
    projectPageIndicator.textContent = `Halaman ${currentProjectPage + 1} / ${pageCount}`;
  }
  if (projectStatus) {
    if (publicRepos.length === 0) {
      projectStatus.textContent = "Belum ada repositori publik.";
    } else {
      const lastIndex = Math.min(firstIndex + visibleRepos.length, publicRepos.length);
      projectStatus.textContent = `Menampilkan ${firstIndex + 1}–${lastIndex} dari ${publicRepos.length} repo publik.`;
    }
  }
  updateSkillChart();
  initScrollAnimations();
}

if (previousProjects) {
  previousProjects.addEventListener("click", () => {
    if (currentProjectPage === 0) return;
    currentProjectPage -= 1;
    renderProjectPage();
  });
}

if (nextProjects) {
  nextProjects.addEventListener("click", () => {
    if (currentProjectPage >= Math.ceil(publicRepos.length / projectsPerPage) - 1) return;
    currentProjectPage += 1;
    renderProjectPage();
  });
}

async function fetchPublicRepos() {
  const repos = [];
  let page = 1;
  try {
    while (true) {
      const response = await fetch(
        `https://api.github.com/users/dkrmd1/repos?type=owner&sort=updated&per_page=100&page=${page}`,
        { cache: "no-store" }
      );
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

      const pageRepos = await response.json();
      if (!Array.isArray(pageRepos)) throw new Error("GitHub API returned an unexpected response");
      repos.push(...pageRepos);
      if (pageRepos.length < 100) break;
      page += 1;
    }

    publicRepos = repos.filter((repo) => repo && repo.private === false);
    publicRepos.sort((first, second) => new Date(second.updated_at) - new Date(first.updated_at));
    renderProjectPage();

    if (repoCount) repoCount.textContent = String(publicRepos.length);
    if (starCount) {
      starCount.textContent = String(publicRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0));
    }
    if (githubStatus) githubStatus.textContent = "Statistik hanya dari repositori publik.";
    if (projectNote) {
      projectNote.textContent = "Daftar diperbarui otomatis saat halaman dibuka. Hanya repositori publik yang dimuat; repositori private tidak diakses atau ditampilkan.";
    }
  } catch (error) {
    console.error("Tidak dapat memuat repositori publik:", error);
    if (githubStatus) githubStatus.textContent = "Statistik repo publik belum tersedia.";
    if (projectStatus) projectStatus.textContent = "Daftar repo publik belum dapat diperbarui.";
    if (projectNote) {
      projectNote.textContent = "Daftar otomatis tidak tersedia saat ini. Kartu proyek yang tampil adalah pilihan publik yang tersimpan di halaman.";
    }
  }
}

updateSkillChart();
initScrollAnimations();
initDraggableProfile();
fetchPublicRepos();
