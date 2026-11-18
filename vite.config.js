import { defineConfig } from "vite";
import { resolve } from "path";

// Vite only builds index.html by default. This config tells Vite to
// build EVERY HTML page in the project (including the ko/ folder) so
// they all appear in the dist/ output when you publish.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // English pages
        index: resolve(__dirname, "index.html"),
        profile: resolve(__dirname, "profile.html"),
        login: resolve(__dirname, "login.html"),
        school: resolve(__dirname, "school.html"),
        subject: resolve(__dirname, "subject.html"),
        class: resolve(__dirname, "class.html"),
        "quiz-webprogramming": resolve(__dirname, "quiz-webprogramming.html"),
        "quiz-statistics": resolve(__dirname, "quiz-statistics.html"),
        "quiz-c": resolve(__dirname, "quiz-c.html"),
        "quiz-english": resolve(__dirname, "quiz-english.html"),
        results: resolve(__dirname, "results.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        about: resolve(__dirname, "about.html"),
        // Korean pages
        "ko/index": resolve(__dirname, "ko/index.html"),
        "ko/profile": resolve(__dirname, "ko/profile.html"),
        "ko/login": resolve(__dirname, "ko/login.html"),
        "ko/school": resolve(__dirname, "ko/school.html"),
        "ko/subject": resolve(__dirname, "ko/subject.html"),
        "ko/class": resolve(__dirname, "ko/class.html"),
        "ko/quiz-webprogramming": resolve(__dirname, "ko/quiz-webprogramming.html"),
        "ko/quiz-statistics": resolve(__dirname, "ko/quiz-statistics.html"),
        "ko/quiz-c": resolve(__dirname, "ko/quiz-c.html"),
        "ko/quiz-english": resolve(__dirname, "ko/quiz-english.html"),
        "ko/results": resolve(__dirname, "ko/results.html"),
        "ko/dashboard": resolve(__dirname, "ko/dashboard.html"),
        "ko/about": resolve(__dirname, "ko/about.html"),
      },
    },
  },
});
