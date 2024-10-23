let DEFAULT_LANGUAGE = "en",
  DEFAULT_THEME = "dark",
  DEFAULT_TRIGGER_KEY = "none",
  SEARCHWORD,
  LANGUAGE,
  THEME,
  TRIGGER_KEY;

/**
 * Show the popup and starts fetching meanings
 * @param {event} event - Double click event
 * @returns
 */
function showMeaning(event) {
  let info = getSelectionInfo(event); // Assuming this extracts selection info
  if (!info) {
    return;
  }
  SEARCHWORD = info.word.toLowerCase(); // Set the global variable

  browser.storage.sync
    .get("defaultLanguage")
    .then((data) => {
      const language = data.defaultLanguage || "en"; // Default to English if not set
      // Call retrieveMeaning and pass a callback to handle the response
      retrieveMeaning(SEARCHWORD, language, function (translation, error) {
        if (error) {
          let createdDiv = createDiv(info);
          return noMeaningFound(createdDiv, language); // Handle the error case
        }

        if (!translation) {
          let createdDiv = createDiv(info);
          return noMeaningFound(createdDiv, language); // Handle the case where no translation is returned
        }
        let createdDiv = createDiv(info);
        appendToDiv(createdDiv, translation); // Append the translation to the div
      });
    })
    .catch((error) => {
      console.error("Error retrieving default language:", error);
    });
}

/**
 * Get the details of the selected word and its position relative to the viewport
 * @param {event} event
 * @returns {object} - details and position
 */
function getSelectionInfo(event) {
  var word;
  var boundingRect;

  if (window.getSelection().toString().length > 1) {
    word = window.getSelection().toString();
    boundingRect = getSelectionCoords(window.getSelection());
  } else {
    return null;
  }

  var top = boundingRect.top + window.scrollY,
    bottom = boundingRect.bottom + window.scrollY,
    left = boundingRect.left + window.scrollX;

  if (boundingRect.height == 0) {
    top = event.pageY;
    bottom = event.pageY;
    left = event.pageX;
  }

  return {
    top: top,
    bottom: bottom,
    left: left,
    word: word,
    clientY: event.clientY,
    height: boundingRect.height,
    width: boundingRect.width,
  };
}

/**
 * Retrieve the by dictionary api
 * @param {string} word  - the hightlighted word
 * @param {string} lang - language to search for
 * @returns
 */
function retrieveMeaning(selection, lang, callback) {
  chrome.runtime.sendMessage(
    {
      action: "translate",
      word: selection,
      language: lang,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.log("Runtime error:", chrome.runtime.lastError.message);
        callback(null, chrome.runtime.lastError.message); // Call the callback with an error
        return;
      }

      if (response && response.success) {
        const translation =
          response.data?.translateResponse?.translateText ||
          response.data?.dictionaryData?.[0]?.entries?.[0]?.senseFamilies?.[0]
            ?.senses?.[0]?.conciseDefinition ||
          response.data?.dictionaryData?.[0]?.entries?.[0]?.senseFamilies?.[0]
            ?.senses?.[0]?.definition?.text ||
          "No translation found";
        const sourceText =
          response.data?.translateResponse?.sourceText ||
          response.data?.dictionaryData?.[0]?.entries?.[0]?.headword ||
          "No word found";
        const outLang =
          response.data?.translateResponse?.outputLanguage ||
          response.data?.dictionaryData?.[0]?.entries?.[0]?.corpus?.language ||
          null;
        const detectedLang =
          response.data?.translateResponse?.detectedSourceLanguage || null;
        const dictcorpus =
          response.data?.dictionaryData?.[0]?.entries?.[0]?.corpus?.language ||
          null;
        callback(
          { translation, sourceText, outLang, detectedLang, dictcorpus },
          null
        ); // Call the callback with the translation result
      } else {
        callback(null, response ? response.error : "Unknown error");
      }
    }
  );
}

/**
 * Load CSS based on theme set on the option page
 * @returns {string} stylesheet for popup
 */
function loadStyle() {
  let style = document.createElement("style");

  style.textContent =
    ".mwe-popups{background:#fff;position:absolute;z-index:110;-webkit-box-shadow:0 30px 90px -20px rgba(0,0,0,.3),0 0 1px #a2a9b1;box-shadow:0 30px 90px -20px rgba(0,0,0,.3),0 0 1px #a2a9b1;padding:0;font-size:14px;min-width:300px;border-radius:2px}.mwe-popups.mwe-popups-is-not-tall{width:320px}.mwe-popups .mwe-popups-container{color:#222;margin-top:-9px;padding-top:9px;text-decoration:none}.mwe-popups.mwe-popups-is-not-tall .mwe-popups-extract{min-height:40px;max-height:140px;overflow:hidden;margin-bottom:47px;padding-bottom:0}.mwe-popups .mwe-popups-extract{margin:16px;display:block;color:#222;text-decoration:none;position:relative}.mwe-popups.flipped_y:before{content:'';position:absolute;border:8px solid transparent;border-bottom:0;border-top:8px solid #a2a9b1;bottom:-8px;left:10px}.mwe-popups.flipped_y:after{content:'';position:absolute;border:11px solid transparent;border-bottom:0;border-top:11px solid #fff;bottom:-7px;left:7px}.mwe-popups.mwe-popups-no-image-tri:before{content:'';position:absolute;border:8px solid transparent;border-top:0;border-bottom:8px solid #a2a9b1;top:-8px;left:10px}.mwe-popups.mwe-popups-no-image-tri:after{content:'';position:absolute;border:11px solid transparent;border-top:0;border-bottom:11px solid #fff;top:-7px;left:7px}.audio{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAcUlEQVQ4y2P4//8/AyUYQhAH3gNxA7IAIQPmo/H3g/QA8XkgFiBkwHyoYnRQABVfj88AmGZcTuuHyjlgMwBZM7IE3NlQGhQe65EN+I8Dw8MLGgYoFpFqADK/YUAMwOsFigORatFIlYRElaRMWmaiBAMAp0n+3U0kqkAAAAAASUVORK5CYII=);background-position:center;background-repeat:no-repeat;cursor:pointer;margin-left:8px;opacity:.5;width:16px;display:inline-block}.audio:hover{opacity:1}.mwe-popups.flipped_x:before{left:unset;right:10px}.mwe-popups.flipped_x:after{left:unset;right:7px}.type{float:right; color:#aaa;} .close-btn{display:none} .mwe-popups-container:hover .close-btn{display:block; cursor:pointer;}";

  if (
    THEME == "dark" ||
    (
      THEME == "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)")
    ).matches
  ) {
    style.textContent +=
      ".mwe-popups{background:#23222b}.mwe-popups .mwe-popups-container{color:#fff}.mwe-popups .mwe-popups-extract{color:#fff}.mwe-popups .mwe-popups-extract a{color:#0ff}.mwe-popups.flipped_y:before{border-top:8px solid #fff}.mwe-popups.flipped_y:after{border-top:11px solid #1b1b1b}.mwe-popups.mwe-popups-no-image-tri:before{border-bottom:8px solid #fff}.mwe-popups.mwe-popups-no-image-tri:after{border-bottom:11px solid #1b1b1b}.audio{opacity:.6;filter:invert(1)}";
  }

  return style;
}

/**
 * Create the popup div
 * @param {string} info - the hightlighted text
 * @returns the popup div which will show the meaning after it is retrived
 */
function createDiv(info) {
  var hostDiv = document.createElement("div");

  hostDiv.className = "dictionaryDiv";
  hostDiv.style.left = info.left - 10 + "px";
  hostDiv.style.position = "absolute";
  hostDiv.style.zIndex = "1000000";
  hostDiv.attachShadow({ mode: "open" });

  var shadow = hostDiv.shadowRoot;

  shadow.appendChild(loadStyle());

  var encapsulateDiv = document.createElement("div");
  encapsulateDiv.style =
    "all: initial; text-shadow: transparent 0px 0px 0px, rgba(0,0,0,1) 0px 0px 0px !important;";
  shadow.appendChild(encapsulateDiv);

  var popupDiv = document.createElement("div");
  popupDiv.style =
    "font-family: arial,sans-serif; border-radius: 12px; border: 1px solid #a2a9b1; box-shadow: 0 0 17px rgba(0,0,0,0.5)";
  encapsulateDiv.appendChild(popupDiv);

  var contentContainer = document.createElement("div");
  contentContainer.className = "mwe-popups-container";
  popupDiv.appendChild(contentContainer);

  let closeBtn = document.createElement("button");
  closeBtn.textContent = "X";
  closeBtn.className = "close-btn";
  closeBtn.style =
    "position: absolute; right:-12px; top:-10px; background: darkred; color: #fff; border: 0; border-radius: 50%;padding: 4px 9px;";
  closeBtn.addEventListener("click", () => {
    hostDiv.remove();
  });
  contentContainer.appendChild(closeBtn);

  var content = document.createElement("div");
  content.className = "mwe-popups-extract";
  content.style =
    "line-height: 1.4; margin-top: 0px; margin-bottom: 11px; max-height: none";
  contentContainer.appendChild(content);

  var heading = document.createElement("h3");
  heading.style = "margin-block-end: 0px; display:inline-block;";
  heading.textContent = `Searching...`;

  var meaning = document.createElement("ul");
  meaning.style =
    "margin-top: 10px; margin-left: 0; padding-left: 0; text-align: left;";
  meaning.textContent = `Looking up word "${SEARCHWORD}" in ${getLanguageNameFromCode(
    LANGUAGE
  )}`;

  let bottomRow = document.createElement("div");
  bottomRow.style =
    "display: flex; justify-content: space-between; align-items: center; margin-top: 10px;";

  let type = document.createElement("p");
  type.className = "type";
  type.style = "margin: 0;"; // Remove margin to keep it aligned properly

  var moreInfo = document.createElement("a");
  moreInfo.style = "text-decoration: none;";
  moreInfo.target = "_blank";
  moreInfo.textContent = "More";

  // Append both elements to the bottomRow
  bottomRow.appendChild(type);
  bottomRow.appendChild(moreInfo);

  content.appendChild(heading);
  content.appendChild(meaning);
  content.appendChild(bottomRow);

  document.body.appendChild(hostDiv);

  if (info.clientY < window.innerHeight / 2) {
    popupDiv.className =
      "mwe-popups mwe-popups-no-image-tri mwe-popups-is-not-tall";
    hostDiv.style.top = info.bottom + 10 + "px";
    if (info.height == 0) {
      hostDiv.style.top = parseInt(hostDiv.style.top) + 8 + "px";
    }
  } else {
    popupDiv.className = "mwe-popups flipped_y mwe-popups-is-not-tall";
    hostDiv.style.top = info.top - 10 - popupDiv.clientHeight + "px";

    if (info.height == 0) {
      hostDiv.style.top = parseInt(hostDiv.style.top) - 8 + "px";
    }
  }

  if (info.left + popupDiv.clientWidth > window.innerWidth) {
    if (window.innerWidth >= popupDiv.clientWidth) {
      /* Flip to left only if window's width is more than
       * popupDiv's width. Otherwise, leave it to right side
       * so that it can be scrollable on narrow windows.
       */
      popupDiv.className += " flipped_x";
      hostDiv.style.left =
        info.left - popupDiv.clientWidth + info.width + 10 + "px";
    }
  }

  return {
    heading,
    meaning,
    moreInfo,
    type,
    content,
  };
}

/**
 * Get the size of the element and its position relative to the viewport
 * @param {string} selection - The selected word
 * @returns {object}
 */
function getSelectionCoords(selection) {
  var oRange = selection.getRangeAt(0); //get the text range
  var oRect = oRange.getBoundingClientRect();
  return oRect;
}

/**
 * Update the popup with the meaning details
 * @param {HTMLElement} createdDiv - the popup div
 * @param {object} obj - fetched meaning deatails
 */
function appendToDiv(createdDiv, obj) {
  let hostDiv = createdDiv.heading.getRootNode().host;
  let popupDiv = createdDiv.heading.getRootNode().querySelectorAll("div")[1];

  let heightBefore = popupDiv.clientHeight;
  createdDiv.heading.textContent = obj.sourceText;

  createdDiv.meaning.textContent = obj.translation;

  createdDiv.moreInfo.textContent = "More »";
  createdDiv.moreInfo.href = createUrl(
    obj?.dictcorpus,
    obj?.detectedLang,
    obj?.outLang,
    obj?.sourceText
  );
  createdDiv.moreInfo.style.display = "block";

  if (obj.detectedLang) {
    createdDiv.type.textContent = `Translated from ${getLanguageNameFromCode(
      obj.detectedLang
    )} to ${getLanguageNameFromCode(obj.outLang)}`;
    createdDiv.type.style.display = "block";
  }

  let heightAfter = popupDiv.clientHeight;
  let difference = heightAfter - heightBefore;

  if (popupDiv.classList.contains("flipped_y")) {
    hostDiv.style.top = parseInt(hostDiv.style.top) - difference + 1 + "px";
  }
}

function getLanguageNameFromCode(code) {
  const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
  return languageNames.of(code);
}

function createUrl(corpus, detectedLang, lang, word) {
  if (corpus) {
    return `https://www.google.com/search?dictcorpus=${corpus}&hl=${lang}&q=define%20${word}`;
  }
  return `https://translate.google.com/?sl=${detectedLang}&tl=${lang}&text=${word}&op=translate`;
}

/**
 * Update the popup if no meaning is found
 * @param {HTMLElement} createdDiv
 */
function noMeaningFound(createdDiv, language) {
  createdDiv.heading.textContent = "Sorry";
  createdDiv.meaning.textContent = `No definition found in ${getLanguageNameFromCode(
    language
  )}. Try changing the language in options`;
  createdDiv.moreInfo.style.display = "none";
  createdDiv.type.style.display = "none";
}

/**
 *  Remove popup on clicking outside of it
 */
document.addEventListener("click", removeMeaning);
function removeMeaning(event) {
  var element = event.target;
  if (!element.classList.contains("dictionaryDiv")) {
    document.querySelectorAll(".dictionaryDiv").forEach(function (Node) {
      Node.remove();
    });
  }
}

/**
 * Add event listner for double click
 * @kind event
 */
document.addEventListener("dblclick", (e) => {
  if (TRIGGER_KEY === "rightclick") {
    return;
  }

  if (TRIGGER_KEY === "none") {
    return showMeaning(e);
  }

  //e has property altKey, shiftKey, cmdKey representing they key being pressed while double clicking.
  if (e[`${TRIGGER_KEY}Key`]) {
    return showMeaning(e);
  }

  return;
});

/**
 * Retrieve Setting
 */
(async () => {
  let storageSync = await browser.storage.sync.get();
  let interaction = storageSync.interaction || {
    dblClick: { key: DEFAULT_TRIGGER_KEY },
  };
  LANGUAGE = storageSync.defaultLanguage || DEFAULT_LANGUAGE;
  THEME = storageSync.theme || DEFAULT_THEME;
  TRIGGER_KEY = interaction.dblClick.key;

  browser.storage.onChanged.addListener((changes) => {
    if (changes.theme) {
      THEME = changes.theme.newValue;
    }
  });
})();
