#!/usr/bin/env node

var parser = require('hhml.js');

var pathtosource = "./example_idea/menu.hhml";
var source = require('fs').readFileSync(require('path').normalize(pathtosource), "utf8");
var ast = parser.parse(source);
var html = createHTML(ast);
var fs = require('fs');
fs.writeFile("hhh.html", html);
console.log(html);
console.log("---------------- Successful -----------------------");

/*------------ UTIL ----------------------*/
function num2class(n){
    n = +n;
    switch(n) {
    case 1: return 'one';
    case 2: return 'two';
    case 3: return 'three';
    case 4: return 'four';
    case 5: return 'five';
    case 6: return 'six';
    case 7: return 'seven';
    case 8: return 'eight';
    case 9: return 'nine';
    case 10: return 'ten';
    case 11: return 'eleven';
    case 12: return 'twelve';
    case 13: return 'thirtheen';
    case 14: return 'fourteen';
    case 15: return 'fithteen';
    case 16: return 'sixteen';
    default: return 'notimplemented'
    }
}
/*--------------- CODING -------------------------------*/

function createHTML(ast){
    if(ast.o && ast.o.c){
        var nodes = [];
        for(var i = 0; i < ast.o.c.length; i++){
            var t = ast.o.c[i].type; // type
            var o = ast.o.c[i].o; // options
           nodes.push(createNode(t, o)); 
        }
        var html = "<!DOCTYPE HTML>\n";
        html += "<html>\n";
        html += "<head>\n";
            html += '<meta http-equiv="content-type" content="text/html; charset=utf-8">\n';
            html += '<title>Semanitc Element</title>\n';
        html += '<link rel="stylesheet" href="semantic/dist/semantic.min.css" media="screen" charset="utf-8">\n';
        html += '<script src="semantic/dist/semantic.min.js"></script>\n';
        html += '<style type="text/css" media="screen">\n';
        html += 'body { overflow-x: hidden; }\n';
        html += '</style>\n';
        html += '</head>\n';
        html += '<body>\n';
        html += nodes.join('\n');
        html += '</body>\n';
        html += '</html>\n';
        return html
    }
}

function createNode(t, o){
    var html ;
    switch(t){
        case 'menu':
            html = MenuNode(o);
            break;
        case 'divider':
            html = DividerNode(o);
            break;
        case 'string':
            html = StringNode(o);
            break;
        case 'button':
            html = ButtonNode(o);
            break;
        case 'textfield':
            html = TextFieldNode(o);
            break;
        case 'container':
            html = ContainerNode(o);
            break;
        case 'row':
            html = RowNode(o);
            break;
        case 'grid':
            html = GridNode(o);
            break;
        case 'column':
            html = ColumnNode(o);
            break;
        default:
            console.log('Not Implement ', t);
            break;
    }

    return html;
}

function createNodeList(l){
    var chtml = [];
    for(var i = 0; i < l.length; i++){
        var t = l[i].type;
        var o = l[i].o; // options
        chtml.push(createNode(t, o));
    }
    return chtml.join('');
}

function ColumnNode(o) {
    o.classes.push('wide column');
    var otag = createOpenTag('div', o);
    return otag + createNodeList(o.c) + '\n</div>';
}

function GridNode(o) {
    var otag = createOpenTag('div', { classes: ['ui grid stackable']});    
    return otag + createNodeList(o.c) + '\n</div>';
}

function RowNode (o) {
    var otag = createOpenTag('div', { classes: ['row'] });    
    return otag + createNodeList(o.c) + '\n</div>\n';
}

function ContainerNode (o) {
    var otag = createOpenTag('div', o);
    return otag + createNodeList(o.c) + '\n</div>\n';
}

function DividerNode(o) {
    return "<div class='ui divider hidden fitted'></div>\n";
}

function ButtonNode(o) {
   __makeDefaultClass.apply(o, ['ui', 'button']); 
   var otag = createOpenTag('button', o);
   var text = o.id.id2text();
   return otag + text + '</button>\n';
}

function MenuNode(o){
    o.classes = (o.classes || []);
    o.classes.push('ui menu')
    var otag = createOpenTag('div', o);

    return otag + createNodeList(o.c) + "\n</div>\n";
}

function TextFieldNode (o) {
    o.attr = { type: 'text', placeholder: o.id };
    switch(o.mode){
        case "menu":
            var html = buildString(function(){
                /*
                <div class="item">
                    <div class="ui transparent icon input">
                        $
                        <i class="search link icon"></i>
                    </div>
                </div>
                */
            });
            html = html.replace(/\$/, createOpenTag('input', o));
            return html;
        default:
            // return simple input type text
            var wrap = createOpenTag('div', { classes: ["ui input"]});
            var input = createOpenTag('input', o);
            return wrap + input + '</div>';
            break;
    }
}

function StringNode(o){
    o.classes = (o.classes || []);
    o.classes.push('ui')
    o.classes.push('item')
    var otag = createOpenTag('a', o);

    return otag + o.text + "</a>\n";
}

function createOpenTag(tag, o){
    o.classes = (o.classes || []);
    var cls = (o.classes.length > 0 ? " class='" + o.classes.join(' ') + "'" : '');
    var id = (o.id ? " id='"+o.id+"'" : '');
    var attr = "";
    if(o.attr){
        for(var k in o.attr){
            attr += (" " + k + "='" + o.attr[k] + "'");
        }
    }

    return "<" + tag + id + cls + attr + ">";
}

function __makeDefaultClass () {
    this.classes = (this.classes || []);
    for(var i = 0; i < arguments.length; i++){
        this.classes.push(arguments[i])
    }
    return this;
}

function buildString(fn){
        var reg = /\/\*([\s\S]*)\*\//im;
        if(typeof fn == 'function'){
            return reg.exec(fn.toString())[1];
        }
        return false;
}

