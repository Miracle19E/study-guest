/* ===== Study Quest — Shared auth + navbar logic ===== */
/* This module runs on every page. It checks if the student is     */
/* logged in and updates the navigation bar accordingly.            */
/* It also exports helper functions other scripts can use.          */

import { supabase } from "./supabase.js";

// Detect if we are inside the ko/ folder by checking the page path
const inKorean = window.location.pathname.includes("/ko/");

// Build the correct relative path to a page depending on language folder
function pageLink(page) {
  return inKorean ? page : page;
}

// The text shown in the navbar — English or Korean
const t = {
  hi: inKorean ? "안녕, " : "Hi, ",
  logout: inKorean ? "로그아웃" : "Log out",
  login: inKorean ? "로그인" : "Log in",
};

// Update the navbar: show greeting + logout if logged in, or login link if not
export async function updateNavbar() {
  // Find the navbar element on the page
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  // Check if the student is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Find or create the auth area in the navbar
  let authArea = navbar.querySelector(".nav-auth");
  if (!authArea) {
    authArea = document.createElement("div");
    authArea.className = "nav-auth";
    navbar.appendChild(authArea);
  }

  if (session) {
    // Logged in — try to load the nickname from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", session.user.id)
      .maybeSingle();

    const nickname = profile ? profile.nickname : session.user.email;

    // Show "Hi, <nickname>" and a logout button
    const greeting = document.createElement("span");
    greeting.className = "nav-greeting";
    greeting.textContent = t.hi + nickname;

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "btn btn-small nav-logout";
    logoutBtn.textContent = t.logout;
    // When clicked, sign out and reload the page
    logoutBtn.addEventListener("click", async function () {
      await supabase.auth.signOut();
      window.location.reload();
    });

    authArea.innerHTML = "";
    authArea.appendChild(greeting);
    authArea.appendChild(logoutBtn);
  } else {
    // Not logged in — show a "Log in" link
    const loginHref = inKorean ? "login.html" : "login.html";
    authArea.innerHTML =
      '<a class="btn btn-small nav-login" href="' + loginHref + '">' + t.login + "</a>";
  }
}

// Run the navbar update as soon as the page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateNavbar);
} else {
  updateNavbar();
}
