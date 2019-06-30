const app = getApp();

// import city from '../../common/lib/city';
const activityService = require('/../../services/activity-service.js')

const formFields = [{
  name:'name',
  description:'报名人姓名',
  validates:['not-empty']
},{
  name:'gender',
  description:'报名人性别',
  validates:['not-empty']
},{
  name:'age',
  description:'报名人年龄',
  validates:['not-empty']
},{
  name:'mobile',
  description:'报名人电话',
  validates:['not-empty']
},{
  name:'job',
  description:'报名人职业',
  validates:['not-empty']
},{
  name:'nationalId',
  description:'报名人身份证号',
  validates:['not-empty']
},{
  name:'politicalStatus',
  description:'报名人政治面貌',
  validates:['not-empty']
},{
  name:'liveCommittee',
  description:'报名人所属社区居委会',
  validates:['not-empty']
},{
  name:'address',
  description:'报名人个人地址',
  validates:['not-empty']
}]

Page({
  data: {
    activityId:'',
    loading: true,
    form: {
      mobile: '',
      // country: '',
      address: '',
    },
    // items: {
    //   labelText: '设置为默认',
    //   iconType: 'circle',
    //   is_default: false
    // },
    index: 0,
    tipsData: {
      title: '',
      isHidden: true
    }
  },
  setDefault() {
    const isDefault = this.data.items.is_default;
    const iconColor = !this.data.items.is_default ? '#FF2D4B' : '';

    this.setData({
      items: {
        labelText: '设置为默认',
        iconType: !isDefault ? 'success' : 'circle',
        is_default: !isDefault,
        iconColor
      }
    });
  },
  onLoad(params) {
    formFields.forEach(function(field){
      this[field.name+'Input'] = function(e){
        var key = field.name;
        this.data['form'][key] = e.detail.value;
      }
    }.bind(this))    

    this.setData({ activityId: params.id });
 
    // if (options.id) {
      
    // } else {
    //     city.init(this);
    // }
     
  },
  submitBtn() {
    const that = this;
    var participant = this.data.form;
    if (!participant.name) { that.showToast('报名人姓名不能为空'); return; }
    // if (!participant.gender) { that.showToast('报名人性别'); return; }
    // if (participant.name.length < 2) { that.showToast('报名人姓名限制为2~15个字符'); return; }
    // if (!participant.mobile) { that.showToast('手机号不能为空'); return; }
    // if (!/^1[3|4|5|7|8]\d{9}$/.test(participant.mobile)) { that.showToast('手机格式有误，请重新输入'); return; }
    // //if (participant.city.provinceIndex == 0) { that.showToast('省市地址不能为空'); return; }
    // if (!participant.address) { that.showToast('街道地址不能为空'); return; }
    // if (participant.address.length < 5) { that.showToast('街道地址字数必须在5~60之间'); return; }

    // province: participant.addressSelect.provinceIdx[participant.addressSelect.provinceIndex],
    // city: participant.addressSelect.cityIdx[participant.addressSelect.provinceIndex][participant.addressSelect.cityIndex],
    // county: participant.addressSelect.districtIdx[participant.addressSelect.cityIdx[participant.addressSelect.provinceIndex][participant.addressSelect.cityIndex]][participant.addressSelect.districtIndex],

    let userInfo = app.globalData.userInfo;
    participant.nickName = userInfo.nickName;
    participant.avatarUrl = userInfo.avatarUrl;

    console.info(userInfo)

    activityService.signup(this.data.activityId,participant).then(function(response){
        if (response.success){
          that.showToast('报名成功');

          setTimeout(function(){
            var pages = getCurrentPages();
            pages[pages.length-2].onLoad({
              id:this.data.activityId
            });
            wx.navigateBack({
              delta: 1
            })
          }.bind(this),1000)
          
          // wx.navigateTo({
          //   url: '/pages/activities/detail/detail?id='+this.data.activityId,participant
          // })
        }else{
          that.showToast('报名失败'+response.message);
        }
    }.bind(this)).catch(function(){
      that.showToast('报名失败');
    });


  },
  bindPickerChange(e) {
    this.setData({
      index: e.detail.value
    });
  }
});