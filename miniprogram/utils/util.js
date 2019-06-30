const _ = require('./lodash')

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function diff(object, base) {
  function changes(object, base) {
      return _.transform(object, function(result, value, key) {
          if (!_.isEqual(value, base[key])) {
              result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
          }
      });
  }
  return changes(object, base);
}

function initForm(page,target,formFields){
  formFields.forEach(function(field,index){  
    const value = target[field.name];
    if(value){
      if(field.type=='picker'){
        const result = _.find(field.values,function(o){
          return o.value == value;
        });
        if(!result){
          throw '无法从选项中找到value=' + value+ "的项"
        }
        
        field.text= result.text;
      }else{
        field.text = value;
      }
    } 
  });

  formFields.forEach(function(field,index){
    if(field.type=='picker'){
      this[field.name+'Input'] = function(e){
        var key = field.name;
        field.index = e.detail.value;
        this.data['form'][key] = field['values'][field.index].value;
        field.text = field['values'][field.index].text;
        this.data.formFields[index]=field;
        this.setData({
          formFields:this.data.formFields
        })      
      }
    }else if(field.type=='date'){
      this[field.name+'Input'] = function(e){
        var key = field.name;
        this.data['form'][key] = e.detail.value;
        field['text'] = e.detail.value;
        this.data.formFields[index]=field;
        this.setData({
          formFields:this.data.formFields
        })      
      }
    }else{
      this[field.name+'Input'] = function(e){
        var key = field.name;
        this.data['form'][key] = e.detail.value;
      }
    }
  }.bind(page));

}

module.exports = {
  formatTime: formatTime,
  diff:diff,
  initForm:initForm
}
