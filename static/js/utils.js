(function () {
  var dropBtnFlag = true;
  var dropBtnTimer = null;
  var totalImg = 0;
  var renderFlag = 0;
  var utilData = [];

  var init = function () {
    initData();
    initEvents();
  };

  var initEvents = function () {
    dropBtn.addEventListener("click", onDropBtnClick, false);
    document.querySelectorAll(".list-item").forEach(function (node) {
      node.addEventListener("click", onNavBtnClick, false);
    });
    window.addEventListener("scroll", onWindowScroll, false);
  };

  /* window滚动事件 */
  var onWindowScroll = function () {
    var screenHeight = window.innerHeight;
    var scrollTop = window.scrollY;
    var totalScroll = screenHeight + scrollTop;
    var lastItem = document.querySelectorAll(".item")[document.querySelectorAll(".item").length - 1];
    var lastNodeDistance = lastItem.offsetTop + lastItem.offsetHeight / 2;

    if (totalScroll >= lastNodeDistance) {
      var now = Date.now();

      if (now - renderFlag > 500) {
        console.log(1);
        initData();
        renderFlag = now;
      }
    }
  };

  /* 初始获取图片数据 */
  var initData = function () {
    ajax({
      url: "/getUtilPic/",
      method: "GET",
      success: function ({
        data
      }) {
        var picData = data;

        ajax({
          url: "/getUtilData/",
          method: "GET",
          success: function ({
            data
          }) {
            utilData = data[0].utilName;
            renderImgList(picData);
          }
        });
      },
      error: function (e) {
        console.log(e);
      }
    });
  };

  /* 渲染图片 */
  var renderImgList = function (imgList) {
    /* var dataStr = "";

    imgList.forEach(function (item) {
      dataStr += `
        <a href="javascript:;">
          <div class="item">
            <img src="${item}" alt="">
            <span>在线选择器</span>
          </div>
        </a>
      `;
    });
    imgContent.innerHTML += dataStr; */
    /* 上面这种写法不可用，因为会将已经渲染出来的元素和将要渲染的元素放在一起再渲染，会造成排列的混乱 */

    imgList.forEach(function (item, index) {
      var aNode = document.createElement("a");
      var divNode = document.createElement("div");
      var spanNode = document.createElement("span");
      var img = new Image();

      aNode.href = "javascript:;";
      divNode.className = "item";
      spanNode.innerText = utilData[index];
      img.src = item;
      divNode.appendChild(img);
      divNode.appendChild(spanNode);
      aNode.appendChild(divNode);
      imgContent.appendChild(aNode);
    });

    document.querySelectorAll(".item").length === 20 && document.querySelectorAll(".item").forEach(function (node) {
      node.classList.add("once");
      node.onanimationend = function () {
        this.classList.remove("once");
      };
    });

    document.querySelectorAll("img").forEach(function (img) {
      img.onload = function () {
        totalImg++;
        totalImg === document.querySelectorAll("img").length && renderWaterfall();
      };
    });
  };

  /* 将图片摆放形式转变为瀑布流 */
  var renderWaterfall = function () {
    var itemArr = Array.prototype.slice.call(document.querySelectorAll(".item"));
    var heightArr = itemArr.slice(0, 5).map(function (item) {
      return item.offsetHeight;
    });

    itemArr.slice(5).forEach(function (item) {
      var minHeight = Math.min.apply(null, heightArr);
      var minIndex = heightArr.indexOf(minHeight);

      item.style.position = "absolute";
      item.style.top = minHeight + 30 + "px";
      item.style.left = itemArr[minIndex].offsetLeft - 10 + "px";
      heightArr[minIndex] += item.offsetHeight + 20;
    });
  };

  /* 下滑菜单按钮点击事件 */
  var onDropBtnClick = function () {
    clearTimeout(dropBtnTimer);

    navContent.style.transition = "height .3s ease";
    navContent.style.height = dropBtnFlag ? "200px" : "0";
    dropBtnFlag = !dropBtnFlag;

    dropBtnTimer = setTimeout(function () {
      navContent.style.transition = "";
      !parseInt(navContent.style.height) && (navContent.style.height = "");
    }, 500);
  };

  /* 导航栏右侧按钮点击事件 */
  var onNavBtnClick = function () {
    window.location.href = `${this.id}.html`;
  };

  init();
})();