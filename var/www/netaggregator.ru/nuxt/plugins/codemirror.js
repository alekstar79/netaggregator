import VueCodemirror, { CodeMirror } from 'vue-codemirror/src'
import emmet from '@emmetio/codemirror-plugin'
import Vue from 'vue'

// active-line
import 'codemirror/addon/selection/active-line'

// style-selected-text
import 'codemirror/addon/selection/mark-selection'

// hint
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/javascript-hint'
import 'codemirror/addon/hint/html-hint'
import 'codemirror/addon/hint/css-hint'

// highlight-selection-matches
import 'codemirror/addon/scroll/annotatescrollbar'
import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/search'

// keymap
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/matchtags'
import 'codemirror/addon/display/panel'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/keymap/sublime'

// foldgutter
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/indent-fold'
import 'codemirror/addon/fold/markdown-fold'
import 'codemirror/addon/fold/xml-fold'

// languages
import 'codemirror/mode/clike/clike'
import 'codemirror/mode/css/css'
import 'codemirror/mode/go/go'
import 'codemirror/mode/htmlembedded/htmlembedded'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/nginx/nginx'
import 'codemirror/mode/php/php'
import 'codemirror/mode/pug/pug'
import 'codemirror/mode/python/python'
import 'codemirror/mode/ruby/ruby'
import 'codemirror/mode/sass/sass'
import 'codemirror/mode/shell/shell'
import 'codemirror/mode/sql/sql'
import 'codemirror/mode/stylus/stylus'
import 'codemirror/mode/twig/twig'
import 'codemirror/mode/vue/vue'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/yaml/yaml'
// import 'codemirror/mode/django/django'
// import 'codemirror/mode/smarty/smarty'

// styles
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/merge/merge.css'
import 'codemirror/lib/codemirror.css'

// themes
import 'codemirror/theme/cobalt.css'
import 'codemirror/theme/dracula.css'
import 'codemirror/theme/eclipse.css'
import 'codemirror/theme/material.css'
import 'codemirror/theme/monokai.css'
// import 'codemirror/theme/base16-dark.css'
// import 'codemirror/theme/darcula.css'

emmet(CodeMirror)

Vue.use(VueCodemirror)
