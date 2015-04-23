%left EOL
%start input

%%

input : stmlist EOF
            { 
                // ast
                var ret = { ast: { type: 'root', o: { c: $1 } }, vars: sym }
                return ret.ast;
            }
      ;

stmlist : stmlist stm { $$ = $1.concat($2); }
        | { $$ = []; }
        ;

stm : Element { $$ = $1 }
    | EOL
        { 
            $$ = [{ type: 'divider', o: { mode: currentBlockState } }]
        }
    | Block
    | DeclarationStm
    | ReferenceStm
    | ModificationDeclarationStm
    ;

ModificationDeclarationStm : MOD_VAR VALUE 
                                { 
                                    state_var[currentBlockState] || (state_var[currentBlockState] = {})
                                    state_var[currentBlockState] = $2
                                }
                           ;

ReferenceStm : REF { $$ = sym[$1] } ;

DeclarationStm : VAR '{' stmlist '}' 
                 { 
                    sym[$1] = $3; }
               ;
                    

Block : BlockElement '{' stmlist '}'
             {
                    $1.o.c = $3
                    $$ = $1
             }
      ;

Elements   : Element  { $$ = [$1] }
           | Elements Element
             { 
               $$ = $1.concat($2)
             }
           ;

BlockElement   : BLOCK_TAG suffix
            {
                $2.mode = currentBlockState;
                $$ = { type: $1, o: $2 }
            }
          ;

Element   : TAG suffix
            {
                $2.mode = currentBlockState;
                // console.log($1, $2.mode);
                $$ = { type: $1, o: $2 }
            }
          | STRING_TAG suffix
              {
                  $2.mode = currentBlockState;
                  $2.text = $1
                  $$ = { type: 'string', o: $2 }
              }
          ;

suffix : ID suffix { $2.id = $1; $$ = $2; }
       | CLS suffix 
           { 
               $2.classes || ($2.classes = [])
               $2.classes.push($1);
               $$ = $2
           }
       | STATE suffix { $2.state = $1; $$ = $2;  }
       | { $$ = { classes: [] } } 
       ;

%%

// keep varibles
var sym = {};
var state_var = {};

function SimpleStack(init) {
    var __stack = [];
    var __default = init;

    this.current = function() {
        return __stack[__stack.length - 1] || __default;
    }
    this.rename = function(s) {
        return __stack[__stack.length - 1] = s;
    }

    this.push = function(s) {
       return __stack.push(s); 
    }

    this.pop = function(s){
        return __stack.pop() || __default;
    }

    if(init){ this.push(init); }
}
var currentBlockState; // hold block state in lex file
var Mode = new SimpleStack('NORMAL');
var meta = {
    multiline_block: false
}

String.prototype.lstrip = function(){
    return this.substring(1, this.length);
}

String.prototype.capitalize = function(){
    return this.substring(0,1).toUpperCase() + this.substring(1, this.length + 1);
}

String.prototype.id2text = function(){
    var astr = this.split('-');
    return astr.map(function(s){ return s.capitalize() }).join(' ');
}

