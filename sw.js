//run each time extension is loaded (browser start up)
// to show that reader is available and inactive
console.log("service worker in for net notes");
chrome.action.setBadgeText({
  text: "OFF",
});

// Listen for installation and if it happens show the
// installation welcome page, note this will not trigger for updates
chrome.runtime.onInstalled.addListener((reason) => {
  console.log("install triggered", reason.reason);
  //   if (reason.reason == "install") {
  //     chrome.windows.create({
  //       url: "html/onboarding.html",
  //       type: "popup",
  //       width: 500,
  //       height: 1200,
  //       focused: true,
  //       top: 25,
  //     });
  //   }
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
          files: ["scripts/content.js", "scripts/draggable.js"],
        })
        .then(() => {
          console.log("main script injected");
        });

      //   await chrome.scripting
      //     .insertCSS({
      //       target: { tabId: tab.id },
      //       files: ["css/main.css"],
      //     })
      //     .then(() => console.log("script injected"));
    } else if (nextState === "OFF") {
      await chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          files: ["scripts/clear.js"],
        })
        .then(() => console.log("script injected"));
    }
  } catch {}
});
//extension should only fail on pages where there is no document i.e no web content
//     catch{
//       console.log("host page incompatable")
//       chrome.windows.create({url:"html/incompatable.html",
//                               type:"popup",
//                               width:500,
//                               height:1200,
//                               focused:true,
//                               top:25
//       });

//     }
//   });

//   async function getState(){
//     console.log("we were asked to get the state")

//       let data = await chrome.storage.local.get("Extension");
//       // console.log(data.Extension);
//       let extensionState = data.Extension? JSON.parse(data.Extension) : {"x":20, "y":20, "wordsperminute":300, "vidspeed":1,"audiospeed":1, "lastread":"In order to use the speed reader feature copy text on any browser page using ctrl+c then play using the button or press space"};
//       console.log(extensionState);
//       return extensionState

//   }
//   // save data to extension state variable
//   async function saveState(data){
//     // console.log("received data from popup", data)
//     await chrome.storage.local.set({ "Extension": data }).then(() => {
//       console.log("storage for extension state is set");
//     });
//     return 1
//   };

//   //send messages
//   async function messageTab(){
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   const [tab] = await chrome.tabs.query(queryOptions);
//   // console.log(tab)
//   console.log("sending message to %s",tab.title)

//       chrome.tabs.sendMessage(tab.id, {data:"yo"})
//       .then((response) => {
//               console.info("Popup received response %s from tab with title '%s' and url %s",response, response.title, response.url)
//       })
//       .catch((error) => {
//               console.warn("Popup could not send message to tab %s: error was %s", tab.title, error)
//           })

//   }

//   // Listen for messages
//   chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
//   // console.log("message sent from tab");
//   // console.log("message was",request.message);
//   // console.log("data accompanying message was",request.data);
//   // console.log("sender was", sender);

//     if(request.message == "sent-state-data"){
//       console.log("request to store data")
//       saveState(JSON.stringify(request.data)).then((result)=>{
//         sendResponse(result);
//       })
//     };

//     if(request.message == "request-state-data"){
//       console.log("request for data");
//       getState().then((result)=>{sendResponse(result)})
//     };

//     if(request.message == "help"){
//       console.log("help requested");
//       chrome.windows.create({url:"html/help.html",
//         type:"popup",
//         width:500,
//         height:1200,
//         focused:true,
//         top:25
//       }).then(    console.log("window should be there =)")
//     );

//     }

//     return true; // keeps channel open?
//   });

//   // Get controls from chrome commands
//   chrome.commands.onCommand.addListener((command) => {
//     console.log(`Command: ${command}`);
//   });
