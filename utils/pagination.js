/**
 * 
 * @param {用户传递的配置对象} options 
 * @param {调用该分页构造器的容器对象} wrap 
 */
function Pager(options, wrap) {
  this.wrap = wrap;
  this.currentPage = options.currentPage || 1; // 当前页码
  this.totalPage = options.totalPage || 1; // 总页码数
  this.mostNumber = options.mostNumber || 1; // 中间最多渲染页码数
  this.callback = options.callback || function () {}; // 回调函数
}

/* 初始化分页组件 */
Pager.prototype.init = function () {
  // 渲染分页的结构
  this.renderElement();
  // 绑定事件
  this.initEvents();
};

/**
 * 
 * @param {最终渲染出来的字符串} mainStr 
 * @param {开始的页码编号} liStartNum 
 * @param {结束的页码编号} liEndNum 
 */
Pager.prototype.renderLiElem = function (mainStr, liStartNum, liEndNum) {
  for (var i = liStartNum; i <= liEndNum; i++) {
    if (i === this.currentPage) {
      mainStr += `<li class="current-page page-num">${i}</li>`;
    } else {
      mainStr += `<li class="page-num">${i}</li>`;
    }
  }

  return mainStr;
};

/* 渲染分页结构 */
Pager.prototype.renderElement = function () {
  this.wrap.innerHTML = "";

  var pageWrapper = document.createElement("ul");
  var left = `<li class="prev-page">&lt;</li>`;
  var right = `<li class="next-page">&gt;</li>`;
  var mainStr = "";

  pageWrapper.className = "pagination";
  pageWrapper.id = "pageSelect";

  if (this.totalPage < this.mostNumber) {
    // 渲染所有的页码
    mainStr = this.renderLiElem(mainStr, 1, this.totalPage);
  } else {
    // 渲染部分页码，此时前后有其一或都带有省略号
    if (this.currentPage <= 3) {
      // 省略号在后
      mainStr = this.renderLiElem(mainStr, 1, 3) + `......<li class="page-num">${this.totalPage}</li>`;
    } else if (this.currentPage > this.totalPage - 3) {
      // 省略号在前
      mainStr += `<li class="page-num">1</li>......`;
      mainStr = this.renderLiElem(mainStr, this.totalPage - 3 + 1, this.totalPage);
    } else {
      // 前后都有省略号
      mainStr += `<li class="page-num">1</li>......`;
      mainStr = this.renderLiElem(mainStr, this.currentPage - Math.floor((this.mostNumber - 1) / 2), this.currentPage + Math.ceil((this.mostNumber - 1) / 2));
      mainStr += `......<li class="page-num">${this.totalPage}</li>`;
    }
  }

  pageWrapper.innerHTML = left + mainStr + right;
  this.wrap.appendChild(pageWrapper);
  window.location.hash = `#page=${this.currentPage}`;
};

/* 绑定事件 */
Pager.prototype.initEvents = function () {
  var self = this;
  // 上一页点击事件
  document.getElementsByClassName("prev-page")[0].onclick = function () {
    self.currentPage--;

    if (!self.currentPage) {
      self.currentPage = 1;
      window.alert("当前为第一页");
      return;
    }

    window.location.hash = `#page=${self.currentPage}`;
    self.init();
    self.callback(self.currentPage);
  };

  // 下一页点击事件
  document.getElementsByClassName("next-page")[0].onclick = function () {
    self.currentPage++;

    if (self.currentPage > self.totalPage) {
      self.currentPage = self.totalPage;
      window.alert("当前为最后一页");
      return;
    }

    window.location.hash = `#page=${self.currentPage}`;
    self.init();
    self.callback(self.currentPage);
  };

  // 具体页码点击事件
  document.querySelectorAll(".page-num").forEach(function (node) {
    node.onclick = function () {
      self.currentPage = parseInt(this.innerText);
      window.location.hash = `#page=${self.currentPage}`;
      self.init();
      self.callback(self.currentPage);
    };
  });
};