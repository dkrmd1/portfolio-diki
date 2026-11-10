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

const projectGrid = document.querySelector(".project-grid");
const projectStatus = document.getElementById("projectStatus");
const projectNote = document.querySelector(".project-note");
const githubStatus = document.getElementById("githubStatus");
const repoCount = document.getElementById("repoCount");
const starCount = document.getElementById("starCount");

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

    const publicRepos = repos.filter((repo) => repo && repo.private === false);
    publicRepos.sort((first, second) => new Date(second.updated_at) - new Date(first.updated_at));
    if (projectGrid) {
      projectGrid.replaceChildren(...publicRepos.map((repo, index) => createProjectCard(
        { ...repo, totalCount: publicRepos.length },
        index
      )));
      initScrollAnimations();
    }

    if (repoCount) repoCount.textContent = String(publicRepos.length);
    if (starCount) {
      starCount.textContent = String(publicRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0));
    }
    if (githubStatus) githubStatus.textContent = "Statistik hanya dari repositori publik.";
    if (projectStatus) {
      projectStatus.textContent = `${publicRepos.length} repositori publik ditampilkan.`;
    }
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
if (projectGrid) {
  const projectObserver = new MutationObserver(updateSkillChart);
  projectObserver.observe(projectGrid, { childList: true, subtree: true, characterData: true });
}
fetchPublicRepos();
