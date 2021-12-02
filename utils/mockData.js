/* 博文数据的模板 */
var blogTemplate = {
  "blogId|+1": 1,
  "mainTitle|": "@ctitle(10, 16)",
  "subTitle|2": ["@ctitle(3, 6)"],
  "date": "@date('M-d')",
  "smallPara": "@cparagraph(2, 4)",
  "bigPara|2": ["@cparagraph(5, 8)"]
};

/* 热门文章和友情链接数据的模板*/
var widgetTemplate = {
  "hotArt|8": ["@ctitle(10, 16)"],
  "friLink|9": ["@ctitle(4, 9)"]
}

/* 小工具页数据模板 */
var utilTemplate = {
  "utilName|20": ["@ctitle(5, 8)"]
}

/* 瀑布流图片数据 */
var utilPicArr = [];

for (var i = 0; i < 20; i++) {
  utilPicArr[i] = `http://wechat.hyfarsight.com/${i}.jpg`;
}

/* 前端导航页数据模板 */
var navTemplate = {
  "navItemTitle|25": ["@ctitle(5, 10)"],
  "navItemContent|25": ["@cparagraph(1, 2)"]
};

/* 初始时获取前端导航页数据 */
Mock.mock("/getNavData/", {
  "status": "success",
  "msg": "请求数据成功",
  "data": [navTemplate]
});

/* 初始时获取小工具数据 */
Mock.mock("/getUtilData/", {
  "status": "success",
  "msg": "请求数据成功",
  "data": [utilTemplate]
})

/* 初始时获取瀑布流图片数据 */
Mock.mock("/getUtilPic/", {
  "status": "success",
  "msg": "请求数据成功",
  "data": utilPicArr
}) 

/* 初始时获取热门文章和友情链接数据 */
Mock.mock("/getWidgetData/", {
  "status": "success",
  "msg": "请求数据成功",
  "data": [widgetTemplate]
});

/* 初始时获取博客数据 */
Mock.mock("/getBlogData/", {
  "status": "success",
  "msg": "请求数据成功",
  "data|3": [blogTemplate]
});

/* 随机新增一条博客数据 */
Mock.mock("/addBlogRandom/", function () {
  var newBlog = Mock.mock({
    "list": blogTemplate
  });
  var blogData = null;

  // 防止localStorage.blogData没数据为undefined时调用JSON.parse()报错
  if (!localStorage.blogData) {
    blogData = [];
  } else {
    blogData = JSON.parse(localStorage.blogData);
    // 随机新增博文的编号会从1开始，所以要进行处理使其与原有数据学号保持增长趋势一致
    newBlog.list.blogId = blogData[blogData.length - 1].blogId + 1;
  }

  return newBlog;
});

/* 删除一条博客数据 */
Mock.mock(RegExp("/delBlog/."), "delete", function (options) {
  var id = options.url.split("/")[2];
  var blogData = JSON.parse(localStorage.blogData);

  for (var i = 0, len = blogData.length; i < len; i++) {
    if (blogData[i].blogId == id) {
      blogData.splice(i, 1);
      break;
    }
  }

  return blogData;
});