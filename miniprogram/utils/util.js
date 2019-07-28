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

function validateForm(target,formFields){
  for(let i in formFields){
    const formField = formFields[i];
    const fieldName = formField.name;
    const fieldDescription = formField.description;
    const value = target[fieldName];
    const validates = formField.validates;

    for(let j in validates){
      validate = validates[j];
      switch(validate){
        case 'not-empty':
          if(!value){
            throw fieldDescription+'不能为空'
          }
        break;
        case 'phone':
            if (!/^1[3|4|5|7|8]\d{9}$/.test(value)){
              throw fieldDescription+'格式不合规范'
            }   
        break;
        case 'nationalId':
            if (!/^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$/.test(value)&&
                !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)
            ){
              throw fieldDescription+'格式不合规范'
            }
      }
    }
  }
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
    }else{
      field.text = field.placeholder;
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
          'formFields':this.data.formFields
        })      
      }
    }else if(field.type=='date'){
      this[field.name+'Input'] = function(e){
        var key = field.name;
        this.data['form'][key] = e.detail.value;
        field['text'] = e.detail.value;
        this.data.formFields[index]=field;
        this.setData({
          'formFields':this.data.formFields
        })      
      }
    }else{
      this[field.name+'Input'] = function(e){
        var key = field.name;
        this.data['form'][key] = e.detail.value;
      }
    }
  }.bind(page));

  page.setData({
    'formFields':formFields
  });

}

module.exports = {
  formatTime: formatTime,
  diff:diff,
  initForm:initForm,
  validateForm:validateForm
}
