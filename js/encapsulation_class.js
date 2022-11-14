/**
 * canvas 封装类 
 * 减少canvasAPI的调用
 */


/** 
 * EnableCircle v1.0.0
 * @param {Object} set
 * id:'time-graph-canvas', // 节点标签 [必填] id选择器
 * value: 80, // 百分比值 [必填] 
 * bgColor: '', // 背景颜色 十六进制 [可填] 默认为透明;  当填了type的vba_color 或target的 可不填
 * cirColor: '#e54d42', // 进度条颜色 十六进制 [必填] 当填了type的vba_color 或target的 可不填
 * textColor: '#f37b1d', // 字体颜色 十六进制 [必填] 当填了type的vba_color 或target的 可不填
 * type: 'shadow', // 样式 [可填] 默认:none 样式可选: shadow (添加阴影);vba_color(优先级最高特殊样式) none (无)
 * lineCap: 'round', // 进度条末端类型 [可填] 默认:butt (平滑);round (圆形线帽) 
 * target: 'default', // 进度条指定类型 [可填] 默认: default 
 * size: 60,// 环形半径 [可填] 默认: 40
 * lineWidth: 14, // 进度条宽度 [可填] 默认: 8 最高60
 * open: 'between' // 进度条开始点 [可填] 默认: top 可选 bottom 、top 、between
 */
class EnableCircle {
  constructor(set) {
    this.id = document.getElementById(set.id); // id 节点id
    this.context = this.id.getContext("2d"); // 节点canvas上下文
    this.centerX = this.id.width / 2;// canvas绘制的中心点X
    this.centerY = this.id.height / 2; // canvas绘制的中心点Y
    this.radCircle = Math.PI * 2 / 100; //将360度分成100份，那么每一份就是rad度
    this.bgColor = set.bgColor || '#e7ebed00'; // 进度条背景色
    this.cirColor = set.cirColor || '#2196f3'; // 进度条背景色
    this.open = set.open || 'top';
    this.size = this.rounded(set.size) || this.rounded(40); // 半径发小
    this.lineCap = set.lineCap || 'butt';
    this.speed = 0; //加载的快慢就靠它了
    this.clockWise = set.clockWise ? false : true; // 顺时针 / 逆时针
    this.window_raf = null; // 浏览器动画执行 id
    this.lineWidth = set.lineWidth ? set.lineWidth > 30 ? 30 : set.lineWidth : 8;
    this.max_value = set.value || 100;
    this.textColor = set.textColor || this.cirColor;
    this.fontSize = this.rounded(this.size / 2.5) + 'px' || '14px';
    this.type = set.type || 'none';
    this.target = set.target || 'default';
    if (this.target && this.target !== 'default') {
      console.log("222")
      this.cirColor = this.targetStyle[this.target].circleColor
      this.bgColor = this.targetStyle[this.target].bgColor
      this.borderColor = this.targetStyle[this.target].borderColor
      this.textColor = this.targetStyle[this.target].textColor
    }
    this.start()
  }
  targetStyle = {
    primary: {
      circleColor: "#2196f3",
      bgColor: '#cce6ff',
      textColor: '#2196f3',
      borderColor: 'rgba(20, 28, 51, 0.7)',
    },
    info: {
      circleColor: "#1cbbb4",
      bgColor: '#d7f0db',
      textColor: '#f37b1d',
      borderColor: 'rgba(20, 28, 51, 0.7)',
    },
    warning: {
      circleColor: "#fbbd08",
      bgColor: '#fef2ce',
      textColor: '#f37b1d',
      borderColor: 'rgba(20, 28, 51, 0.7)',
    },
    danger: {
      circleColor: "#e54d42",
      bgColor: '#fadbd9',
      textColor: '#f37b1d',
      borderColor: 'rgba(20, 28, 51, 0.7)',
    }
  }
  //基础绘制外圈
  peripheryCircle(n, vba) {
    this.context.save();
    this.context.beginPath();
    this.context.strokeStyle = this.cirColor;
    this.context.fillStyle = this.cirColor;
    this.context.lineWidth = this.lineWidth;
    this.context.lineCap = this.lineCap;
    vba()
    this.context.arc(this.centerX, this.centerY, this.size, this.startPiont(), this.endPiont(n), false);
    if (this.type !== "vba_color" && this.type !== "none") {
      this.shadow();
    }
    this.context.stroke();
    this.context.restore();
  }
  // 进度条开始点
  startPiont() {
    if (this.open === 'top') {
      return -Math.PI * 0.5
    } else if (this.open === "bottom") {
      return Math.PI * 0.5
    } else if (this.open === "between") {
      return Math.PI * 0.7
    } else {
      return -Math.PI * 0.5
    }
  }
  // 进度条结束点
  endPiont(n) {
    if (this.open === 'top') {
      return Math.PI * (2 * n * 0.01) + -Math.PI * 0.5
    } else if (this.open === "bottom") {
      return Math.PI * (2 * n * 0.01) + Math.PI * 0.5
    } else if (this.open === "between") {
      return Math.PI * (2 * n * 0.01) + Math.PI * 0.7
    } else {
      return Math.PI * (2 * n * 0.01) + -Math.PI * 0.5
    }
  }
  //基础底色外圈
  backdropCircle(vba) {
    this.context.save();
    this.context.beginPath();
    this.context.fillStyle = this.bgColor
    this.context.strokeStyle = this.bgColor;
    this.context.lineWidth = this.lineWidth;
    vba()
    this.context.arc(this.centerX, this.centerY, this.size, 0, Math.PI * 2, false);
    this.context.stroke();
    this.context.closePath();
    this.context.restore();
  }
  // 外圈绘制
  outBorder(vba) {
    this.context.save();
    this.context.beginPath();
    this.context.fillStyle = this.borderColor
    this.context.strokeStyle = this.borderColor;
    this.context.lineWidth = 5;
    vba()
    this.context.arc(this.centerX, this.centerY, this.size + 5, 0, Math.PI * 2, false);
    this.context.stroke();
    this.context.closePath();
    this.context.restore();
  }
  // 内圈绘制
  inBorder(vba) {
    this.context.save();
    this.context.beginPath();
    this.context.fillStyle = this.borderColor
    this.context.strokeStyle = this.borderColor;
    this.context.lineWidth = 5;
    vba()
    this.context.arc(this.centerX, this.centerY, this.size - 5, 0, Math.PI * 2, false);
    this.context.stroke();
    this.context.closePath();
    this.context.restore();
  }
  //百分比文字绘制
  whiteText(n, vba) {
    this.context.save();
    this.context.fillStyle = this.textColor;
    if (vba) {
      vba()
    }
    this.context.font = this.fontSize + " Arial";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(n.toFixed(0) + "%", this.centerX, this.centerY);
    this.context.restore();
  }
  // 阴影设置
  shadow() {
    this.context.shadowColor = '#3333333d';
    this.context.shadowBlur = 6;
    this.context.shadowOffsetX = 4;
    this.contextshadowOffsetY = 8;
  }
  // 特殊样式
  vba_setCircle() {
    var _that = this
    this.peripheryCircle(this.speed, function () {
      var vba_grd = _that.context.createLinearGradient(_that.centerX - _that.size / 2, _that.centerY - _that.size / 2, _that.centerX + _that.size, _that.centerY + _that.size);
      vba_grd.addColorStop(0.2, "#1cbbb380");
      vba_grd.addColorStop(0.8, "#1cbbb4");
      _that.context.fillStyle = vba_grd;
      _that.context.strokeStyle = vba_grd;
      _that.context.shadowColor = '#1cbbb3c0';
      _that.context.shadowBlur = 6;
      _that.context.shadowOffsetX = 2;
      _that.contextshadowOffsetY = 4;
      _that.context.lineWidth = 14
    })
    this.backdropCircle(function () {
      _that.context.fillStyle = '#e7ebed00';
      _that.context.strokeStyle = '#e7ebed00';
      _that.context.lineWidth = 20
    })
    this.whiteText(this.rounded(this.speed), function () {
      _that.context.fillStyle = '#f37b1d';
    });
  }
  // 避免浮点运算 取整数
  rounded(somenum) {
    var round = (0.5 + somenum) | 0;
    round = ~~(0.5 + somenum);
    round = (0.5 + somenum) << 0;
    return round
  }
  loop() {
    this.context.clearRect(0, 0, this.id.width, this.id.height);
    if (this.type === 'vba_color') {
      if (this.vba_setCircle) {
        this.vba_setCircle();
      }
    } else {
      this.backdropCircle(function () { });
      if (this.borderColor) {
        this.inBorder(function () { });
        this.outBorder(function () { });
      }
      this.peripheryCircle(this.rounded(this.speed), function () { });
      this.whiteText(this.rounded(this.speed), function () { });
    }
    // this.context.drawImage(this.cache_id, 0,0, this.id.width, this.id.height);
  }
  start() {
    window.RAF = (function () {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };
    })();
    var _that = this;
    this.loop()
    console.log(RAF, window.RAF)
    this.window_raf = RAF(function () {
      _that.start()
    });
    if (_that.speed >= this.max_value) {
      window.cancelAnimationFrame(this.window_raf)
      return
    } else {
      _that.speed += 0.5;
    }
  }

}


