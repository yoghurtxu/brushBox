//获取两坐标间距离
export  function getDistance(p1X, p1Y, p2X, p2Y) {
    var num1 = Math.pow(p1X - p2X, 2);
    var num2 = Math.pow(p1Y - p2Y, 2);
    var distance = Math.sqrt(num1 + num2);
    return distance;
}

//base64转换为file对象
export  function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
}