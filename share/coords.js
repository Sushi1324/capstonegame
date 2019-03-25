function simCoords(a, b, size, tile = 100) {
    
    var out = {};
    out.y = (a-size) * tile/2 * Math.sqrt(3);
    out.x = (b-size)*tile + -(a-size)*tile/2;
    
    return out;
}

module.exports = simCoords;