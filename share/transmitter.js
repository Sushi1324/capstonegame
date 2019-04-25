var Transmitter = function(x, y, id) {
    
    this.x = x;
    this.y = y;
    this.id = id;
    
    this.active = true;
    this.visited = false;
    
    this.health = 100;
    this.level = 1;
    
    this.links = [];
    
    this.addLink = function(n) {
        
        this.links.push(n.id);
        n.links.push(this.id);
    };
    
    this.destroy = function(verts) {

        for (var l in this.links) {
            
            verts[this.links[l]].links.splice(verts[this.links[l]].links.indexOf(this.id), 1);

        }
    };
    
    this.dfs = function(verts, path, cycles) {
        if (path.length == 3) return [];
        this.visited = true;
        path.push(this.id);
        for (var x in this.links) {
            var n = verts[this.links[x]].id;
            if (path.length == 1 || path[path.length-2] != n) {
                if (verts[n].visited) {
                    
                    cycles.push(path.slice(path.indexOf(n), path.length));
                }
                else {
                    cycles = cycles.concat(verts[n].dfs(verts, path, []));
                }
            }
            
        }
        path.pop();
        this.visited = false;
        
        var out = [];
        var check = [];
        for (var x in cycles) {
            var temp = cycles[x].slice(0);
            temp.sort();
            temp.join(", ");
            temp = "[" + temp + "]";
            if (!check.toString().includes(temp)) {
                check.push(temp);
                out.push(cycles[x]);
            }
        }
        
        return out;
    };
    
};

module.exports = Transmitter;