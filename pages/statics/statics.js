import * as echarts from '../../ec-canvas/echarts';

let chart = null; 
const db = wx.cloud.database();

function initChart(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  let chartrawData = null;
  let id = null;
  let tempid = null;
  wx.cloud.callFunction({
    name: 'login',
    data: {},
    success: res => {
        tempid= res.result.openid;
    },
    complete: () => {
      db.collection('user').where({
        _openid: tempid
      }).get().then(res => {
        chartrawData = res.data[0].habits;
        let chartData = [];
        for (let i in chartrawData) {
          chartData.push({
            name: chartrawData[i].name,
            value: chartrawData[i].checkedTimes
          })
        }
        let option = {
          title: {
            text: '习惯养成情况一览'
          },
          tooltip: {},
          legend: {
            data: ['保持日数']
          },
          series: [{
            name: '保持日数',
            type: 'pie',
            radius: '55%',
            roseType: 'angle',
            data: chartData
          }]
        };
        chart.setOption(option);
      })
    }
  })
  return chart;
}

Page({
  data: {
    userid: '',
    ec: {
      onInit: initChart
    },
  },
  onLoad: function(){
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.setData({
          userid: res.result.openid
        })
      },
      complete: () => {
        db.collection('user').where({
          _openid: this.data.userid
        }).get().then(res => {
          this.setData({
            numberOfHabits: res.data[0].habits.length
          })
          let temp = res.data[0].habits;
          let longestName = '';
          let longestTime = 0;
          for(let i in temp) {
            if (temp[i].checkedTimes > longestTime){
              longestTime = temp[i].checkedTimes;
              longestName = temp[i].name;
            }
          }
          this.setData({
            longestTime: longestTime,
            longestName: longestName
          })
        })
      }
    })
  }
});