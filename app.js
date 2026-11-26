const KEY = "campusfix-demo-reports";

const $ = id => document.getElementById(id);

const form = $("reportForm");
const admin = $("admin");
const toast = $("toast");

function reports() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function notify(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function render() {
  const all = reports();

  const approved = all.filter(x => x.decision === "APPROVE");
  const review = all.filter(x =>
    ["CLARIFY", "QUARANTINE"].includes(x.decision)
  );
  const urgent = all.filter(x => x.decision === "ESCALATE");

  $("total").textContent = all.length;
  $("approved").textContent = approved.length;
  $("review").textContent = review.length;
  $("urgent").textContent = urgent.length;

  $("list").innerHTML = all.length
    ? all.slice().reverse().map(x => `
      <div class="item">
        <div>
          <b>${esc(x.category)} · ${esc(x.location)}</b>
          <p>${esc(x.message)}</p>
          <p>
            By ${esc(x.student)} · ${esc(x.reason)}
            ${x.duplicate ? " · Possible duplicate" : ""}
          </p>
          <p>Assigned team: ${esc(x.suggestedTeam || "Pending")}</p>
        </div>
        <span class="pill">${esc(x.decision)}</span>
      </div>
    `).join("")
    : "No submissions yet. Try the student report form.";
}

$("message").addEventListener("input", e => {
  $("count").textContent = e.target.value.length + " / 1200";
});

// REAL TEFI AI CONNECTION
form.addEventListener("submit", async e => {
  e.preventDefault();

  if (!form.reportValidity()) return;

  const button = form.querySelector('[type="submit"]');

  button.disabled = true;
  button.textContent = "Tefi is inspecting...";

  try {
    const old = reports();

    const r = {
      student: $("student").value.trim(),
      category: $("category").value,
      location: $("location").value.trim(),
      message: $("message").value.trim(),
      time: new Date().toLocaleString()
    };

    const response = await fetch("/api/inspect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        category: r.category,
        location: r.location,
        message: r.message
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Tefi inspection failed.");
    }

    const duplicate = old.some(x =>
      x.location.toLowerCase() === r.location.toLowerCase() &&
      x.category === r.category &&
      x.decision !== "QUARANTINE"
    );

    const report = {
      ...r,
      ...result,
      duplicate
    };

    old.push(report);

    localStorage.setItem(KEY, JSON.stringify(old));

    form.reset();

    $("count").textContent = "0 / 1200";

    notify("Tefi AI decision: " + result.decision);

    if (!admin.hidden) render();

  } catch (error) {
    console.error("Tefi error:", error);
    notify(error.message || "Unable to contact Tefi AI.");
  } finally {
    button.disabled = false;
    button.textContent = "Submit Report";
  }
});

function openAdmin() {
  admin.hidden = false;
  render();
  admin.scrollIntoView({ behavior: "smooth" });
}

$("adminOpen").addEventListener("click", openAdmin);

$("adminClose").addEventListener("click", () => {
  admin.hidden = true;
  $("report").scrollIntoView({ behavior: "smooth" });
});

$("hamb").addEventListener("click", () =>
  $("navlinks").classList.toggle("open")
);

document.querySelectorAll("#navlinks a").forEach(a =>
  a.addEventListener("click", () =>
    $("navlinks").classList.remove("open")
  )
);
