(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyCTys1CFNFWjJZqP9mbH9Y_xSpIndyO-ew",
    authDomain: "megaline-htv-market-report.firebaseapp.com",
    projectId: "megaline-htv-market-report",
    storageBucket: "megaline-htv-market-report.firebasestorage.app",
    messagingSenderId: "1073599287472",
    appId: "1:1073599287472:web:056ecdce57ded3afe2eb75",
  };

  var AUTHED_HINT_KEY = "mgProjectMapAuthed";

  // Fail-safe: reveal the page even if Firebase never loads/responds (e.g. blocked
  // CDN), instead of leaving it permanently invisible.
  var revealTimer = setTimeout(revealPage, 3000);
  function revealPage() {
    clearTimeout(revealTimer);
    document.documentElement.style.visibility = "visible";
  }

  if (!window.firebase || !firebase.apps) {
    console.error("auth-gate: Firebase SDK not loaded");
    revealPage();
    return;
  }
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  var auth = firebase.auth();

  var gate = document.getElementById("authGate");
  var form = document.getElementById("authForm");
  var emailInput = document.getElementById("authEmail");
  var pwInput = document.getElementById("authPassword");
  var errorBox = document.getElementById("authError");
  var forgotLink = document.getElementById("authForgot");
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  function setAuthedHint(isAuthed) {
    try {
      if (isAuthed) localStorage.setItem(AUTHED_HINT_KEY, "1");
      else localStorage.removeItem(AUTHED_HINT_KEY);
    } catch (e) {
      /* localStorage unavailable -- ignore, falls back to normal (slower) flow */
    }
  }

  // The dashboard has a hamburger menu (#menuPanel) -- put logout there. If a
  // future page variant ever lacks it, fall back to a small icon button next
  // to the theme toggle instead.
  function injectLogoutControl(user) {
    var menuPanel = document.getElementById("menuPanel");
    if (menuPanel) {
      if (document.getElementById("authLogoutMenuItem")) return;
      var divider = document.createElement("div");
      divider.className = "menu-divider";
      divider.id = "authLogoutDivider";
      var item = document.createElement("a");
      item.id = "authLogoutMenuItem";
      item.href = "#";
      item.setAttribute("role", "menuitem");
      item.textContent = "로그아웃 (" + user.email + ")";
      item.addEventListener("click", function (e) {
        e.preventDefault();
        auth.signOut();
      });
      menuPanel.appendChild(divider);
      menuPanel.appendChild(item);
    } else {
      if (document.getElementById("authLogoutBtn")) return;
      var anchor = document.getElementById("themeToggle");
      if (!anchor || !anchor.parentElement) return;
      var btn = document.createElement("button");
      btn.id = "authLogoutBtn";
      btn.className = "icon-btn auth-logout-btn";
      btn.type = "button";
      btn.title = "로그아웃 (" + user.email + ")";
      btn.setAttribute("aria-label", "로그아웃");
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path></svg>';
      btn.addEventListener("click", function () {
        auth.signOut();
      });
      anchor.parentElement.insertBefore(btn, anchor);
    }
  }

  function removeLogoutControl() {
    var menuItem = document.getElementById("authLogoutMenuItem");
    if (menuItem) menuItem.remove();
    var divider = document.getElementById("authLogoutDivider");
    if (divider) divider.remove();
    var btn = document.getElementById("authLogoutBtn");
    if (btn) btn.remove();
  }

  auth.onAuthStateChanged(function (user) {
    if (user) {
      setAuthedHint(true);
      if (gate) gate.style.display = "none";
      document.documentElement.style.overflow = "";
      injectLogoutControl(user);
    } else {
      setAuthedHint(false);
      if (gate) gate.style.display = "flex";
      document.documentElement.style.overflow = "hidden";
      removeLogoutControl();
    }
    // Only reveal the page once we know which state to show -- the inline
    // optimistic-reveal snippet in <body> already handles the common case
    // (returning signed-in user) instantly; this is the authoritative
    // confirmation/fallback for everyone else.
    revealPage();
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorBox) errorBox.hidden = true;
      if (submitBtn) submitBtn.disabled = true;
      auth
        .signInWithEmailAndPassword(emailInput.value.trim(), pwInput.value)
        .catch(function () {
          showError("이메일 또는 비밀번호가 올바르지 않습니다.");
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!email) {
        showError("비밀번호 재설정 메일을 받을 이메일을 먼저 입력하세요.");
        return;
      }
      auth
        .sendPasswordResetEmail(email)
        .then(function () {
          showError("비밀번호 재설정 메일을 보냈습니다. 받은편지함을 확인하세요.");
        })
        .catch(function () {
          showError("재설정 메일 발송에 실패했습니다. 이메일을 확인하세요.");
        });
    });
  }
})();
