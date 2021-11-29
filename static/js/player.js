(function () {
  var audio = new Audio();
  var userId = null; // 用户id
  var playlistId = null; // 用户歌单id
  var tuneData = []; // 歌曲数据对象数组（对象内容包括歌曲名、歌手名、专辑图、歌曲id、歌曲链接）
  var curIndex = 0; // 当前播放歌曲对应的索引
  var len = null; // 歌曲数据对象数组的长度（即有多少首歌）
  var curMinute = null; // 当前歌曲播放的时间长度中的分钟数
  var curSecond = null; // 当前歌曲播放的时间长度中的秒数（除去分钟）
  var totalMinute = null; // 当前歌曲总时间长度中的分钟数
  var totalSecond = null; // 当前歌曲总时间长度中的秒数（除去分钟）
  var selfOffsetLeft = null; // 进度条距离文档左边的距离
  var offsetX = null; // 进度条上鼠标点距离文档左边的距离（即遮罩层的终点）
  var curMaskTime = null; // 进度条遮罩层代表的总时间长度
  var curMaskMinute = null; // 进度条遮罩层代表的总时间长度中的分钟数
  var curMaskSecond = null; // 进度条遮罩层代表的总时间长度中的秒数（除去分钟）

  var init = function () {
    initData();
    initEvents();
  };

  /* 初始化获取歌曲数据 */
  var initData = function () {
    var tempTuneIdStr = ""; // 临时的歌曲id组合字符串，用于获取歌曲url
    // 登录（获取用户ID)
    ajax({
      url: "http://localhost:3000/login",
      method: "POST",
      data: {
        email: "13878981607@163.com",
        password: "YANGBAOSHAN13238",
        timestamp: `${Date.now()}`
      },
      success: function (res) {
        userId = res.account.id;
        // 获取用户歌单（通过用户ID以获取歌单ID）
        ajax({
          url: "http://localhost:3000/user/playlist",
          method: "GET",
          data: {
            uid: userId
          },
          success: function (res) {
            playlistId = res.playlist[1].id;
            /* 获取歌单详情（通过歌单ID获取歌单中的歌曲详情） */
            ajax({
              url: "http://localhost:3000/playlist/track/all",
              method: "GET",
              data: {
                id: playlistId
              },
              success: function (res) {
                res.songs.forEach(function (item, index) {
                  var tempObj = {};

                  tempObj.tuneName = item.name;
                  tempObj.artistName = item.ar[0].name;
                  tempObj.tuneImg = item.al.picUrl;
                  tempObj.tuneId = item.id;
                  tuneData[index] = tempObj;
                });
                tempTuneIdStr = tuneData.map(function (item) {
                  return item.tuneId;
                }).join(",");
                /* 获取歌曲URL（通过歌曲详情中的歌曲ID获取歌曲的URL） */
                ajax({
                  url: "http://localhost:3000/song/url",
                  method: "GET",
                  data: {
                    id: tempTuneIdStr
                  },
                  success: function (res) {
                    // 这里因为返回的歌曲链接数组是内部排过序的，不符合原要求的数据，所以要双循环重新排序填入
                    res.data.forEach(function (item) {
                      for (var i = 0, len = tuneData.length; i < len; i++) {
                        if (tuneData[i].tuneId === item.id) {
                          tuneData[i]["tuneURL"] = item.url;
                          break;
                        }
                      }
                    });
                    len = tuneData.length;
                    initSongPlay();
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  var initEvents = function () {
    playPauseBtn.addEventListener("click", onPlayPauseBtnClick, false);
    prevBtn.addEventListener("click", onPrevBtnClick, false);
    nextBtn.addEventListener("click", onNextBtnClick, false);
    audio.addEventListener("timeupdate", onAudioTimeUpdate, false);
    progressContainer.addEventListener("mousemove", onProgressContainerMove, false);
    progressContainer.addEventListener("mouseleave", onProgressContainerLeave, false);
    progressContainer.addEventListener("click", onProgressContainerClick, false);
  };

  /* 初始化第一首歌 */
  var initSongPlay = function () {
    curTime.innerText = "00:00";
    endTime.innerText = "00:00";

    var curTune = tuneData[curIndex];

    musicName.innerText = curTune.tuneName;
    artistName.innerText = curTune.artistName;
    musicCover.src = curTune.tuneImg;
    audio.src = curTune.tuneURL;
  };

  /* 进度条点击事件 */
  var onProgressContainerClick = function () {
    audio.currentTime = curMaskTime;
    progressBar.style.width = `${offsetX}px`;
    onProgressContainerLeave();
  };

  /* 进度条鼠标移出事件 */
  var onProgressContainerLeave = function () {
    expectBar.style.width = "0";
    curTimePrompt.innerText = "";
    curTimePrompt.style.display = "none";
  };

  /* 进度条鼠标移入事件 */
  var onProgressContainerMove = function (e) {
    selfOffsetLeft = Math.floor(this.getBoundingClientRect().left);
    offsetX = e.clientX - selfOffsetLeft;
    curMaskTime = offsetX / this.clientWidth * audio.duration;
    curMaskMinute = Math.floor(curMaskTime / 60);
    curMaskSecond = Math.floor(curMaskTime % 60);

    expectBar.style.width = `${offsetX}px`;
    curMaskMinute = curMaskMinute < 10 ? `0${curMaskMinute}` : `${curMaskMinute}`;
    curMaskSecond = curMaskSecond < 10 ? `0${curMaskSecond}` : `${curMaskSecond}`;

    isNaN(curMaskMinute) ? curTimePrompt.innerText = "--:--" : curTimePrompt.innerText = `${curMaskMinute}:${curMaskSecond}`;
    curTimePrompt.style.left = `${offsetX - 21}px`;
    curTimePrompt.style.display = "block";
  };

  /* audio的播放时间变化事件 */
  var onAudioTimeUpdate = function () {
    curMinute = Math.floor(audio.currentTime / 60);
    curSecond = Math.floor(audio.currentTime % 60);
    totalMinute = Math.floor(audio.duration / 60);
    totalSecond = Math.floor(audio.duration % 60);

    var playProgress = audio.currentTime / audio.duration * 100;

    curMinute = curMinute < 10 ? `0${curMinute}` : `${curMinute}`;
    curSecond = curSecond < 10 ? `0${curSecond}` : `${curSecond}`;
    totalMinute = totalMinute < 10 ? `0${totalMinute}` : `${totalMinute}`;
    totalSecond = totalSecond < 10 ? `0${totalSecond}` : `${totalSecond}`;

    isNaN(totalMinute) ? time.classList.remove("active") : time.classList.add("active");
    curTime.innerText = `${curMinute}:${curSecond}`;
    endTime.innerText = isNaN(totalMinute) ? "00:00" : `${totalMinute}:${totalSecond}`;
    progressBar.style.width = `${playProgress}%`;


    if (playProgress === 100) {
      playPauseBtn.className = "btn play-pause iconfont icon-bofang";
      progressBar.style.width = "0";
      curTime.innerText = "00:00";
      musicCover.parentElement.classList.remove("active");
      onNextBtnClick();
    }
  };

  /* 播放/暂停按钮点击事件 */
  var onPlayPauseBtnClick = function () {
    if (audio.paused) {
      playerContent.classList.add("active");
      musicCover.parentElement.classList.add("active");
      playPauseBtn.className = "btn play-pause iconfont icon-zanting";
      audio.play();
    } else {
      playerContent.classList.remove("active");
      musicCover.parentElement.classList.remove("active");
      playPauseBtn.className = "btn play-pause iconfont icon-bofang";
      audio.pause();
    }
  };

  /* 上一首按钮点击事件 */
  var onPrevBtnClick = function () {
    if (curIndex - 1 < 0) {
      curIndex = tuneData.length - 1;
    } else {
      curIndex--;
    }
    initSongPlay();
    onPlayPauseBtnClick();
  };

  /* 下一首按钮点击事件 */
  var onNextBtnClick = function () {
    if (curIndex + 1 > tuneData.length - 1) {
      curIndex = 0;
    } else {
      curIndex++;
    }
    initSongPlay();
    onPlayPauseBtnClick();
  };

  init();
})();