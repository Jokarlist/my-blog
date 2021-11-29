(function () {
  var listItemArr = document.querySelectorAll(".list-item");
  var tabItemArr = document.querySelectorAll(".tab-content-item");
  var navItemTitleData = [];
  var navItemContentData = [];

  var init = function () {
    initData();
    initEvents();
  };

  var initEvents = function () {
    main.addEventListener("click", onBackhomeBtnClick, false);
    listItemArr.forEach(function (node) {
      node.addEventListener("click", onListItemClick, false);
    });
    window.addEventListener("hashchange", onWindowHashChange, false);
  };

  var initData = function () {
    ajax({
      url: "/getNavData/",
      method: "GET",
      success: function ({
        data
      }) {
        navItemTitleData = data[0]["navItemTitle"];
        navItemContentData = data[0]["navItemContent"];
        renderTabItem();
      }
    });
  };

  /* 渲染侧边栏对应每一选项的内容数据 */
  var renderTabItem = function () {
    tabItemArr.forEach(function (node) {
      var randomNum = Math.floor(Math.random() * 18 + 7);
      var ulNode = document.createElement("ul");
      var str = "";

      for (var i = 0; i < randomNum; i++) {
        str += `
          <li>
            <a href="javascript:;" title="${navItemContentData[i]}">${navItemTitleData[i]}</a>
            <p>${navItemContentData[i]}</p>
          </li>
        `;
      }
      
      ulNode.innerHTML = str;
      node.appendChild(ulNode);
    });
  };

  /* 返回首页按钮点击事件 */
  var onBackhomeBtnClick = function () {
    window.location.href = `${this.id}.html`;
  };

  /* 监听全局hash改变事件 */
  var onWindowHashChange = function () {
    var curHash = window.location.hash.split("#")[1];
    
    tabItemArr.forEach(function (node) {
      node.classList.remove("is-show");
    });
    document.getElementsByClassName(curHash)[0].classList.add("is-show");
  };

  /* 侧边栏选项点击事件 */
  var onListItemClick = function (e) {
    Array.prototype.forEach.call(this.parentElement.children, function (item) {
      item.classList.remove("active");
    });
    this.classList.add("active");

    window.location.hash = `#${this.dataset.hash}`;
  };

  init();
})();