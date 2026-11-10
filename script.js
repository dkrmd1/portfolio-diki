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

function initSnakeGame() {
  const canvas = document.getElementById("snakeCanvas");
  const scoreElement = document.getElementById("snakeScore");
  const bestElement = document.getElementById("snakeBest");
  const status = document.getElementById("snakeStatus");
  const startButton = document.getElementById("snakeStart");
  const pauseButton = document.getElementById("snakePause");
  const resetButton = document.getElementById("snakeReset");
  if (!canvas || !scoreElement || !bestElement || !status || !startButton || !pauseButton || !resetButton) return;

  const context = canvas.getContext("2d");
  if (!context) {
    status.textContent = "Game tidak dapat dimuat di browser ini.";
    startButton.disabled = true;
    return;
  }

  const cellSize = 20;
  const columns = canvas.width / cellSize;
  const rows = canvas.height / cellSize;
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  let snake;
  let direction;
  let nextDirection;
  let food;
  let score = 0;
  let best = 0;
  let timer = null;
  let isRunning = false;
  let hasStarted = false;

  const placeFood = () => {
    let candidate;
    do {
      candidate = {
        x: Math.floor(Math.random() * columns),
        y: Math.floor(Math.random() * rows)
      };
    } while (snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y));
    return candidate;
  };

  const draw = () => {
    context.fillStyle = "#101b2c";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(133, 171, 199, .09)";
    context.lineWidth = 1;
    for (let x = 0; x <= columns; x += 1) {
      context.beginPath();
      context.moveTo(x * cellSize + .5, 0);
      context.lineTo(x * cellSize + .5, canvas.height);
      context.stroke();
    }
    for (let y = 0; y <= rows; y += 1) {
      context.beginPath();
      context.moveTo(0, y * cellSize + .5);
      context.lineTo(canvas.width, y * cellSize + .5);
      context.stroke();
    }

    context.fillStyle = "#ffca62";
    context.shadowColor = "#ffca62";
    context.shadowBlur = 12;
    context.beginPath();
    context.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize * .31, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    snake.forEach((segment, index) => {
      const inset = index === 0 ? 2 : 3;
      context.fillStyle = index === 0 ? "#52e0bd" : "#31b993";
      context.beginPath();
      context.roundRect(
        segment.x * cellSize + inset,
        segment.y * cellSize + inset,
        cellSize - inset * 2,
        cellSize - inset * 2,
        5
      );
      context.fill();
    });

    const head = snake[0];
    const eyeOffset = direction.x === 0 ? 5 : 0;
    const eyeOffsetY = direction.y === 0 ? 5 : 0;
    const eyeX = head.x * cellSize + cellSize / 2 + direction.x * 4 + eyeOffset;
    const eyeY = head.y * cellSize + cellSize / 2 + direction.y * 4 + eyeOffsetY;
    context.fillStyle = "#102034";
    context.beginPath();
    context.arc(eyeX - (direction.x === 0 ? 4 : 0), eyeY - (direction.y === 0 ? 4 : 0), 1.7, 0, Math.PI * 2);
    context.arc(eyeX + (direction.x === 0 ? 4 : 0), eyeY + (direction.y === 0 ? 4 : 0), 1.7, 0, Math.PI * 2);
    context.fill();
  };

  const reset = () => {
    window.clearInterval(timer);
    timer = null;
    isRunning = false;
    hasStarted = false;
    score = 0;
    direction = directions.right;
    nextDirection = directions.right;
    snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
    food = placeFood();
    scoreElement.textContent = "0";
    startButton.disabled = false;
    startButton.innerHTML = 'Mulai game <span aria-hidden="true">▶</span>';
    pauseButton.disabled = true;
    pauseButton.textContent = "Jeda";
    status.textContent = "Tekan Mulai untuk bermain.";
    draw();
  };

  const finish = () => {
    window.clearInterval(timer);
    timer = null;
    isRunning = false;
    hasStarted = false;
    startButton.disabled = false;
    startButton.innerHTML = 'Main lagi <span aria-hidden="true">↻</span>';
    pauseButton.disabled = true;
    status.textContent = `Game selesai! Skor kamu ${score}. Tekan Main lagi untuk mencoba kembali.`;
  };

  const tick = () => {
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const eatsFood = head.x === food.x && head.y === food.y;
    const body = eatsFood ? snake : snake.slice(0, -1);
    if (
      head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows
      || body.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      finish();
      draw();
      return;
    }

    snake.unshift(head);
    if (eatsFood) {
      score += 10;
      best = Math.max(best, score);
      scoreElement.textContent = String(score);
      bestElement.textContent = String(best);
      food = placeFood();
      status.textContent = `Byte didapat! Skor ${score}.`;
    } else {
      snake.pop();
    }
    draw();
  };

  const setDirection = (name) => {
    const requested = directions[name];
    if (!requested || (requested.x + direction.x === 0 && requested.y + direction.y === 0)) return;
    nextDirection = requested;
  };

  canvas.addEventListener("keydown", (event) => {
    const keys = {
      ArrowUp: "up", w: "up", W: "up",
      ArrowDown: "down", s: "down", S: "down",
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right"
    };
    const requested = keys[event.key];
    if (!requested) return;
    event.preventDefault();
    setDirection(requested);
  });

  document.querySelectorAll(".snake-direction").forEach((button) => {
    button.addEventListener("click", () => {
      setDirection(button.dataset.direction);
      canvas.focus({ preventScroll: true });
    });
  });

  startButton.addEventListener("click", () => {
    if (isRunning) return;
    if (timer === null && status.textContent.startsWith("Game selesai!")) reset();
    isRunning = true;
    hasStarted = true;
    startButton.disabled = true;
    pauseButton.disabled = false;
    status.textContent = "Game berjalan. Arahkan cacing ke byte!";
    timer = window.setInterval(tick, 125);
    canvas.focus({ preventScroll: true });
  });

  pauseButton.addEventListener("click", () => {
    if (!isRunning) {
      if (!hasStarted) return;
      isRunning = true;
      timer = window.setInterval(tick, 125);
      pauseButton.textContent = "Jeda";
      status.textContent = "Game dilanjutkan.";
      return;
    }
    isRunning = false;
    window.clearInterval(timer);
    timer = null;
    pauseButton.textContent = "Lanjut";
    status.textContent = "Game dijeda.";
  });

  resetButton.addEventListener("click", reset);
  reset();
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
const skillChart = document.getElementById("skillChart");
const skillChartSummary = document.getElementById("skillChartSummary");
const projectsPerPage = 3;
let publicRepos = [];
let currentProjectPage = 0;
const privateRepos = ["notarisapp", "nexus-rabbit", "rental-mobil"].map((name) => ({
  name,
  private: true
}));

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

function renderSkillChart() {
  if (!skillChart) return;

  const technologyCounts = new Map();
  publicRepos.forEach((repo) => {
    new Set(getRepositoryTechnologies(repo)).forEach((technology) => {
      technologyCounts.set(technology, (technologyCounts.get(technology) || 0) + 1);
    });
  });

  const topTechnologies = [...technologyCounts.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, 6);
  if (skillChartSummary) {
    skillChartSummary.textContent = `${publicRepos.length} repo publik · repo private tidak dihitung`;
  }
  if (topTechnologies.length === 0) {
    skillChart.replaceChildren();
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "skill-chart-empty";
    emptyMessage.textContent = "Grafik akan tampil saat data repo publik tersedia.";
    skillChart.append(emptyMessage);
    return;
  }

  const maximum = topTechnologies[0][1];
  skillChart.replaceChildren(...topTechnologies.map(([technology, count]) => {
    const row = document.createElement("div");
    row.className = "skill-chart-row";
    row.setAttribute("role", "listitem");
    const label = document.createElement("span");
    label.className = "skill-chart-label";
    label.textContent = technology;
    const track = document.createElement("span");
    track.className = "skill-chart-track";
    const bar = document.createElement("span");
    bar.className = "skill-chart-bar";
    bar.style.width = `${Math.max(12, (count / maximum) * 100)}%`;
    track.append(bar);
    const value = document.createElement("span");
    value.className = "skill-chart-value";
    value.textContent = String(count);
    row.append(label, track, value);
    return row;
  }));
}

function createProjectCard(repo, index) {
  const highlight = projectHighlights[repo.name];
  const card = document.createElement("article");
  card.className = repo.private ? "project-card private-project-card" : "project-card";

  const meta = document.createElement("div");
  meta.className = "project-meta";
  const language = document.createElement("span");
  language.textContent = repo.private ? "REPO PRIVATE" : repo.language || "REPOSITORI PUBLIK";
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
  description.textContent = repo.private
    ? "Repositori private. Hanya nama yang ditampilkan; detail dan kode tidak dibagikan."
    : highlight?.description
      || repo.description
      || `Repositori publik${repo.language ? ` dengan bahasa utama ${repo.language}` : ""}.`;

  const footer = document.createElement("div");
  footer.className = "project-footer";
  const tags = document.createElement("div");
  tags.className = "tags";
  (repo.private ? [] : highlight?.technologies || (repo.language ? [repo.language] : [])).forEach((technology) => {
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

  const allRepos = [...publicRepos, ...privateRepos];
  const pageCount = Math.max(1, Math.ceil(allRepos.length / projectsPerPage));
  currentProjectPage = Math.min(currentProjectPage, pageCount - 1);
  const firstIndex = currentProjectPage * projectsPerPage;
  const visibleRepos = allRepos.slice(firstIndex, firstIndex + projectsPerPage);

  projectGrid.replaceChildren(...visibleRepos.map((repo, index) => createProjectCard(
    { ...repo, totalCount: allRepos.length },
    firstIndex + index
  )));
  if (previousProjects) previousProjects.disabled = currentProjectPage === 0;
  if (nextProjects) nextProjects.disabled = currentProjectPage >= pageCount - 1;
  if (projectPageIndicator) {
    projectPageIndicator.textContent = `Halaman ${currentProjectPage + 1} / ${pageCount}`;
  }
  if (projectStatus) {
    if (allRepos.length === 0) {
      projectStatus.textContent = "Belum ada repositori untuk ditampilkan.";
    } else {
      const lastIndex = Math.min(firstIndex + visibleRepos.length, allRepos.length);
      projectStatus.textContent = `Menampilkan ${firstIndex + 1}–${lastIndex} dari ${allRepos.length} repo (${publicRepos.length} publik, ${privateRepos.length} private).`;
    }
  }
  renderSkillChart();
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
    if (currentProjectPage >= Math.ceil((publicRepos.length + privateRepos.length) / projectsPerPage) - 1) return;
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
      projectNote.textContent = "Repo publik diperbarui otomatis. Untuk repo private, hanya nama yang ditampilkan sesuai permintaan; deskripsi, kode, dan tautan tidak disertakan.";
    }
  } catch (error) {
    console.error("Tidak dapat memuat repositori publik:", error);
    if (githubStatus) githubStatus.textContent = "Statistik repo publik belum tersedia.";
    renderProjectPage();
    if (projectNote) {
      projectNote.textContent = "Daftar repo publik belum dapat diperbarui. Nama repo private yang telah ditambahkan tetap ditampilkan.";
    }
  }
}

initSnakeGame();
initScrollAnimations();
initDraggableProfile();
fetchPublicRepos();
