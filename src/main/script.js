// ======= Kleine "Datenbank" im Speicher =======

let courses = [];      // { id, name, code, description, sessions: [] }
let currentCourseId;   // id des aktuellen Kurses
let currentSessionId;  // id der aktuellen Session

// Jede Session hat:
// { id, name, week, question, isClosed, responses: [{ rating, comment }] }

// ======= Hilfsfunktionen =======

function $(selector) {
  return document.querySelector(selector);
}

function showView(id) {
  document.querySelectorAll(".view").forEach(function (v) {
    v.classList.remove("active");
  });
  $(id).classList.add("active");
}

// einfache ID-Erzeugung
function makeId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

// ======= AUTH LOGIK (nur Fake, kein echtes Login) =======

function initAuth() {
  const loginForm = $("#login-form");
  const signupCard = $("#signup-card");
  const showSignupBtn = $("#show-signup");
  const backToLoginBtn = $("#back-to-login");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // Direkt zu Courses weiterleiten
    showView("#courses-view");
    renderCourses();
  });

  showSignupBtn.addEventListener("click", function () {
    signupCard.classList.remove("hidden");
  });

  backToLoginBtn.addEventListener("click", function () {
    signupCard.classList.add("hidden");
  });

  $("#signup-form").addEventListener("submit", function (e) {
    e.preventDefault();
    // Nach Signup ebenfalls zu Courses
    showView("#courses-view");
    renderCourses();
  });

  $("#btn-logout").addEventListener("click", function () {
    showView("#auth-view");
  });
}

// ======= COURSES =======

function initCourses() {
  $("#btn-new-course").addEventListener("click", function () {
    openModal("#course-modal");
  });

  $("#course-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const course = {
      id: makeId(),
      name: $("#course-name").value.trim(),
      code: $("#course-code").value.trim(),
      description: $("#course-description").value.trim(),
      sessions: []
    };

    courses.push(course);
    closeModal("#course-modal");
    e.target.reset();
    renderCourses();
  });

  $("#course-sort").addEventListener("change", renderCourses);
}

function renderCourses() {
  const list = $("#course-list");
  list.innerHTML = "";

  if (courses.length === 0) {
    list.classList.add("empty-message");
    list.innerHTML = "<p>No courses yet. Click “Create Course”.</p>";
    return;
  }

  list.classList.remove("empty-message");

  // Sortieren
  const sort = $("#course-sort").value;
  const sorted = courses.slice(); // Kopie

  sorted.sort(function (a, b) {
    if (sort === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (sort === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    if (sort === "sessions-asc") {
      return a.sessions.length - b.sessions.length;
    }
    if (sort === "sessions-desc") {
      return b.sessions.length - a.sessions.length;
    }
    return 0;
  });

  // Karten bauen
  sorted.forEach(function (course) {
    const card = document.createElement("div");
    card.className = "course-card";

    const header = document.createElement("div");
    header.className = "course-header";
    header.innerHTML = `
      <div>
        <strong>${course.name}</strong><br />
        <span class="course-meta">${course.code}</span>
      </div>
      <span class="course-meta">${course.sessions.length} sessions</span>
    `;
    card.appendChild(header);

    if (course.description) {
      const p = document.createElement("p");
      p.textContent = course.description;
      card.appendChild(p);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const btnView = document.createElement("button");
    btnView.className = "btn secondary";
    btnView.textContent = "View Sessions";
    btnView.addEventListener("click", function () {
      openSessions(course.id);
    });

    const btnCreateSession = document.createElement("button");
    btnCreateSession.className = "btn text";
    btnCreateSession.textContent = "Create Session";
    btnCreateSession.addEventListener("click", function () {
      currentCourseId = course.id;
      openModal("#session-modal");
    });

    actions.appendChild(btnView);
    actions.appendChild(btnCreateSession);
    card.appendChild(actions);

    list.appendChild(card);
  });
}

function openSessions(courseId) {
  currentCourseId = courseId;
  const course = courses.find(function (c) {
    return c.id === courseId;
  });

  $("#sessions-course-name").textContent = "Sessions – " + course.name;
  showView("#sessions-view");
  renderSessions();
}

// ======= SESSIONS =======

function initSessions() {
  $("#back-to-courses").addEventListener("click", function () {
    showView("#courses-view");
  });

  $("#btn-new-session").addEventListener("click", function () {
    openModal("#session-modal");
  });

  $("#session-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const course = courses.find(function (c) {
      return c.id === currentCourseId;
    });

    if (!course) return;

    const session = {
      id: makeId(),
      name: $("#session-name").value.trim(),
      week: $("#session-week").value,
      question: $("#session-question").value.trim(),
      isClosed: false,
      responses: []
    };

    course.sessions.push(session);
    closeModal("#session-modal");
    e.target.reset();
    renderSessions();
  });

  $("#back-to-sessions").addEventListener("click", function () {
    showView("#sessions-view");
  });
}

function renderSessions() {
  const list = $("#session-list");
  list.innerHTML = "";

  const course = courses.find(function (c) {
    return c.id === currentCourseId;
  });
  if (!course || course.sessions.length === 0) {
    list.classList.add("empty-message");
    list.innerHTML = "<p>No sessions yet. Click “Create Session”.</p>";
    return;
  }

  list.classList.remove("empty-message");

  course.sessions.forEach(function (s) {
    const card = document.createElement("div");
    card.className = "session-card";

    const header = document.createElement("div");
    header.className = "session-header";

    const namePart = document.createElement("div");
    namePart.innerHTML = `<strong>${s.name}</strong>
      <div class="session-meta">
        Week: ${s.week || "-"} · Status: ${s.isClosed ? "Closed" : "Active"}
      </div>`;

    const countPart = document.createElement("span");
    countPart.className = "session-meta";
    countPart.textContent = s.responses.length + " responses";

    header.appendChild(namePart);
    header.appendChild(countPart);
    card.appendChild(header);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const btnPreview = document.createElement("button");
    btnPreview.className = "btn secondary";
    btnPreview.textContent = s.isClosed ? "Analytics" : "Live View";
    btnPreview.addEventListener("click", function () {
      openLiveView(s.id);
    });

    const btnClose = document.createElement("button");
    btnClose.className = "btn text";
    btnClose.textContent = s.isClosed ? "Reopen" : "Close";
    btnClose.addEventListener("click", function () {
      s.isClosed = !s.isClosed;
      renderSessions();
    });

    actions.appendChild(btnPreview);
    actions.appendChild(btnClose);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

// ======= LIVE VIEW / ANALYTICS =======

function initLiveView() {
  $("#btn-close-session").addEventListener("click", function () {
    const session = getCurrentSession();
    if (!session) return;
    session.isClosed = !session.isClosed;
    this.textContent = session.isClosed ? "Reopen Session" : "Close Session";
    renderLiveView();
    renderSessions();
  });

  $("#feedback-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const session = getCurrentSession();
    if (!session || session.isClosed) return;

    const rating = parseInt($("#fb-rating").value, 10);
    const comment = $("#fb-comment").value.trim();

    session.responses.push({ rating: rating, comment: comment });
    e.target.reset();
    renderLiveView();
    renderSessions();
  });
}

function openLiveView(sessionId) {
  currentSessionId = sessionId;
  const session = getCurrentSession();
  if (!session) return;

  $("#live-session-name").textContent = session.name;
  $("#btn-close-session").textContent = session.isClosed ? "Reopen Session" : "Close Session";

  showView("#live-view");
  renderLiveView();
}

function getCurrentSession() {
  const course = courses.find(function (c) {
    return c.id === currentCourseId;
  });
  if (!course) return null;
  return course.sessions.find(function (s) {
    return s.id === currentSessionId;
  });
}

function renderLiveView() {
  const session = getCurrentSession();
  if (!session) return;

  // Formular deaktivieren, wenn geschlossen
  $("#feedback-form-card").style.opacity = session.isClosed ? "0.5" : "1";
  $("#feedback-form-card").querySelectorAll("input, textarea, button").forEach(function (el) {
    el.disabled = session.isClosed;
  });

  const count = session.responses.length;
  $("#response-count").textContent = count;

  if (count === 0) {
    $("#avg-rating").textContent = "–";
  } else {
    let sum = 0;
    session.responses.forEach(function (r) {
      sum += r.rating;
    });
    const avg = sum / count;
    $("#avg-rating").textContent = avg.toFixed(2);
  }

  const list = $("#comment-list");
  list.innerHTML = "";
  session.responses.forEach(function (r) {
    if (!r.comment) return;
    const li = document.createElement("li");
    li.textContent = "“" + r.comment + "”";
    list.appendChild(li);
  });
}

// ======= MODAL HILFSFUNKTIONEN =======

function openModal(id) {
  document.querySelector(id).classList.remove("hidden");
}

function closeModal(id) {
  document.querySelector(id).classList.add("hidden");
}

// Klick auf Hintergrund schließt Modal
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-backdrop")) {
    closeModal("#course-modal");
    closeModal("#session-modal");
  }
  if (e.target.matches("[data-close-modal]")) {
    closeModal("#course-modal");
    closeModal("#session-modal");
  }
});

// ======= INITIALISIERUNG =======

document.addEventListener("DOMContentLoaded", function () {
  initAuth();
  initCourses();
  initSessions();
  initLiveView();
});
