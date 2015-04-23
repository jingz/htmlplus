#!/bin/bash
jison hhml.jison hhml.jisonlex
# node hhml.js example_idea/menu.hhml
node hhmlgen.js
