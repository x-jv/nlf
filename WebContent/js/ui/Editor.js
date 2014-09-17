/**
 * I.ui.Editor
 * <i>文本编辑器组件</i>
 */
I.regist('ui.Editor',function(W,D){
  var CFG = {
    skin:'Default',
    border:'1px solid #DDD',
    toolbar:['bold','italic','underline','strikethrough','|','superscript','subscript','|','forecolor','backcolor','|','removeformat','|','insertorderedlist','insertunorderedlist','justifyleft','justifycenter','justifyright','justifyfull','|','indent','outdent','|','link','unlink','|','image','|','horizontal'],
    dom:D.body
  };
  var TIP = {
    bold:'加粗',
    italic:'斜体',
    underline:'下划线',
    strikethrough:'删除线',
    superscript:'上标',
    subscript:'下标',
    forecolor:'字体颜色',
    backcolor:'背景色',
    removeformat:'清除格式',
    insertorderedlist:'有序列表',
    insertunorderedlist:'无序列表',
    justifyleft:'左对齐',
    justifycenter:'居中对齐',
    justifyright:'右对齐',
    justifyfull:'两端对齐',
    indent:'增加缩进',
    outdent:'减少缩进',
    link:'超链接',
    unlink:'取消链接',
    image:'图片',
    horizontal:'分隔线'
  };
  var ICON = {
    bold:'fa fa-bold',
    italic:'fa fa-italic',
    underline:'fa fa-underline',
    strikethrough:'fa fa-strikethrough',
    superscript:'fa fa-superscript',
    subscript:'fa fa-subscript',
    forecolor:'fa fa-pencil',
    backcolor:'fa fa-pencil-square',
    removeformat:'fa fa-eraser',
    insertorderedlist:'fa fa-list-ol',
    insertunorderedlist:'fa fa-list',
    justifyleft:'fa fa-align-left',
    justifycenter:'fa fa-align-center',
    justifyright:'fa fa-align-right',
    justifyfull:'fa fa-align-justify',
    indent:'fa fa-indent',
    outdent:'fa fa-outdent',
    link:'fa fa-link',
    unlink:'fa fa-chain-broken',
    image:'fa fa-picture-o',
    horizontal:'fa fa-minus'
  };
  
  var _try = function(obj,func){
    if(obj.doc&&obj.doc.body){
      func.call(obj);
    }else{
      W.setTimeout(function(){
        _try(obj,func);
      },16);
    }
  };
  var _tool = function(obj,name,callback){
    var a = I.insert('a',obj.toolbar);
    a.setAttribute('title',TIP[name]);
    a.setAttribute('data-name',name);
    I.cls(a,ICON[name]);
    I.listen(a,'click',function(m,e){
      _try(obj,function(){
        callback.call(this,a);
      });
    });
    return a;
  };
  var _renderToolbar = function(obj){
    var cfg = obj.config;
    for(var i=0;i<cfg.toolbar.length;i++){
      var name = cfg.toolbar[i];
      switch(name){
      case '|':
        I.insert('i',obj.toolbar);
        break;
      case 'forecolor':
        var a = _tool(obj,name,function(a){
        });
        var b = I.insert('b',a);
        I.cls(b,'fa fa-sort-desc');
        break;
      case 'backcolor':
        var a = _tool(obj,name,function(a){
        });
        var b = I.insert('b',a);
        I.cls(b,'fa fa-sort-desc');
        break;
      case 'link':
        _tool(obj,name,function(a){
          var inst = this;
          inst.range = D.all?inst.doc.selection.createRange():inst.iframe.contentWindow.getSelection().getRangeAt(0);
          var id = I.util.UUID.next();
          var win = I.z.Win.create({
            title:'添加链接',
            width:400,
            height:180,
            content:I.util.Template.render(null,'<div id="'+id+'"><ul><li data-width="20">URL：</li><li><input id="input'+id+'" type="text" /></li></ul><ul><li data-width="20">打开窗口：</li><li><select id="select'+id+'"><option value="_blank">新窗口</option><option value="_self">本窗口</option></select></li></ul><ul><li></li><li data-width="20"><a id="btn'+id+'">确定</a></li></ul></div>')
          });
          I.ui.Form.render(id,{
            border:'0',
            border_hover:'0',
            background_hover:'#FFF'
          });
          I.ui.Button.render('btn'+id,{
            callback:function(){
              if(D.all){
                inst.range.execCommand('createlink', false, I.$('input'+id).value);
                inst.range.parentElement().target = I.$('select'+id).value;
              }else{
                inst.doc.execCommand("createlink", false, I.$('input'+id).value);
                inst.range.commonAncestorContainer.parentNode.target = I.$('select'+id).value;
              }
              win.close();
            }
          });
        });
        break;
      case 'image':
        var a = I.insert('a',obj.toolbar);
        I.cls(a,'fa fa-picture-o');
        break;
      case 'horizontal':
        _tool(obj,name,function(a){
          this.doc.execCommand('inserthorizontalrule', false, null);
        });
        break;
      default:
        _tool(obj,name,function(a){
          this.doc.execCommand(a.getAttribute('data-name'), false, null);
        });
        break;
      }
    }
    var as = I.$(obj.toolbar,'tag','a');
    for(var i=0;i<as.length;i++){
      as[i].onfocus = function(){this.blur();};
      as[i].href = 'javascript:void(0);';
    }
  };
  var _renderEditor = function(obj){
    var cfg = obj.config;
    var dom = obj.proxyDom;
    dom.style.border = cfg.border;
    var toolbar = I.insert('div',dom);
    I.cls(toolbar,'editor-toolbar');
    obj.toolbar = toolbar;
    
    var body = I.insert('div',dom);
    I.cls(body,'editor-body');
    obj.body = body;
    
    var iframe = I.insert('iframe',body);
    iframe.src = 'about:blank';
    obj.iframe = iframe;
    
    var timer = null;
    timer = W.setInterval(function(){
      var doc = iframe.contentWindow.document||iframe.contentDocument;
      if(doc&&doc.body){
        W.clearInterval(timer);
        timer = null;
        doc.open();
        doc.write('<html><head><style type="text/css">*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;}body{margin:0;padding:5px;font-size:12px;word-wrap:break-word;}</style></head><body><div></div></body></html>');
        doc.close();
        doc.contentEditable = true;
        doc.designMode = 'on';
        obj.doc = doc;
      }else{
        doc = iframe.contentWindow.document||iframe.contentDocument;
      }
    },16);
    _renderToolbar(obj);
    obj.setContent(obj.dom.value);
  };
  var _create = function(config){
    var dom = I.insert('textarea',config.dom?config.dom:CFG.dom);
    return _render(dom,config);
  };
  var _render = function(dom,config){
    dom = I.$(dom);
    dom.style.display = 'none';
    var div = I.insert('div','after',dom);
    var obj = {
      dom:dom,
      proxyDom:div,
      iframe:null,
      doc:null,
      toolbar:null,
      body:null,
      className:null,
      config:null,
      range:null,
      getContent:function(){
        if(this.doc){
          var s = this.doc.body.innerHTML;
          this.dom.value = s;
          return s;
        }else{
          return this.dom.value;
        }
      },
      setContent:function(s){
        _try(this,function(){
          this.dom.value = s;
          this.doc.body.innerHTML = s;
        });
      }
    };
    var cfg = I.ui.Component.initConfig(config,CFG);
    obj.config = cfg;
    obj.className = 'i-ui-Editor-'+cfg.skin;
    I.util.Skin.init(cfg.skin);
    I.cls(div,obj.className);
    _renderEditor(obj);
    return obj;
  };
  return {
    create:function(cfg){return _create(cfg);},
    render:function(dom,cfg){return _render(dom,cfg);}
  };
}+'');