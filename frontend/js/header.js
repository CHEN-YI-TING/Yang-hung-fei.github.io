import config from "../../ipconfig.js";
$(window).on("load", () => {
  let token = localStorage.getItem("Authorization_U");

  let connectUrl = (config.url).split('//')[1];
  if (token == null)
    return;
  let url = 'ws://' + connectUrl + '/websocket?access_token=' + token;
  let webSocket = new WebSocket(url);
  webSocket.onopen = function () {
    console.log('創建連接。。。');
    getUserPerfile(token);
    webSocket.send("getHistory");
  }
  webSocket.onmessage = function (event) {
    let notifyMsg = JSON.parse(event.data);
    console.log(notifyMsg.msg);
    //若是獲得 點數 alert顯示
    if (notifyMsg.notifyType === "GetPoint") {
      swal(notifyMsg.msg);
      return;
    }
    let redirectUrl = "#";
    let imgBase64;
    switch (notifyMsg.notifyType) {
      //todo 設定 對應url
      case "Store":  
        break;
      case "Activity":
        redirectUrl = '#';
        break;
      case "Groomer":
        redirectUrl = '#';
        break;
    }

    imgBase64 ="data:image/jpeg;base64,"+notifyMsg.image; 
    console.log(imgBase64);
    
    const newContent = `
        <a href="`+ redirectUrl + `" class="list-group-item">
          <div class="row g-0 align-items-center">
            <div class="col-2">
              <i class="text-warning" data-feather="bell"></i>
            </div>
            <div class="col-12 d-flex align-items-left"> 
            <img src =`+ imgBase64 + ` class="mr-3" style="max-width: 70px; max-height: 70px; "/>
              <div class="text-muted small mt-1">`+ notifyMsg.msg + `
              </div> 
            </div>
          </div>
        </a>
      `;
    let listGroup = $('.list-group');
    listGroup.prepend(newContent);
    let maxItems = 5;
    const currentItems = listGroup.children('.list-group-item').length;

    if (currentItems > maxItems) {
      // 如果当前项目数量达到限制，删除最后一个项目
      listGroup.children('.list-group-item').last().remove();
    }

  }
  webSocket.onclose = function () {
    console.log('webSocket已斷開。。。');
    // $('#messageArea').append('websocket已斷開\n');
  };




  function getUserPerfile(token) {
    fetch(config.url + "/user/profile", {
      method: "GET",
      headers: {
        Authorization_U: token,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        var code = responseData.code;
        if (code === 200) {
          let userPic_base64 = responseData.message.userPic;
          if (userPic_base64) {
            console.dir(responseData);
            let user_el = document.getElementById("user");
            var userPic_el = document.createElement("img");
            userPic_el.src = "data:image/png;base64," + userPic_base64;
            userPic_el.style.width = "100%";
            userPic_el.style.height = "100%";
            userPic_el.style.borderRadius = "100%";
            user_el.appendChild(userPic_el);

            let userIcon_el = document.getElementById("userIcon");
            userIcon_el.style.display = "none";
          }
        }
      })
      .catch((error) => {
        // 处理捕获的错误，包括网络错误等
        console.error("Fetch error:", error);
      });
  }

});