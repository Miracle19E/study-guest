/* ===== Study Quest — Shared navbar login logic ===== */
/* This classic script runs on every page. It checks if the student */
/* is logged in and updates the navigation bar accordingly.         */
/* It needs supabase.js to be loaded FIRST (which creates `sq`).    */

(function () {
  // Detect if we are inside the ko/ folder by checking the page path
  var inKorean = window.location.pathname.includes("/ko/");

  // The text shown in the navbar — English or Korean
  var t = {
    hi: inKorean ? "안녕, " : "Hi, ",
    logout: inKorean ? "로그아웃" : "Log out",
    login: inKorean ? "로그인" : "Log in",
  };

  // Update the navbar: show greeting + logout if logged in, or login link if not
  function updateNavbar() {
    // Find the navbar element on the page
    var navbar = document.querySelector(".navbar");
    if (!navbar) return;

    // Check if the student is logged in
    sq.auth.getSession().then(function (result) {
      var session = result.data && result.data.session;

      // Find or create the auth area in the navbar
      var authArea = navbar.querySelector(".nav-auth");
      if (!authArea) {
        authArea = document.createElement("div");
        authArea.className = "nav-auth";
        navbar.appendChild(authArea);
      }

      if (session) {
        // Logged in — load the nickname from the profiles table
        sq.from("profiles")
          .select("nickname")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(function (res) {
            var profile = res.data;
            var nickname = profile ? profile.nickname : session.user.email;

            // Show "Hi, <nickname>" and a logout button
            var greeting = document.createElement("span");
            greeting.className = "nav-greeting";
            greeting.textContent = t.hi + nickname;

            var logoutBtn = document.createElement("button");
            logoutBtn.className = "btn btn-small nav-logout";
            logoutBtn.textContent = t.logout;
            // When clicked, sign out and reload the page
            logoutBtn.addEventListener("click", function () {
              sq.auth.signOut().then(function () {
                window.location.reload();
              });
            });

            authArea.innerHTML = "";
            authArea.appendChild(greeting);
            authArea.appendChild(logoutBtn);
          });
      } else {
        // Not logged in — show a "Log in" link
        var loginHref = inKorean ? "login.html" : "login.html";
        authArea.innerHTML =
          '<a class="btn btn-small nav-login" href="' + loginHref + '">' + t.login + "</a>";
      }
    });
  }

  // Run the navbar update as soon as the page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateNavbar);
  } else {
    updateNavbar();
  }
})();
