const app = getApp()
const activityService = require('/../../../services/activity-service.js')
const _ = require('../../../utils/lodash')
const event = require('../../../utils/event')

Page({
  data: {
    userInfo:app.globalData.userInfo,
    activity: {},
    flexed: false
  },
 
  onLoad: function (param) {
    this.setData({
      userInfo:app.globalData.userInfo
    });

    var id=param._id;
    
    this.doOnload(id);
    
    event.on('getUserInfo',this,function(userInfo){
      this.setData({
        userInfo: userInfo
      });
      this.doOnload(id);
    });
  },
  
  doOnload: function(id){
    if(this.data.userInfo===true){
      return;
    }

    wx.showLoading({
      title: '正在加载活动内容',
      mask: true
    });
  
    activityService.getById(id).then(function(response){
      wx.hideLoading();
      response.statusText=_.find(activityService.getStatus(),function(o){
        return o.value==response.status;
       }).text;
    
       response.typeText = _.find(activityService.getTypes(),function(o){
        return o.value==response.type;
       }).text;
    
       this.setData({
          activity: response
       });
      
     }.bind(this)).
     catch(function(){
        wx.hideLoading();
        wx.showToast({
          title: '获取活动详情失败',
          icon: 'none'
        })
     });
  },
  imgPreview:function(event){
    var src = event.currentTarget.dataset.src;//获取data-src
    var imgList = event.currentTarget.dataset.list;//获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },
  flex: function () {
    this.setData({
      flexed: !this.data.flexed
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.activity.title,
      path: "pages/activities/detail/detail?_id=" + this.data.activity._id
    }
  },
  navigate:function(e){
    wx.navigateTo({
      url: e.target.dataset.url
    })  
  },
  requireRefresh:function(deep){
    deep = ++deep;
    const pages = getCurrentPages();
    const previousPage = pages[pages.length-deep];
    if(pages && previousPage){
      const requireRefresh = previousPage.requireRefresh;
      if(requireRefresh){
        requireRefresh(deep);
      }    
    }
  },
  onGetUserInfo: function (e) {
    return app.onGetUserInfo(e);
  },

  refuceGetUserInfo: function(e){
    return app.refuceGetUserInfo(e);
  }
});