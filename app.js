(() => {
  const storageKey = "campus-stores.shift.v1";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const dueTimes = ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"];
  // Minutes from Friday midnight, so slips can be compared with desk time.
  const dueAt = {
    "Fri 8 pm": 20 * 60,
    "Sat 9 am": 33 * 60,
    "Sat 10 am": 34 * 60,
    "Sat noon": 36 * 60,
  };
  const phaseAt = [15 * 60 + 45, 19 * 60 + 30, 33 * 60];
  const tagOf = (x) =>
    String(x || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
  // Working copy of the "Issue kit" form, so a repaint keeps what was chosen.
  const blankDraft = (req = "") => ({
    req,
    who: "",
    due: getReq(req) ? getReq(req).due : "",
    units: {},
    error: "",
  });
  // Transient slip-panel state: which slip has a form open and its messages.
  const idleReturn = () => ({
    stillOut: 0,
    returning: 0,
    retTag: "",
    retError: "",
    lookup: "",
    lookupMsg: "",
  });
  const original = () => ({
    version: 1,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    draft: blankDraft(),
    ...idleReturn(),
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, selected = "") =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === selected ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' +
    (good === true ? " good" : good ? " " + good : "") +
    '">' +
    esc(t) +
    "</span>";
  // Where an open slip stands against the desk clock.
  function timing(l) {
    const now = phaseAt[s.phase];
    const due = dueAt[l.due];
    const expect = l.expect ? dueAt[l.expect] : due;
    if (now > due) {
      const late = ["Overdue since " + l.due, "late"];
      if (!l.expect || expect === due) return { rank: 0, at: due, tags: [late] };
      if (now >= expect)
        return {
          rank: 0,
          at: expect,
          tags: [late, [expect === now ? "Expected now" : "Promised " + l.expect, "soon"]],
        };
      return { rank: 1, at: expect, tags: [late, ["Promised " + l.expect, ""]] };
    }
    const gap = expect - now;
    const left = gap < 60 ? gap + " min" : Math.round(gap / 60) + " hr";
    if (gap <= 120)
      return {
        rank: 1,
        at: expect,
        tags: [[gap === 0 ? "Expected now" : "Due in " + left, "soon"]],
      };
    return { rank: 2, at: expect, tags: [] };
  }
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p>" +
        btn("Issue this kit", "issuekit", r.id, "primary") +
        "</div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + a.bin,
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("Issue kit", "new", "", "primary"),
    );
    if (s.editing) return html + issueForm();
    html +=
      '<form class="lookup" data-lookup><label><span>Unit in hand</span><input name="tag" autocomplete="off" required placeholder="Type the tag on the unit, e.g. AD-12" value="' +
      esc(s.lookup) +
      '" /></label><button type="submit">Find slip</button></form>' +
      (s.lookupMsg
        ? '<p class="formerror" role="alert">' + esc(s.lookupMsg) + "</p>"
        : "");
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    // Most urgent first: overdue or expected now, then by when it's due.
    const open = s.loans
      .filter((l) => !l.back)
      .map((l) => [l, timing(l)])
      .sort(([a, x], [b, y]) => x.rank - y.rank || x.at - y.at || b.num - a.num)
      .map(([l]) => l);
    const done = s.onlyOpen
      ? []
      : s.loans.filter((l) => l.back).slice().reverse();
    const shown = [...open, ...done];
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const l of shown) html += slipRow(l);
    return html;
  }
  // A slip shows where the unit actually is when it did not come back with
  // the rest of the kit, not only who signed for it.
  function slipRow(l) {
    const a = getAsset(l.asset);
    const where = l.holder
      ? '<small class="holder"><b>Now with ' +
        esc(l.holder) +
        " · back " +
        esc(l.expect) +
        "</b>" +
        (l.memo ? " · " + esc(l.memo) : "") +
        "</small>"
      : "";
    const busy = s.stillOut === l.num || s.returning === l.num;
    const actions = l.back
      ? badge("Returned")
      : busy
        ? ""
        : '<div class="slipactions">' +
          btn("Still out", "stillout", String(l.num)) +
          btn("Record return", "return", String(l.num)) +
          "</div>";
    const tags = l.back
      ? ""
      : timing(l)
          .tags.map(([t, cls]) => badge(t, cls))
          .join(" ");
    const closed =
      l.back && l.returnedBy
        ? "<small>Returned by " +
          esc(l.returnedBy) +
          " · " +
          esc(shifts[l.returnedAt].time) +
          "</small>"
        : "";
    let html =
      '<div class="row"><div><strong>' +
      esc("L-" + l.num + " · " + l.asset + " · " + a.type) +
      "</strong>" +
      (tags ? '<div class="when">' + tags + "</div>" : "") +
      "<small>" +
      esc(l.req + " · Signed out to " + l.who + " · Due " + l.due) +
      "</small>" +
      (l.back ? closed : where) +
      "</div><div>" +
      actions +
      "</div></div>";
    if (l.back) return html;
    if (s.stillOut === l.num) html += stillOutForm(l);
    if (s.returning === l.num) html += returnForm(l);
    return html;
  }
  // Closing a slip asks for the tag on the unit in hand, so an identical
  // unit (AD-12 vs AD-15) can't close the wrong slip.
  function returnForm(l) {
    return (
      '<form class="slipform" data-return data-num="' +
      l.num +
      '"><p><b>Check in L-' +
      l.num +
      " · " +
      esc(l.asset) +
      " · " +
      esc(getAsset(l.asset).type) +
      ".</b> Read the tag on the unit before closing the slip.</p>" +
      '<div class="form"><label><span>Tag on the unit in hand</span><input name="tag" autocomplete="off" required placeholder="' +
      esc(l.asset.slice(0, 3)) +
      '…" value="' +
      esc(s.retTag) +
      '" /></label><label><span>Returned by</span><select name="by" required>' +
      opts(
        people.map((p) => [p, p]),
        l.holder || l.who,
      ) +
      "</select></label></div>" +
      (s.retError
        ? '<p class="formerror" role="alert">' + esc(s.retError) + "</p>"
        : "") +
      '<div class="buttons"><button type="submit" class="primary">Close slip</button>' +
      btn("Cancel", "cancelreturn") +
      "</div></form>"
    );
  }
  // Explains where a tag belongs when it is not the slip being closed.
  function whereIs(tag) {
    const a = getAsset(tag);
    if (!a) return "No unit is tagged " + tag + ". Check the label on the unit.";
    const l = out(tag);
    if (l)
      return (
        tag +
        " is on slip L-" +
        l.num +
        " (" +
        l.req +
        ", signed out to " +
        l.who +
        ")."
      );
    if (a.repair) return tag + " is a workshop unit in repair, not on loan.";
    return (
      tag +
      " is not on loan. It should already be on the shelf in bin " +
      a.bin +
      ". Check you have the right unit."
    );
  }
  function stillOutForm(l) {
    const select = (label, key, options, value) =>
      "<label><span>" +
      label +
      '</span><select name="' +
      key +
      '" required><option value="">Select…</option>' +
      opts(options, value) +
      "</select></label>";
    return (
      '<form class="slipform" data-stillout data-num="' +
      l.num +
      '"><p><b>' +
      esc(l.asset) +
      " did not come back.</b> Record where it is so the next shift can close this slip.</p>" +
      '<div class="form">' +
      select(
        "Who has it now",
        "holder",
        people.map((p) => [p, p]),
        l.holder || "",
      ) +
      select(
        "Coming back",
        "expect",
        dueTimes.map((t) => [t, t]),
        l.expect || "",
      ) +
      '<label class="full"><span>Note (optional)</span><input name="memo" maxlength="200" value="' +
      esc(l.memo || "") +
      '" placeholder="e.g. Kabir says Leela will drop it at the counter" /></label>' +
      '</div><div class="buttons"><button type="submit" class="primary">Save on slip</button>' +
      btn("Cancel", "cancelstillout") +
      "</div></form>"
    );
  }
  // One form per approved request: every approved item gets its own unit
  // picker, and saving still writes one slip per physical unit.
  function issueForm() {
    const d = s.draft;
    const r = getReq(d.req);
    const select = (label, key, options, value, cls = "") =>
      '<label class="' +
      cls +
      '"><span>' +
      label +
      '</span><select name="' +
      key +
      '" required><option value="">Select…</option>' +
      opts(options, value) +
      "</select></label>";
    let html =
      '<form data-issue><div class="form">' +
      select(
        "Approved request",
        "req",
        requests.map((x) => [x.id, x.id + " · " + x.club + " · " + x.event]),
        d.req,
        "full",
      );
    if (!r)
      return (
        html +
        '<p class="full muted">Choose a request to see its approved equipment.</p></div></form>'
      );
    html +=
      '<div class="kit full"><p><b>Approved equipment</b> · Filed by ' +
      esc(r.owner) +
      "</p><p class=\"muted\">" +
      esc(r.note) +
      "</p>";
    r.items.forEach((type, i) => {
      const already = s.loans.find(
        (l) => l.req === r.id && !l.back && getAsset(l.asset).type === type,
      );
      if (already) {
        html +=
          '<div class="kitline"><span>' +
          esc(type) +
          "</span>" +
          badge("Already out · L-" + already.num + " · " + already.asset) +
          "</div>";
        return;
      }
      const units = assets.filter(
        (a) => a.type === type && !a.repair && !out(a.id),
      );
      html +=
        '<label class="kitline"><span>' +
        esc(type) +
        '</span><select name="unit-' +
        i +
        '" required><option value="">' +
        (units.length ? "Select unit…" : "No unit on the shelf") +
        "</option>" +
        opts(
          units.map((a) => [a.id, a.id + " · " + a.model + " · bin " + a.bin]),
          d.units[type],
        ) +
        '<option value="none"' +
        (d.units[type] === "none" ? " selected" : "") +
        ">Not issuing now</option></select></label>";
    });
    html +=
      "</div>" +
      select(
        "Collected by",
        "who",
        people.map((p) => [p, p]),
        d.who,
      ) +
      select(
        "Return by",
        "due",
        dueTimes.map((t) => [t, t + (t === r.due ? " (on request)" : "")]),
        d.due,
      ) +
      "</div>" +
      (d.error
        ? '<p class="formerror" role="alert">' + esc(d.error) + "</p>"
        : "") +
      '<button type="submit" class="primary">Save issue slips</button></form>';
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const l of s.loans)
      if (l.holder && !l.back)
        entries.push([
          shifts[l.noted].time,
          "Loan register · Slip L-" + l.num,
          l.asset +
            " (" +
            getAsset(l.asset).type +
            ") is still out with " +
            l.holder +
            ", back " +
            l.expect +
            "." +
            (l.memo ? " " + l.memo : ""),
        ]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        s.draft = blankDraft();
        Object.assign(s, idleReturn());
        break;
      case "stillout":
        Object.assign(s, idleReturn(), { stillOut: Number(v) });
        break;
      case "cancelstillout":
      case "cancelreturn":
        Object.assign(s, idleReturn());
        break;
      case "issuekit":
        s.tab = "Loan register";
        s.selected = "";
        s.editing = true;
        s.draft = blankDraft(v);
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        s.draft = blankDraft();
        break;
      case "cancel":
        s.editing = false;
        s.draft = blankDraft();
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "return": {
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        Object.assign(s, idleReturn(), { returning: l.num });
        break;
      }
    }
    commit();
  });
  function closeSlip(l, by) {
    l.back = true;
    l.returnedBy = by;
    l.returnedAt = s.phase;
    Object.assign(s, idleReturn());
    const left = s.loans.filter((x) => x.req === l.req && !x.back);
    commit(
      l.asset +
        " returned by " +
        by +
        " to bin " +
        getAsset(l.asset).bin +
        ". Slip L-" +
        l.num +
        " closed." +
        (left.length
          ? " Still out on " +
            l.req +
            ": " +
            left
              .map(
                (x) =>
                  x.asset +
                  " (" +
                  getAsset(x.asset).type +
                  (x.holder ? ", with " + x.holder : "") +
                  ")",
              )
              .join(", ") +
            "."
          : " Everything on " + l.req + " is back."),
    );
  }
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
      return;
    }
    if (!e.target.closest("[data-issue]")) return;
    const { name, value } = e.target;
    if (name === "req") {
      // A new request swaps the kit list; keep the collector, reset the rest.
      s.draft = { ...blankDraft(value), who: s.draft.who };
      commit();
    } else if (name === "who" || name === "due") {
      s.draft[name] = value;
    } else if (name.startsWith("unit-")) {
      const r = getReq(s.draft.req);
      if (r) s.draft.units[r.items[Number(name.slice(5))]] = value;
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-lookup]")) {
      const tag = tagOf(form.get("tag"));
      if (!tag) return;
      const l = out(tag);
      Object.assign(s, idleReturn(), { lookup: tag });
      if (l) {
        s.returning = l.num;
        s.retTag = tag;
        commit(
          tag + " is on slip L-" + l.num + ". Confirm who returned it and close the slip.",
        );
      } else {
        s.lookupMsg = whereIs(tag);
        commit();
      }
      return;
    }
    if (f.matches("[data-return]")) {
      const l = s.loans.find((x) => x.num === Number(f.dataset.num));
      const by = String(form.get("by") || "");
      if (!l || l.back || !people.includes(by)) return;
      const tag = tagOf(form.get("tag"));
      s.retTag = tag;
      if (tag !== l.asset) {
        s.retError =
          "This slip is for " +
          l.asset +
          ", but the unit in hand is " +
          tag +
          ". " +
          whereIs(tag) +
          " The slip stays open.";
        commit();
        return;
      }
      closeSlip(l, by);
      return;
    }
    if (f.matches("[data-stillout]")) {
      const l = s.loans.find((x) => x.num === Number(f.dataset.num));
      const holder = String(form.get("holder") || "");
      const expect = String(form.get("expect") || "");
      if (!l || l.back || !people.includes(holder) || !dueTimes.includes(expect))
        return;
      l.holder = holder;
      l.expect = expect;
      l.memo = String(form.get("memo") || "").trim().slice(0, 200);
      l.noted = s.phase;
      Object.assign(s, idleReturn());
      commit(
        "Slip L-" +
          l.num +
          " updated: " +
          l.asset +
          " is with " +
          holder +
          ", back " +
          expect +
          ". Added to the desk book.",
      );
      return;
    }
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const r = getReq(form.get("req"));
    if (!r) return;
    const who = String(form.get("who") || "");
    const due = String(form.get("due") || "");
    // Only approved types are offered, so each pick is [approved type, unit].
    const picks = r.items.map((type, i) => [type, form.get("unit-" + i)]);
    s.draft = { req: r.id, who, due, units: {}, error: "" };
    for (const [type, id] of picks) if (id) s.draft.units[type] = id;
    const fail = (msg) => {
      s.draft.error = msg;
      commit();
    };
    if (!people.includes(who)) return fail("Choose who is collecting.");
    if (!dueTimes.includes(due)) return fail("Choose a return time.");
    const issuing = picks.filter(([, id]) => id && id !== "none");
    if (!issuing.length)
      return fail("Choose at least one unit to issue, or cancel.");
    for (const [type, id] of issuing) {
      const a = getAsset(id);
      if (!a || a.type !== type || a.repair || out(id))
        return fail(id + " is not available as a " + type + ".");
      if (
        s.loans.some(
          (l) => l.req === r.id && !l.back && getAsset(l.asset).type === type,
        )
      )
        return fail("The approved " + type + " is already on loan.");
    }
    let num = Math.max(...s.loans.map((l) => l.num));
    const slips = issuing.map(([, asset]) => {
      num += 1;
      s.loans.push({ num, req: r.id, asset, who, due, back: false });
      return asset + " (L-" + num + ")";
    });
    const skipped = picks.filter(([, id]) => id === "none").map(([t]) => t);
    s.editing = false;
    s.draft = blankDraft();
    commit(
      "Issued " +
        slips.join(", ") +
        " to " +
        who +
        " · Return by " +
        due +
        "." +
        (skipped.length ? " Not issued: " + skipped.join(", ") + "." : ""),
    );
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 1 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l &&
          getReq(l.req) &&
          getAsset(l.asset) &&
          Number.isInteger(l.num) &&
          (!l.holder ||
            (people.includes(l.holder) &&
              dueTimes.includes(l.expect) &&
              shifts[l.noted] &&
              typeof (l.memo || "") === "string")) &&
          (!l.returnedBy ||
            (people.includes(l.returnedBy) && shifts[l.returnedAt])),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
      draft: blankDraft(),
      ...idleReturn(),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
