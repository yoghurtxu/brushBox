<template>
    <div class="brush__box">
        <div class="brush__box--color">
            <span class="brush__header"></span>
            <a :class="['small-dot', {'active-dot': brushConfig.lineWidth===1}] "
               @click.prevent="getLineWidth(1)"></a>
            <a :class="['medium-dot', {'active-dot': brushConfig.lineWidth===2}] "
               @click.prevent="getLineWidth(2)"></a>
            <a :class="['big-dot', {'active-dot': brushConfig.lineWidth===3}] "
               @click.prevent="getLineWidth(3)"></a>
            <a :class="['canvas-red', {'active-red': brushConfig.activeColor==='red'}] "
               @click.prevent="getStrokeColor('red')"></a>
            <a :class="['canvas-blue',{'active-blue': brushConfig.activeColor==='blue'}]"
               @click.prevent="getStrokeColor('blue')"></a>
            <a :class="['canvas-yellow',{'active-yellow': brushConfig.activeColor==='yellow'}]"
               @click.prevent="getStrokeColor('yellow')"></a>
            <a :class="['canvas-black',{'active-black': brushConfig.activeColor==='black'}]"
               @click.prevent="getStrokeColor('black')"></a>
            <a :class="['canvas-gray',{'active-gray': brushConfig.activeColor==='gray'}]"
               @click.prevent="getStrokeColor('gray')"></a>
            <!--颜色选择器-->
            <el-color-picker class="block__picker--multi" size="mini"
                             v-model="brushConfig.pickerColor"></el-color-picker>
        </div>

        <video
            width="480"
            height="280"
            class="video__box"
            ref="videoBox">
        </video>

        <div>
            <canvas ref="brushDraw"
                    @mousedown="canvasMouseDown"
                    @mousemove="canvasMouseMove"
                    @mouseup="canvasMouseUp">
            </canvas>
            <!--todo 文本框功能还有问题待修复-->
            <!--截图写文字-->
            <!--<input  v-show="isCanvasText" ref="brushText" id="textItem" v-model="brushConfig.textVal"
                   @input="inputText"></input>-->
        </div>

        <div class="brush__box--feature">
            <a title="实线方框" :class="['rect',{'active-rect':brushConfig.type==='rect'}]"
               @click.prevent="drawType('rect')"></a>
            <a title="圆形" :class="['circle',{'active-circle':brushConfig.type==='circle'}]"
               @click.prevent="drawType('circle')"></a>
            <a title="箭头" :class="['arrow',{'active-arrow':brushConfig.type==='arrow'}]"
               @click.prevent="drawType('arrow')"></a>
            <a title="铅笔" :class="['pen',{'active-pen':brushConfig.type==='pen'}]" @click.prevent="drawType('pen')"></a>
            <!--todo 下面这三个图标图标没有找到合适的，UI后面再改-->
            <a title="直线" class="line"
               @click.prevent="drawType('line')"></a>
            <a title="橡皮擦" class="eraser"
               @click.prevent="drawType('eraser')"></a>
            <a title="虚线方框" class="dot"
               @click.prevent="drawType('cut')"></a>
            <!--todo 文本框功能还有问题待修复-->
            <!--<a :class="['text',{'active-text':brushConfig.type==='text'}]" @click.prevent="drawType('text')"></a>-->
            <a title="撤销" class="bend-arrow" @click.prevent="backCanvas"></a>
            <a title="生成图片" class="save-canvas" @click.prevent="generatePic"></a>
        </div>
    </div>
</template>

<script>

    import {BrushModel} from './BrushModel.js';
    import {dataURLtoFile} from '@/assets/js/utils.js';

    export default {
        name: "BrushBox",
        data() {
            return {
                isCanvasText: false,//canvas是否写字
                textMaxWidth: null,//文本框最大宽度
                draw: null,//canvas对象
                //画笔相关参数
                brushConfig: {
                    arr: [],//存放画布的数组
                    type: 'pen',//画笔类型
                    style: '',//填充或者无填充
                    lineWidth: 1,//线条宽度
                    strokeColor: '#FF2424', //canvas画笔默认颜色
                    activeColor: 'red', //canvas画笔默认选中颜色状态
                    startX: 0,//canvas鼠标按下去的初始x坐标
                    startY: 0,//canvas鼠标按下去的初始Y坐标
                    endX: 0,//canvas鼠标按下去的最终x坐标
                    endY: 0,//canvas鼠标按下去的最终Y坐标
                    pickerColor: null, //颜色选择器
                    textVal: '',//canvas文本框的值
                },
                isMouseDown: false,//video标签鼠标事件是否开始动作
                isCanvasStart: false, //canvas书写是否开始标志
                canvasId: null, //canvas节点
                context: null, //canvas.getContext
            }
        },
        watch:{
            'brushConfig.pickerColor': function (newColor) {
                this.brushConfig.strokeColor = newColor;
                this.brushConfig.activeColor = '';
            },
        },
        mounted() {
            this.brushVideo()
        },
        methods: {
            //画笔宽度
            getLineWidth(width) {
                this.brushConfig.lineWidth = width;
            },
            //获取canvas画笔颜色,并在鼠标移动绘画的时候重置线条颜色
            getStrokeColor(lineColor) {
                const COLOR_MAP = {
                    'red': '#FF2424',
                    'blue': '#1395F1',
                    'green': '#52DD74',
                    'yellow': '#FFF21A',
                    'black': '#1E1E1E',
                    'gray': '#929292'
                }
                this.brushConfig.strokeColor = COLOR_MAP[lineColor];
                this.brushConfig.activeColor = lineColor;
            },
            //画笔
            brushVideo() {
                let videoItem = this.$refs.videoBox; //需要截图的包裹的（原生的）DOM 对象
                const videoWidth = videoItem.offsetWidth; //获取dom 宽度
                const videoHeight = videoItem.offsetHeight; //获取dom 高度
                this.canvasId = this.$refs.brushDraw;
                this.context = this.canvasId.getContext('2d'); //获取context
                this.canvasId.width = videoWidth; //定义canvas 宽度
                this.canvasId.height = videoHeight; //定义canvas 高度
            },

            // 画笔类型(矩形圆形铅笔等等)
            drawType(type) {
                this.brushConfig.type = type;
            },
            // todo 文本框还有问题待修复
            //文本框输入
            inputText() {
                //实际上只有type为text才会执行到这里
                // this.textMaxWidth=this.$refs.brushText.style.offsetRight;
                this.textMaxWidth = 50;
                this.draw[this.brushConfig.type](this.brushConfig.textVal, this.brushConfig.startX, this.brushConfig.startY, this.textMaxWidth);
            },
            //撤销
            backCanvas() {
                this.brushConfig.arr.pop();
                //clearRect() 方法清空给定矩形内的指定像素。
                this.context.clearRect(0, 0, this.canvasId.width, this.canvasId.height);
                if (this.brushConfig.arr.length > 0) {
                    // putImageData() 方法将图像数据（从指定的 ImageData 对象）放回画布上
                    this.context.putImageData(this.brushConfig.arr[this.brushConfig.arr.length - 1], 0, 0, 0, 0, this.canvasId.width, this.canvasId.height);
                }
            },

            //canvas鼠标按下，开始书写
            canvasMouseDown(event) {
                if (!this.isStroke) {
                    this.isStroke = true
                }
                this.brushConfig.startX = event.offsetX || event.layerX,
                    this.brushConfig.startY = event.offsetY || event.layerY;

                //铅笔
                if (this.brushConfig.type == "pen") {
                    this.context.beginPath();
                    this.context.moveTo(this.brushConfig.startX, this.brushConfig.startY);
                } else {
                    this.context.beginPath();
                    this.context.moveTo(this.brushConfig.startX, this.brushConfig.startY);
                }

                this.draw = new BrushModel(this.context, {
                    type: this.brushConfig.style,
                    color: this.brushConfig.strokeColor,
                    width: this.brushConfig.lineWidth
                });
            },

            //canvas鼠标抬起，结束书写
            canvasMouseUp() {
                this.isStroke = false;
                // getImageData() 复制画布上指定的矩形的像素数据
                this.brushConfig.arr.push(this.context.getImageData(0, 0, this.canvasId.width, this.canvasId.height));
            },

            //canvas鼠标移动
            canvasMouseMove(event) {
                if (!this.draw || !this.isStroke) return;
                this.brushConfig.endX = event.offsetX || event.layerX,
                    this.brushConfig.endY = event.offsetY || event.layerY;
                if (this.brushConfig.type != "eraser") {
                    //clearRect() 方法清空给定矩形内的指定像素。 TODO 先注释，后面改回来
                    // this.context.clearRect(0,0,this.canvasId.width,this.canvasId.height);
                    if (this.brushConfig.arr.length != 0) {
                        // putImageData() 方法将图像数据（从指定的 ImageData 对象）放回画布上。
                        this.context.putImageData(this.brushConfig.arr[this.brushConfig.arr.length - 1], 0, 0, 0, 0, this.canvasId.width, this.canvasId.height);
                    }
                }
                //如果是文本框，不需要画，而是键盘输入文字的时候才画
                if (this.brushConfig.type != 'text') {
                    this.draw[this.brushConfig.type](this.brushConfig.startX, this.brushConfig.startY, this.brushConfig.endX, this.brushConfig.endY);
                }

            },
            // 生成图片
            generatePic() {
                //画布内容转化为图片
                let strDataURI = this.canvasId.toDataURL("image/png");
                //base64转换为file对象
                let newFile = dataURLtoFile(strDataURI, `canvas${new Date().getTime()}.png`)
                alert('图片已生成，请打开控制台查看');
                console.log('base64：', strDataURI);
                console.log('file：', newFile);
            },
        }

    }
</script>

<style lang="scss" scoped>
    @import "brush-box";
</style>
