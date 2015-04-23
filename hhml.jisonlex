dletter [a-z]
digit   [0-9]
string  \"[^\"\r\n]+\"|\'[^\'\r\n]+\'
nl      (\r|\n)

btag ('menu'|'row'|'container'|'grid'|'column')
all_tag ('button'|'textfield'|{btag}|{string}) 
grid_mod_var ('column-wide'|'cw')
val  ({string}|{digit}+|'true'|'false')
id   {dletter}+(\-{dletter}+)*

%{ 
    parser.cutStrTag = function(){
        yytext = yytext.slice(1, -1);
    }

    parser.cutIdStr = function(){
        yytext = yytext.slice(1);
    }

    parser.stripModVar = function(){
       yytext = yytext.trim().slice(1); 
    }

%}

/*------------- start lexical grammar ---------- */
/* states:
 * p = start program
 * d = start definition
 * b = start block
 * c = start code
 *
 */
%s d p b c mod-var menu row container grid column
%%

<INITIAL>"@"{id}       return 'VAR';
<p>"@"{id}             return 'REF';

<grid>"%"{grid_mod_var}\s+  { this.pushState('mod-var'); return "MOD_VAR"; }
<mod-var>{val}              %{ 
                             this.popState() // -> grid
                             parser.stripModVar();
                             return "VALUE"; %}

<p>"%%"             this.begin('c');
"%%"\n              this.begin('p');


<menu,row,grid,column>\s+  %{ /* skip */ %}

\s+   %{
           if(yytext.match(/\r|\n/)){
               return "EOL"
           } else {
               /* skip */
           }
      %}

'{'     %{ 
            if(parser.expectBlock){
                this.pushState(parser.expectBlock);
                currentBlockState = parser.expectBlock;
                // console.log('push:', parser.expectBlock, this.topState());
                parser.expectBlock = false;
            }
            return '{'; 
        %}

'}'{nl}?    %{ 
                this.popState();
                currentBlockState = this.topState();
                return '}'; 
            %}

{string}  { parser.cutStrTag(); return "STRING_TAG"; }

{btag}    %{ 
                parser.expectBlock = yytext;
                return "BLOCK_TAG"; 
          %}
     
{all_tag}      %{ return 'TAG'; %}


"#"{id}        parser.cutIdStr(); return 'ID';
"."{id}        parser.cutIdStr(); return 'CLS';
"$"{id}        parser.cutIdStr(); return 'STATE';
"+"            return '+'

"//"           %{ return 'LINE_COMMENT' %}

<<EOF>>        return 'EOF'
.              return 'INVALID'
