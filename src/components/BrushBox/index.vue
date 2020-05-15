<template>
    <div class="video-wrap">
        <div class="canvas-draw-color">
            <span class="canvas-draw-header"></span>
            <a :class="['small-dot', {'active-dot': canvasConfig.lineWidth===1}] "
               @click.prevent="getLineWidth(1)"></a>
            <a :class="['medium-dot', {'active-dot': canvasConfig.lineWidth===2}] "
               @click.prevent="getLineWidth(2)"></a>
            <a :class="['big-dot', {'active-dot': canvasConfig.lineWidth===3}] "
               @click.prevent="getLineWidth(3)"></a>
            <a :class="['canvas-red', {'active-red': canvasConfig.activeColor==='red'}] "
               @click.prevent="getStrokeColor('red')"></a>
            <a :class="['canvas-blue',{'active-blue': canvasConfig.activeColor==='blue'}]"
               @click.prevent="getStrokeColor('blue')"></a>
            <a :class="['canvas-yellow',{'active-yellow': canvasConfig.activeColor==='yellow'}]"
               @click.prevent="getStrokeColor('yellow')"></a>
            <a :class="['canvas-black',{'active-black': canvasConfig.activeColor==='black'}]"
               @click.prevent="getStrokeColor('black')"></a>
            <a :class="['canvas-gray',{'active-gray': canvasConfig.activeColor==='gray'}]"
               @click.prevent="getStrokeColor('gray')"></a>
            <!--颜色选择器-->
            <el-color-picker class="canvas-multi" size="mini" v-model="canvasConfig.pickerColor"></el-color-picker>
        </div>

        <video
                width="480"
                height="280"
                class="video"
                ref="video">
        </video>

        <div class="canvas-con">
            <canvas ref="draw_canvas"
                    @mousedown="canvasMouseDown"
                    @mousemove="canvasMouseMove"
                    @mouseup="canvasMouseUp">
            </canvas>
            <!--todo 文本框功能还有问题待修复-->
            <!--截图写文字-->
            <!--<input class="canvas-text" v-show="isCanvasText" ref="canvasText" id="textItem" v-model="canvasConfig.textVal"
                   @input="inputText"></input>-->
        </div>

        <div class="left-canvas-footer" ref="leftCanvasFooter">
            <a :class="['circle',{'active-circle':canvasConfig.type==='line'}]"
               @click.prevent="drawType('line')"></a>
            <a :class="['circle',{'active-circle':canvasConfig.type==='eraser'}]"
               @click.prevent="drawType('eraser')"></a>
            <a :class="['circle',{'active-circle':canvasConfig.type==='cut'}]"
               @click.prevent="drawType('cut')"></a>

            <a :class="['rect',{'active-rect':canvasConfig.type==='rect'}]" @click.prevent="drawType('rect')"></a>
            <a :class="['circle',{'active-circle':canvasConfig.type==='circle'}]"
               @click.prevent="drawType('circle')"></a>
            <a :class="['arrow',{'active-arrow':canvasConfig.type==='arrow'}]"
               @click.prevent="drawType('arrow')"></a>
            <a :class="['pen',{'active-pen':canvasConfig.type==='pen'}]" @click.prevent="drawType('pen')"></a>
            <!--todo 文本框功能还有问题待修复-->
            <!--<a :class="['text',{'active-text':canvasConfig.type==='text'}]" @click.prevent="drawType('text')"></a>-->
            <a class="bend-arrow" @click.prevent="backCanvas"></a>
            <a class="save-canvas" @click.prevent="sendCanvas"></a>
        </div>
    </div>
</template>

<script>

    //画笔相关参数
    const BRUSH_CONFIG = {
        arr: [],//
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
    }

    import {BrushModel} from './BrushModel.js';
    import {dataURLtoFile} from '@/assets/js/utils.js';

    export default {
        name: "BrushBox",
        data() {
            return {
                isCanvasText: false,//canvas是否写字
                textMaxWidth: null,//文本框最大宽度
                draw: null,//canvas对象
                //canvas相关参数
                canvasConfig: {
                    arr: [],//
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
        mounted() {
            this.brushVideo()
        },
        methods: {
            //画笔宽度
            getLineWidth(width) {
                this.canvasConfig.lineWidth = width;
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
                this.canvasConfig.strokeColor = COLOR_MAP[lineColor];
                this.canvasConfig.activeColor = lineColor;
            },
            //画笔
            brushVideo() {
                let video = this.$refs.video; //需要截图的包裹的（原生的）DOM 对象
                const videoWidth = video.offsetWidth; //获取dom 宽度
                const videoHeight = video.offsetHeight; //获取dom 高度
                this.canvasId = this.$refs.draw_canvas;
                this.context = this.canvasId.getContext('2d'); //获取context
                this.canvasId.width = videoWidth; //定义canvas 宽度
                this.canvasId.height = videoHeight; //定义canvas 高度
                console.log('======', videoWidth, videoHeight)
            },

            // 画笔类型(矩形圆形铅笔等等)
            drawType(type) {
                this.canvasConfig.type = type;
            },
            // todo 文本框还有问题待修复
            //文本框输入
            inputText() {
                //实际上只有type为text才会执行到这里
                // this.textMaxWidth=this.$refs.canvasText.style.offsetRight;
                this.textMaxWidth = 50;
                this.draw[this.canvasConfig.type](this.canvasConfig.textVal, this.canvasConfig.startX, this.canvasConfig.startY, this.textMaxWidth);
            },
            //撤销
            backCanvas() {
                this.canvasConfig.arr.pop();
                //clearRect() 方法清空给定矩形内的指定像素。
                this.context.clearRect(0, 0, this.canvasId.width, this.canvasId.height);
                if (this.canvasConfig.arr.length > 0) {
                    // putImageData() 方法将图像数据（从指定的 ImageData 对象）放回画布上
                    this.context.putImageData(this.canvasConfig.arr[this.canvasConfig.arr.length - 1], 0, 0, 0, 0, this.canvasId.width, this.canvasId.height);
                }
            },

            //canvas鼠标按下，开始书写
            canvasMouseDown(event) {
                if (!this.isStroke) {
                    this.isStroke = true
                }
                this.canvasConfig.startX = event.offsetX || event.layerX,
                    this.canvasConfig.startY = event.offsetY || event.layerY;

                //铅笔
                if (this.canvasConfig.type == "pen") {
                    this.context.beginPath();
                    this.context.moveTo(this.canvasConfig.startX, this.canvasConfig.startY);
                }
                else {
                    this.context.beginPath();
                    this.context.moveTo(this.canvasConfig.startX, this.canvasConfig.startY);
                }

                this.draw = new BrushModel(this.context, {
                    type: this.canvasConfig.style,
                    color: this.canvasConfig.strokeColor,
                    width: this.canvasConfig.lineWidth
                });
                //实例化构造函数
                // this.isCanvasStart = true;

                /* this.context.beginPath();
                   this.canvasConfig.startX = event.offsetX || event.layerX,
                     this.canvasConfig.startY = event.offsetY || event.layerY;
                   this.context.moveTo(this.canvasConfig.startX,  this.canvasConfig.startY);
                   this.isCanvasStart = true;*/
            },

            //canvas鼠标抬起，结束书写
            canvasMouseUp() {
                this.isStroke = false;
                // getImageData() 复制画布上指定的矩形的像素数据
                this.canvasConfig.arr.push(this.context.getImageData(0, 0, this.canvasId.width, this.canvasId.height));
            },

            //canvas鼠标移动
            canvasMouseMove(event) {
                if (!this.draw || !this.isStroke) return;
                this.canvasConfig.endX = event.offsetX || event.layerX,
                    this.canvasConfig.endY = event.offsetY || event.layerY;
                if (this.canvasConfig.type != "eraser") {
                    //clearRect() 方法清空给定矩形内的指定像素。 TODO 先注释，后面改回来
                    // this.context.clearRect(0,0,this.canvasId.width,this.canvasId.height);
                    if (this.canvasConfig.arr.length != 0) {
                        // putImageData() 方法将图像数据（从指定的 ImageData 对象）放回画布上。
                        this.context.putImageData(this.canvasConfig.arr[this.canvasConfig.arr.length - 1], 0, 0, 0, 0, this.canvasId.width, this.canvasId.height);
                    }
                }
                //如果是文本框，不需要画，而是键盘输入文字的时候才画
                if (this.canvasConfig.type != 'text') {
                    this.draw[this.canvasConfig.type](this.canvasConfig.startX, this.canvasConfig.startY, this.canvasConfig.endX, this.canvasConfig.endY);
                }

            },
            sendCanvas() {
                //画布内容转化为图片
                let strDataURI = this.canvasId.toDataURL("image/png");
                //base64转换为file对象
                let newFile = dataURLtoFile(strDataURI, `canvas${new Date().getTime()}.png`)
                alert('图片已生成，可以传送给服务端啦');
                // console.log('====strDataURI', strDataURI, strDataURI.split('base64,')[1])
                console.log('====newFile', newFile)
                console.log('======strDataURI', strDataURI)
                //重置canvas配置
                this.canvasConfig = Object.assign({}, BRUSH_CONFIG);
                //重置画布所画的
                this.canvasConfig.arr = [];
            },
        }

    }
</script>

<style lang="scss" scoped>
    .video-wrap {
        width: 600px;
        height: 320px;
        margin: 0 auto;
        position: relative;

        .video {
            position: absolute;
            margin-right: 50%;
            transform: translateX(-50%);
            z-index: -999;
            border: 1px solid;
        }

        /*画笔的底部按钮组*/
        .left-canvas-footer {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);

            a {
                display: inline-block;
                width: 22px;
                height: 18px;

                &:last-child {
                    margin-right: 0;
                }
            }

            .rect {
                background: url("~@/assets/img/brushBox/btn_square_nor@2x.png") no-repeat 0 0/contain;

                &:hover {
                    background-image: url("~@/assets/img/brushBox/btn_square_hover@2x.png");
                }

                &:active {
                    background-image: url("~@/assets/img/brushBox/btn_square_pressed@2x.png");
                }
            }

            .active-rect {
                background-image: url("~@/assets/img/brushBox/btn_square_pressed@2x.png");
            }

            .circle {
                background: url("~@/assets/img/brushBox/btn_circular_nor@2x.png") no-repeat 0 0/contain;

                &:hover {
                    background-image: url("~@/assets/img/brushBox/btn_circular_hover@2x.png");
                }

                &:active {
                    background-image: url("~@/assets/img/brushBox/btn_circular_pressed@2x.png");
                }
            }

            .active-circle {
                background-image: url("~@/assets/img/brushBox/btn_circular_pressed@2x.png");
            }

            .arrow {
                background: url("~@/assets/img/brushBox/btn_arrow_nor@2x.png") no-repeat 0 0/contain;

                &:hover {
                    background-image: url("~@/assets/img/brushBox/btn_arrow_hover@2x.png");
                }

                &:active {
                    background-image: url("~@/assets/img/brushBox/btn_arrow_pressed@2x.png");
                }
            }

            .active-arrow {
                background-image: url("~@/assets/img/brushBox/btn_arrow_pressed@2x.png");
            }

            .pen {
                background: url("~@/assets/img/brushBox/btn_pen_color_nor@2x.png") no-repeat 0 0/contain;

                &:hover {
                    background-image: url("~@/assets/img/brushBox/btn_pen_color_hover@2x.png");
                }

                &:active {
                    background-image: url("~@/assets/img/brushBox/btn_pen_color_pressed@2x.png");
                }
            }

            .active-pen {
                background-image: url("~@/assets/img/brushBox/btn_pen_color_pressed@2x.png");
            }

            .text {
                background: url("~@/assets/img/brushBox/btn_word_nor@2x.png") no-repeat 0 0/contain;

                &:hover {
                    background-image: url("~@/assets/img/brushBox/btn_word_hover@2x.png");
                }

                &:active {
                    background-image: url("~@/assets/img/brushBox/btn_word_pressed@2x.png");
                }
            }

            .active-text {
                background-image: url("~@/assets/img/brushBox/btn_word_pressed@2x.png");
            }

            .bend-arrow {
                background: url("~@/assets/img/brushBox/btn_return_nor@2x.png") no-repeat 0 0/contain;

                &:hover {
                    background-image: url("~@/assets/img/brushBox/btn_return_hover@2x.png");
                }

                &:active {
                    background-image: url("~@/assets/img/brushBox/btn_return_pressed@2x.png");
                }
            }

            .close-canvas {
                background: url("~@/assets/img/brushBox/btn_pen_delete_nor@2x.png") no-repeat 0 0/contain;

                &:hover {
                    background-image: url("~@/assets/img/brushBox/btn_pen_delete_hover@2x.png");
                }

                &:active {
                    background-image: url("~@/assets/img/brushBox/btn_pen_delete_pressed@2x.png");
                }
            }

            .save-canvas {
                background: url("~@/assets/img/brushBox/btn_pen_send_nor@2x.png") no-repeat 0 0/contain;

                &:hover {
                    background-image: url("~@/assets/img/brushBox/btn_pen_send_hover@2x.png");
                }

                &:active {
                    background-image: url("~@/assets/img/brushBox/btn_pen_send_pressed@2x.png");
                }
            }

        }

        .canvas-draw-color {
            line-height: 34px;
            background: #dfdfdf;
            position: absolute;
            right: 0;
            top: 0;
            width: 45px;
            height: 237px;
            z-index: 100;

            a {
                display: block;
                width: 25px;
                height: 25px;
                margin: 6px auto;
            }

            .canvas-draw-header {
                display: block;
                width: 16px;
                height: 3px;
                margin: 4px auto;
                background: url('~@/assets/img/brushBox/pen_bg_move@2x.png');
                background-size: 100% 100%;
            }

            .small-dot, .medium-dot, .big-dot {
                background: #B6B6B6;
                border-radius: 100%;
            }

            .small-dot {
                width: 4px;
                height: 4px;
            }

            .medium-dot {
                width: 6px;
                height: 6px;
            }

            .big-dot {
                width: 10px;
                height: 10px;
            }

            /*选中圆点的样式*/
            .active-dot {
                background: #1395F1;
            }

            .canvas-red {
                background: url("~@/assets/img/brushBox/btn_sos_red_unchecked@2x.png") no-repeat;
                background-size: 100% 100%;
            }

            .active-red {
                background-image: url("~@/assets/img/brushBox/btn_sos_red_checked@2x.png");
            }

            .canvas-blue {
                background: url("~@/assets/img/brushBox/btn_sos_blue_unchecked@2x.png") no-repeat;
                background-size: 100% 100%;
            }

            .active-blue {
                background-image: url("~@/assets/img/brushBox/btn_sos_blue_checked@2x.png");
            }

            .canvas-yellow {
                background: url("~@/assets/img/brushBox/btn_sos_yellow_unchecked@2x.png") no-repeat;
                background-size: 100% 100%;
            }

            .active-yellow {
                background-image: url("~@/assets/img/brushBox/btn_sos_yellow_checked@2x.png");
            }

            .canvas-black {
                background: url("~@/assets/img/brushBox/btn_sos_black_unchecked@2x.png") no-repeat;
                background-size: 100% 100%;
            }

            .active-black {
                background-image: url("~@/assets/img/brushBox/btn_sos_black_checked@2x.png");
            }

            .canvas-gray {
                background: url("~@/assets/img/brushBox/btn_sos_gray_unchecked@2x.png") no-repeat;
                background-size: 100% 100%;
            }

            .active-gray {
                background-image: url("~@/assets/img/brushBox/btn_sos_gray_checked@2x.png");
            }

            .canvas-multi {
                background: url("~@/assets/img/brushBox/btn_sos_custom_unchecked@2x.png") no-repeat;
                background-size: 100% 100%;
            }
        }
    }

</style>
