const db = wx.cloud.database();
let util = require("../../utils/util.js");

Page({
  data: {
    userid: "",
    avatarUrl: "",
    userInfo: {},
    introDisplay: true,
    containerDisplay: false,
    inputValue: "",
    deleteIndex: null,
    listItems: [],
    deleteDialogShow: false,
    buttons1: [{ text: "确定" }, { text: "取消" }],
    successDialogShow: false,
    checkSuccessDialogShow: false,
    checkFailDialogShow: false,
    buttons2: [{ text: "确定" }],
    buttons3: [{ text: "Ok" }]
  },
  onLoad: function() {
    // get openid
    wx.cloud.callFunction({
      name: "login",
      data: {},
      success: res => {
        this.setData({
          userid: res.result.openid
        });
      },
      fail: err => {
        console.error("[云函数] [login] 调用失败", err);
      },
      complete: () => {
        db.collection("user")
          .where({
            _openid: this.data.userid
          })
          .get()
          .then(res => {
            if (res.data.length == 0) {
              db.collection("user").add({
                data: {
                  habits: [],
                  createTime: Date()
                }
              });
              console.log("not found, created");
            } else {
              let array = res.data[0].habits;
              this.setData({
                listItems: array
              });
              console.log(this.data.listItems);
            }
          });
      }
    });
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // console.log(res);
        // if (res.authSetting) {
        if (res.authSetting["scope.userInfo"]) {
          wx.getUserInfo({
            success: res => {
              // console.log(res);
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              });
            },
            fail: res => {
              console.log(res);
            }
          });
        }
      }
    });
  },
  go: function(e) {
    this.setData({
      introDisplay: false
    });
    this.setData({
      containerDisplay: true
    });
  },
  check: function(e) {
    db.collection("user")
      .where({
        _openid: this.data.userid
      })
      .get()
      .then(res => {
        const _ = db.command;
        let tempArr = res.data[0].habits;
        if (
          //当天重复打卡
          tempArr[e.target.dataset.index].lastCheckedDay ==
          util.formatTime(new Date())
        ) {
          console.log("you ve checked today!");
          this.setData({
            checkFailDialogShow: true
          });
        } else {
          tempArr[e.target.dataset.index].lastCheckedDay = util.formatTime(
            new Date()
          );
          tempArr[e.target.dataset.index].checkedTimes++;
          this.setData({
            checkSuccessDialogShow: true
          });
          db.collection("user")
            .doc(res.data[0]._id)
            .update({
              data: {
                habits: tempArr
              }
            });
        }
      });
  },
  bindGetUserInfo: function() {
    this.go();
  },
  add: function() {
    if (this.data.inputValue == "") {
      return;
    }
    this.setData({
      successDialogShow: true
    });
    db.collection("user")
      .where({
        _openid: this.data.userid
      })
      .get()
      .then(res => {
        const _ = db.command;
        db.collection("user")
          .doc(res.data[0]._id)
          .update({
            data: {
              habits: _.push({
                name: this.data.inputValue,
                createdDate: util.formatTime(new Date()),
                checkedTimes: 0,
                lastCheckedDay: null
              })
            }
          })
          .then(() => {
            this.setData({
              inputValue: ""
            });
            db.collection("user")
              .where({
                _openid: this.data.userid
              })
              .get()
              .then(res => {
                let array = res.data[0].habits;
                this.setData({
                  listItems: array
                });
                console.log(this.data.listItems);
              });
          });
      });
  },
  setInputValue: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },
  openConfirm1: function(e) {
    // console.log(e.target.dataset.index);
    this.setData({
      deleteIndex: e.target.dataset.index
    });
    this.setData({
      deleteDialogShow: true
    });
  },

  tapDialog1Button(e) {
    if (e.detail.index == 0) {
      let temp = this.data.listItems;
      // console.log(temp);
      temp.splice(this.data.deleteIndex, 1);
      //在视图中删除此条
      this.setData({
        listItems: temp
      });
      console.log(temp);
      const _ = db.command;
      db.collection("user")
        .where({
          _openid: this.data.userid
        })
        .get()
        .then(res => {
          const _ = db.command;
          db.collection("user")
            .doc(res.data[0]._id)
            .update({
              data: {
                habits: _.set(this.data.listItems)
              }
            })
            .then(res => {
              console.log(res);
            });
        });
    }
    this.setData({
      deleteDialogShow: false
    });
  },
  tapDialog2Button(e) {
    this.setData({
      successDialogShow: false
    });
  },
  tapDialog3Button(e) {
    this.setData({
      checkSuccessDialogShow: false,
      checkFailDialogShow: false
    });
  }
});
