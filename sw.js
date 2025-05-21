// Service worker back gorund file, handles
// -- managing chrome window
// -- managing cross device memory
// -- opening required html files for install/help [and data management (ver2)]

//Run each time extension is loaded (browser start up)
// to show that reader is available and inactive
console.log("service worker in for net notes");
chrome.action.setBadgeText({
  text: "OFF",
});

// Listen for installation and if it happens show the
// installation welcome page, note this will not trigger for updates
chrome.runtime.onInstalled.addListener((reason) => {
  console.log("install triggered", reason.reason);
  if (reason.reason == "install") {
    chrome.windows.create({
      url: "html/onboarding.html",
      type: "popup",
      width: 500,
      height: 1200,
      focused: true,
      top: 25,
    });
  }
});

// When chrome is
chrome.action.onClicked.addListener(async (tab) => {
  // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  // Next state will always be the opposite
  const nextState = prevState === "" ? "OFF" : "";

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  // attempt to load and inject the sripts requires to run the extension
  // change badges
  try {
    if (nextState === "") {
      await chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          files: [
            "scripts/setupui.js",
            "content.js",
            "scripts/draggable.js",
            "scripts/hotkeys.js",
          ],
        })
        .then(() => {
          console.log("main script injected");
        });

      await chrome.scripting
        .insertCSS({
          target: { tabId: tab.id },
          files: ["css/output.css"],
        })
        .then(() => console.log("tailwind injected"));
    } else if (nextState === "OFF") {
      await chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          files: ["scripts/clear.js"],
        })
        .then(() => console.log("script injected"));
    }
  } catch {
    //extension should only fail on pages where there is no document i.e no web content
    console.log("host page incompatable");
    chrome.windows.create({
      url: "html/incompatable.html",
      type: "popup",
      width: 500,
      height: 1200,
      focused: true,
      top: 25,
    });
  }
});

//Windows resize gather message from main
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request && request.action === "resizeWindow") {
    console.log("got the message to resize");
    chrome.windows.getCurrent(function (window) {
      var updateInfo = {
        width: 1200,
        height: 900,
      };
      (updateInfo.state = "normal"),
        chrome.windows.update(window.id, updateInfo);
    });
  }
  // listen for help button click
  if (request && request.message == "help") {
    console.log("help requested");
    chrome.windows
      .create({
        url: "html/help.html",
        type: "popup",
        width: 500,
        height: 1200,
        focused: true,
        top: 25,
      })
      .then(console.log("window should be there =)"));
  }

  return true;
});
