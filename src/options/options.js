function applyTheme(theme) {
  const body = document.body;
  if (theme === "dark") {
    body.setAttribute("id", "dark");
  } else {
    body.setAttribute("id", "light");
  }
}


browser.storage.sync.get(["defaultLanguage", "theme"]).then((data) => {
  if (data.defaultLanguage) {
    document.getElementById("languageSelect").value = data.defaultLanguage;
  }

  if (data.theme) {
    document.getElementById("themeSelect").value = data.theme;
    applyTheme(data.theme);
  }
}).catch((error) => {
  console.error("Error loading default language or theme:", error);
});

document.getElementById("saveButton").addEventListener("click", () => {
  const selectedLanguage = document.getElementById("languageSelect").value;
  const selectedTheme = document.getElementById("themeSelect").value;

  browser.storage.sync.set({ defaultLanguage: selectedLanguage, theme: selectedTheme }).then(() => {
    console.log("Default language set to " + selectedLanguage);
    console.log("Theme set to " + selectedTheme);

    applyTheme(selectedTheme);

  }).catch((error) => {
    console.log("Error saving default language or theme:", error);
  });
});
