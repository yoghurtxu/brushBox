# canvas实现类似QQ截图的效果

已完成功能：

- [x] 选择画笔粗细
- [x] 选择画笔颜色
- [x] 画实线方框
- [x] 画圆形
- [x] 画箭头
- [x] 画直线
- [x] 画虚线方框
- [x] 橡皮擦
- [x] 撤销
- [x] 生成图片



尚待优化功能：

- [ ] 文本框
- [ ] 性能优化：只需存取画笔数据（名称、粗细等）、绘制方法、路径数据即可，无需存取canvas区域隐含的像素数据；但是修改后也有不足，即撤销回上一步，所有路径都要重新画
- [ ] 性能优化：修改橡皮擦功能，通过改变globalCompositeOperation为destination-out（默认为source-over）即可实现，然后和pen一样的做法
- [ ] 性能优化：canvas双缓存
- [ ] UI美化

直接上图：

以下是我用第三方截的效果图：

![image](https://111999x.oss-cn-beijing.aliyuncs.com/one.png)

以下是本项目的生成的base64效果图：

![image](https://111999x.oss-cn-beijing.aliyuncs.com/two.png)

感兴趣的同学可以下载下来涂鸦，欢迎指教。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
