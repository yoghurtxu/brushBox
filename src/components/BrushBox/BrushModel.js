
import { getDistance } from '@/assets/js/utils';

export class BrushModel {
    constructor(obj, setting) {
        const {type, color, width} = setting;
        this.obj = obj;
        this.type = type || "stroke";
        this.color = color || "#000";
        this.width = width || 1;
        this.init();
    }

    init() {
        this.obj.strokeStyle = this.color;
        this.obj.fillStyle = this.color;
        this.obj.lineWidth = this.width;
    }

    //箭头
    arrow(startX, startY, endX, endY) {
        var slopy, cosy, siny;
        //箭头尺寸
        var arrowLength = this.obj.lineWidth * 5;
        var arrowWidth = this.obj.lineWidth * 5;
        var distance = getDistance(startX, startY, endX, endY);
        if (arrowWidth >= distance * 0.5) {
            arrowLength = arrowWidth = distance * 0.5;
        }

        slopy = Math.atan2((startY - endY), (startX - endX));
        cosy = Math.cos(slopy);
        siny = Math.sin(slopy);

        this.obj.beginPath();
        this.obj.lineCap = "round";
        this.obj.lineJoin = "round";
        this.obj.moveTo(startX, startY);
        this.obj.lineTo(endX, endY);
        this.obj.moveTo(endX, endY);
        this.obj.lineTo(endX + (arrowLength * cosy - (arrowWidth / 2.0 * siny)), endY + (arrowLength * siny + (arrowWidth / 2.0 * cosy)));
        this.obj.moveTo(endX, endY);
        this.obj.lineTo(endX + (arrowLength * cosy + (arrowWidth / 2.0 * siny)), endY - (arrowWidth / 2.0 * cosy - arrowLength * siny));
        // closePath() 是 Canvas 2D API 将笔点返回到当前子路径起始点的方法。它尝试从当前点到起始点绘制一条直线。 如果图形已经是封闭的或者只有一个点，那么此方法不会做任何操作。
        this.obj.closePath();
        this.obj.stroke();
    }

    //矩形
    rect(x, y, x1, y1) {
        this.obj.beginPath();
        this.obj.rect(x, y, x1 - x, y1 - y);
        if (this.type == "stroke") {
            // 可以直接调用画矩形的方法
            // this.obj.strokeRect(x,  y, x1 - x, y1 - y);
            this.obj.stroke();
        } else if (this.type == "fill") {
            this.obj.fill();
        }
    }

    //圆 https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/arc
    circle(x, y, x1, y1) {
        var r = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
        this.obj.beginPath();
        this.obj.arc(x, y, r, 0, 2 * Math.PI);
        if (this.type == "stroke") {
            this.obj.stroke();
        } else if (this.type == "fill") {
            this.obj.fill();
        }
    }

    //铅笔
    pen(x, y, x1, y1) {
        // this.obj.save();
        this.obj.lineCap = "round";
        this.obj.lineTo(x1, y1);
        this.obj.stroke();
        // this.obj.restore();
    }


    // 直线
    line(x,y,x1,y1){
        this.obj.beginPath();
        this.obj.moveTo(x,y);
        this.obj.lineTo(x1,y1);
        this.obj.stroke();
    }

    // 橡皮擦
    eraser(x,y,x1,y1){
        this.obj.lineCap="round";
        this.obj.clearRect(x1-5,y1-5,10,10);
    }

    // 虚线方框 https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash
    cut(x,y,x1,y1){
        // this.obj.save();
        this.obj.setLineDash([4,2]);
        this.obj.beginPath();
        this.obj.rect(x,y,x1-x,y1-y);
        this.obj.stroke();
        // this.obj.restore();
    }
}
