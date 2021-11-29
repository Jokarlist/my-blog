(function () {
  var dropBtnFlag = true;
  var dropBtnTimer = null;
  var blogData = [];
  var curPage = 1;
  var pageNum = null; // 应渲染的总页码数
  var mostNum = 5; // 应渲染的最大中间分页数

  // 入口函数
  var init = function () {
    initBlogs();
    initWidgets();
    // 创建分页
    renderPagination();
    // 初始事件绑定
    initEvents();
  };

  var initEvents = function () {
    dropBtn.addEventListener("click", onDropBtnClick, false);
    document.querySelectorAll(".list-item").forEach(function (node) {
      node.addEventListener("click", onNavBtnClick, false);
    });
    addBtn.addEventListener("click", onAddBtnClick, false);
    // 由于渲染博文结构时所产生的删除按钮是未来元素，则采用其父元素事件委托方式来绑定事件处理函数
    mainContent.addEventListener("click", onMainContentClick, false);
    window.addEventListener("hashchange", onGlobalHashChange, false);
  };

  /* 初始获取博文数据 */
  var initBlogs = function () {
    if (localStorage.blogData) {
      blogData = JSON.parse(localStorage.blogData);
      pageNum = Math.ceil(blogData.length / 3);
      renderBlogPost(curPage);
      renderPagination();
    } else {
      ajax({
        url: "/getBlogData/",
        method: "GET",
        success: function ({
          data
        }) {
          localStorage.blogData = JSON.stringify(data);
          blogData = data;
          pageNum = Math.ceil(blogData.length / 3);
          renderBlogPost(curPage);
          renderPagination();
        }
      });
    }
  };

  /* 渲染博文主体数据函数 */
  var renderBlogPost = function (currentPage) {
    curPage = currentPage;

    var dataArr = blogData.slice((curPage - 1) * 3, curPage * 3);
    var postStr = dataArr.map(function (item) {
      return `
        <div class="post">
          <h2 class="post-title">
            <a href="#page=${curPage}">${item.mainTitle}</a>
          </h2>
          <div class="post-meta">
            <span class="time">2021年${item.date.split("-").join("月")+"日"}</span>
          </div>
          <div class="post-entry">
            <h2>前言</h2>
            <p>${item.smallPara}</p>
            <h2>${item.subTitle[0]}</h2>
            <p>${item.bigPara[0]}</p>
            <h3>${item.subTitle[1]}</h3>
            <p>${item.bigPara[1]}</p>
            <div class="del-blog">
              <span id="delBtn" data-id=${item.blogId}>删除博文</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    mainContent.innerHTML = postStr;
  };

  /* 渲染分页函数 */
  var renderPagination = function () {
    new Pager({
      currentPage: curPage,
      totalPage: pageNum,
      mostNumber: mostNum,
      callback: renderBlogPost
    }, paginationWrapper).init();
  };

  /* 删除博文按钮点击事件 */
  var onMainContentClick = function (e) {
    if (e.target.id === "delBtn") {
      var id = e.target.dataset.id;

      if (window.confirm("是否删除该篇文章？")) {
        ajax({
          url: `/delBlog/${id}`,
          method: "DELETE",
          success: function (res) {
            blogData = res;
            if (blogData.length) {
              localStorage.blogData = JSON.stringify(blogData);
              pageNum = Math.ceil(blogData.length / 3);
              curPage > pageNum && (curPage = pageNum);
              renderBlogPost(curPage);
              renderPagination();
            } else {
              localStorage.removeItem("blogData");
              renderBlogPost(curPage);
              paginationWrapper.innerHTML = "";
            }
          }
        });
      }
    }
  };

  /* 新增博文按钮点击事件 */
  var onAddBtnClick = function () {
    ajax({
      url: "/addBlogRandom/",
      method: "GET",
      success: function (res) {
        blogData.push(res.list);
        localStorage.blogData = JSON.stringify(blogData);
        pageNum = Math.ceil(blogData.length / 3);
        curPage = pageNum;
        renderBlogPost(curPage);
        renderPagination();
      }
    });
  };

  /* 全局hash改变事件 */
  var onGlobalHashChange = function () {
    var curHash = parseInt(location.hash.split("=")[1]);

    renderBlogPost(curHash);
    renderPagination();
  }

  /* 导航栏右侧按钮点击事件 */
  var onNavBtnClick = function () {
    window.location.href = `${this.id}.html`;
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

  /* 初始时获取热门文章和友情链接数据并渲染 */
  var initWidgets = function () {
    ajax({
      url: "/getWidgetData/",
      method: "GET",
      success: function ({
        data
      }) {
        var hotArtData = data[0]["hotArt"];
        var friLinkData = data[0]["friLink"];
        var hotArtStr = `
          <ul>
            <li><a href="javascript:void(0);" title="${hotArtData[0]}">${hotArtData[0]}</a></li>
            <li><a href="javascript:void(0);" title="${hotArtData[1]}">${hotArtData[1]}</a></li>
            <li><a href="javascript:void(0);" title="${hotArtData[2]}">${hotArtData[2]}</a></li>
            <li><a href="javascript:void(0);" title="${hotArtData[3]}">${hotArtData[3]}</a></li>
            <li><a href="javascript:void(0);" title="${hotArtData[4]}">${hotArtData[4]}</a></li>
            <li><a href="javascript:void(0);" title="${hotArtData[5]}">${hotArtData[5]}</a></li>
            <li><a href="javascript:void(0);" title="${hotArtData[6]}">${hotArtData[6]}</a></li>
            <li><a href="javascript:void(0);" title="${hotArtData[7]}">${hotArtData[7]}</a></li>
          </ul>
        `;
        var friLinkStr = `
          <ul class="friendship">
            <li><a href="javascript:void(0);" title="${friLinkData[0]}">${friLinkData[0]}</a></li>
            <li><a href="javascript:void(0);" title="${friLinkData[1]}">${friLinkData[1]}</a></li>
            <li><a href="javascript:void(0);" title="${friLinkData[2]}">${friLinkData[2]}</a></li>
            <li><a href="javascript:void(0);" title="${friLinkData[3]}">${friLinkData[3]}</a></li>
            <li><a href="javascript:void(0);" title="${friLinkData[4]}">${friLinkData[4]}</a></li>
            <li><a href="javascript:void(0);" title="${friLinkData[5]}">${friLinkData[5]}</a></li>
            <li><a href="javascript:void(0);" title="${friLinkData[6]}">${friLinkData[6]}</a></li>
            <li><a href="javascript:void(0);" title="${friLinkData[7]}">${friLinkData[7]}</a></li>
            <li><a href="javascript:void(0);" title="${friLinkData[8]}">${friLinkData[8]}</a></li>
          </ul>
        `;

        hotPost.innerHTML = hotArtStr;
        relLink.innerHTML = friLinkStr;
      }
    });
  };

  init();
})();