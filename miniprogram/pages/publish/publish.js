const app = getApp();

// import city from '../../common/lib/city';
const activityService = require('../../services/activity-service')
const util = require('../../utils/util')
const _ = require('../../utils/lodash')

const formFields = [{
  name:'title',
  description:'活动名称',
  validates:['not-empty']
},{
  name:'status',
  type:'picker',
  values:activityService.getStatus(),
  placeholder:'请选择活动状态',
  description:'活动状态',
  validates:['not-empty']
},{
  name:'address',
  description:'活动地点',
  validates:['not-empty']
},{
  name:'startDate',
  type:'date',
  placeholder:'请选择开始日期',
  description:'开始日期',
  validates:['not-empty']
},{
  name:'endDate',
  type:'date',
  placeholder:'请选择结束日期',
  description:'结束日期',
  validates:['not-empty']
},{
  name:'description',
  description:'描述',
  validates:['not-empty']
},{
  name:'numberLimit',
  description:'招募人数',
  validates:['not-empty']
},{
  name:'type',
  type:'picker',
  values: activityService.getTypes(),
  placeholder:'请选择活动类型',
  description:'活动类型',
  validates:['not-empty']
}];

Page({
  data: {
    loading: true,
    formFields:formFields,
    form: {
      participants:[],
      images:[]
    },
    canSubmit:true
  },
  onLoad(params) {

    if(params && params._id){
      wx.showLoading({
        title: '正在获取活动信息',
        mask: true
      });

      activityService.getById(params._id).then(function(activity){
        this.setData({
          form:activity
        });
  
        //init form
        util.initForm(this,activity,formFields);
  
        this.setData({
          formFields:formFields
        });

        wx.hideLoading();
  
      }.bind(this)).catch(function(err){
          wx.showToast({
            icon:'none',
            title: '无法初始化发布页面'+err.message
          })
      });
    }else{
      util.initForm(this,{},formFields); 
    }
    
  },
  submitBtn() {
    const that = this;
    var activity = this.data.form;
    try{
      util.validateForm(activity,formFields);
    }catch(message){
      wx.showToast({
        icon:'none',
        title: message
      });
      return;
    }

    this.setData({
      canSubmit:false
    });

    activityService.save(activity).then(function(response){
        wx.showToast({
          icon: 'none',
          title: '保存活动成功'
        });

        setTimeout(function(){

          this.setData({
            canSubmit:true
          });
          
          this.requireRefresh(1);
          // wx.navigateTo({
          //   url: '/pages/activities/activities?search=singed'
          // })
          wx.navigateBack({
            delta: 1
          })
        }.bind(this),2000);
        
    }.bind(this)).catch(function(err){
      wx.showToast({
        icon: 'none',
        title: '保存活动失败,原因:\n' + err.message
      });

      this.setData({
        canSubmit:true
      });
    }.bind(this));

  },
  uploadImage: function () {
    if(!this.data.form._id){
      wx.showToast({
        icon: 'none',
        title: '请先保存活动再添加图片',
      });
      return;
    }

    // 选择图片
    wx.chooseImage({
      count: 5,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上图片传中',
          mask: true
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = this.data.form._id+'/'+Date.now() + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: function(res) {
            if(!this.data.form.images)this.data.form.images=[];
            this.data.form.images.push(res.fileID)
 
            activityService.save({
              _id:this.data.form._id,
              images:this.data.form.images
            }).then(function(){

              this.requireRefresh(1);

              this.setData({
                form:this.data.form
            });

            this.setData({
              form:this.data.form
            });      

            }.bind(this));
          }.bind(this),
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      }.bind(this),
      fail: e => {
        console.error(e)
      }
    })
  },

  uploadVideo: function () {
    if(!this.data.form._id){
      wx.showToast({
        icon: 'none',
        title: '请先保存活动再添加视频',
      });
      return;
    }

    wx.chooseVideo({
      maxDuration: 60,
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: function (res) {

        wx.showLoading({
          title: '上视频传中',
          mask: true
        }) 

        const filePath = res.tempFilePath;
        
        const cloudPath = this.data.form._id+'/vedio-'+Date.now() + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: function(res) {
            if(!this.data.form.vedios)this.data.form.vedios=[];
            this.data.form.vedios.push(res.fileID)
 
            activityService.save({
              _id:this.data.form._id,
              vedios:this.data.form.vedios
            }).then(function(){
              this.setData({
                form:this.data.form
            });

            this.setData({
              form:this.data.form
            });      

            }.bind(this));
          }.bind(this),
          fail: e => {
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      }.bind(this),
      fail: e => {
        console.error(e)
      }
    })
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
  delImg:function(e){
    wx.showLoading({
      title:'正在删除',
      mask: true
    });

    wx.cloud.deleteFile({
      fileList: [e.target.id],
      success: res => {
      
        this.requireRefresh(1);

        var activity = {
          _id:this.data.form._id
        }

        switch(e.target.dataset.type){
          case 'image':
              this.data.form.images.forEach(function(v,index){
                if(v==e.target.id){
                  this.data.form.images.splice(index,1);
                  return true;
                }
              }.bind(this));
              activity.images = this.data.form.images;
              break;
          case 'vedio':
              this.data.form.vedios.forEach(function(v,index){
                if(v==e.target.id){
                  this.data.form.vedios.splice(index,1);
                  return true;
                }
              }.bind(this));
              activity.vedios = this.data.form.vedios;
              break;
        }

        activityService.save(activity).then(function(){
          this.setData({
            form:this.data.form
          });
        }.bind(this));

      },
      fail: function(err){
        wx.showToast({
          icon:'none',
          title: '无法删除图片'+e.target.id+'原因：'+err.message
        });     
      },
      complete: () => {
        wx.hideLoading()
      }
    });
  },
  setAsCover:function(e){
    let index = e.target.dataset.index; 

    this.data.form.images.unshift(this.data.form.images.splice(index,1)[0]);

    activityService.save({
      _id:this.data.form._id,
      images:this.data.form.images
    }).then(function(){
      this.setData({
        form:this.data.form
      });

      wx.showToast({
        title: '成功设置封面',
        icon: 'none'
      });

      this.requireRefresh(1);

    }.bind(this));
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
  }

});