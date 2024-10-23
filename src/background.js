browser.runtime.onMessage.addListener(async (request) => {
    if (request.action === "translate") {
      const word = request.word;
      const language = request?.language || "en";
      const url = `https://content-dictionaryextension-pa.googleapis.com/v1/dictionaryExtensionData?term=${encodeURIComponent(word)}&language=${language}&corpus=${language}&strategy=2&tab_language=${language}&key=AIzaSyA6EEtrDCfBkHV8uU2lgGY-N383ZgAOo7Y`;
  
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-referer': 'chrome-extension://mgijmajocgfcbeboacabfgobmjgjcoja',
          }
        });
        const data = await response.json();
        if (data.status == 404){
        return ({ success: false, error: "Not found" });
        }

        return ({ success: true, data: data });
      } catch (error) {
        return ({ success: false, error: error.message });
      }
    }
  
    return false;
  });
  