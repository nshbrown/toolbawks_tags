/*
# Copyright (c) 2007 Nathaniel Brown
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
*/

Toolbawks.enableTagsManager = true;

var ToolbawksTagsManagerInterface = function(){
  // shorthand
  var Tree = Ext.tree;
  
  return {
		init : function(){
		  Ext.QuickTips.init();
		  
			$$('.toolbawks_tags_manager').each(function(container){
				ToolbawksTagsManagerInterface.build(container.id);
			});
		},

		build: function(id) {
		  // update the newIndex
		  
      var layout = new Ext.BorderLayout(id, {
          center: {}
      });
      
      var tag_manager = layout.getEl().createChild({tag:'div', id: id + '-container'});
      var tb = new Ext.Toolbar(tag_manager.createChild({tag:'div'}));
      tb.addButton({
          text: 'New Tag',
          cls: 'x-btn-text-icon tag-btn-add',
          handler: function(){
            var tag_details = ToolbawksTagsManager.create();
            var node = root.appendChild(new Tree.TreeNode({
                text: tag_details.name, 
                cls: 'tag',
                id: 'tag-' + tag_details.id,
            }));
            tree.getSelectionModel().select(node);
            setTimeout(function(){
                ge.editNode = node;
                ge.startEdit(node.ui.textNode);
            }, 10);
          }
      });

      tb.addButton({
          text: 'Remove Tag',
          cls: 'x-btn-text-icon tag-btn-remove',
          handler: function(){
            var node_sel = tree.getSelectionModel().getSelectedNode();
            if (!node_sel) {
              Toolbawks.info.msg('Tag Manager', 'Please select a tag to remove');
            } else {
              ToolbawksTagsManager.destroy(node_sel.id.replace('tag-', ''));
              root.removeChild(node_sel);
            }
          }
      });

      var viewEl = tag_manager.createChild({tag:'div', id: id + '-tags'});

      var folders = layout.add('center', new Ext.ContentPanel(tag_manager, {
          fitToFrame:true,
          autoScroll:true,
          autoCreate:true,
          toolbar: tb,
          resizeEl:viewEl
      }));

			var url = '/toolbawks/tags/show';
		  var tree = new Tree.TreePanel(viewEl, {
	        animate: true, 
		       loader: new Tree.TreeLoader({dataUrl:url}),
		       enableDD: true,
		       ddScroll: true,
		       containerScroll: true,
		       rootVisible: false,
		       lines: false,
		       dropConfig: {
		         appendOnly: false, 
		         allowContainerDrop: true,
		         allowParentInsert: true
		       },
		       dragConfig: {
		         appendOnly: false, 
		         allowContainerDrop: true,
		         allowParentInsert: true
		       }
		   });
		   
		   tree.on('textchange', ToolbawksTagsManager.text_change);
		   tree.on('nodedrop', ToolbawksTagsManager.node_drop);
  
		   // add a tree sorter in non folder mode
		   var tree_sorter = new Tree.TreeSorter(tree, {
		     dir: 'asc',  // asc || desc
		     folderSort: false
		   });
  
		   // set the root node
		   var root = new Tree.AsyncTreeNode({
		       text: 'Tags', 
		       draggable: false, // disable root node dragging
		       id: 'tag-0'
		   });
  
       var ge = new Ext.tree.TreeEditor(tree, {
           allowBlank: false,
           blankText: 'A name is required',
           selectOnFocus: true
       });
                   
		   // render the tree
		   tree.setRootNode(root);
		   tree.render();
  
		   root.expand(false, false);
		}
	};
}();

var ToolbawksTagsManager = function() {
  
  return {
    text_change: function(node, text, oldText) {
      ToolbawksTagsManager.update(node.id, text, false, false);
    },

    node_drop : function(dropEvent) {
      var parent_id = dropEvent.target.id;
      var node_id = dropEvent.dropNode.id;
      
      ToolbawksTagsManager.parent_change(node_id, parent_id);
    },
    
    parent_change: function(id, parent_id) {
      ToolbawksTagsManager.update(id, false, parent_id);
    },
    
    update : function(id, name, parent_id) {
      var id = (id && id.indexOf('tag-') != -1) ? id.replace('tag-', '') : id;
      var parent_id = (parent_id && parent_id.indexOf('tag-') != -1) ? parent_id.replace('tag-', '') : parent_id;
      var url = '/toolbawks/tags/update/' + id;
      var params = false;
      
      var p = [];
      if (name) p[p.length] = 'tag[name]=' + name;
      if (parent_id) p[p.length] = 'tag[parent_id]=' + parent_id;
      params = p.join('&');
      
      var timeout = 5;
      var callback = function() {};
      var method = 'GET';

      method = method || (params ? "POST" : "GET");

      var responseSuccess = function(o) {
        Toolbawks.info.msg('Tag Manager', o.responseText);
      };

      var responseFailure = function(o) {
        Toolbawks.info.msg('Tag Manager', 'Error creating new tag');
      };

      var cb = {
          success: responseSuccess,
          failure: responseFailure,
          timeout: (timeout*1000),
          argument: {"url": url, "form": null, "callback": callback, "params": params}
      };

      var req = Ext.lib.Ajax.request(method, url, cb, params); 
    },

    create : function() {
      var url = '/toolbawks/tags/create';
      var params = false;
      var tag_details = false;
      
      var callback = function() {};
      var method = 'GET';

      method = method || (params ? "POST" : "GET");

      var responseSuccess = function(o) {
        tag_details = Ext.util.JSON.decode(o.responseText);
      };

      var responseFailure = function(o) {
        Toolbawks.info.msg('Tag Manager', 'Error creating new tag');
      };

      var options = {
          onSuccess: responseSuccess,
          onFailure: responseFailure,
          asynchronous: false,
          parameters: params
      };
      
      // Prototype specific call
      var req = new Ajax.Request(url, options); 
      
      return tag_details;
    },
    
    destroy : function(id) {
      var url = '/toolbawks/tags/destroy/' + id;
      var params = false;
      var timeout = 5;
      var method = 'GET';

      method = method || (params ? "POST" : "GET");

      var responseSuccess = function(o) {
        Toolbawks.info.msg('Tag Manager', o.responseText);
      };

      var responseFailure = function(o) {
        Toolbawks.info.msg('Tag Manager', 'Error creating new tag');
      };

      var cb = {
          success: responseSuccess,
          failure: responseFailure,
          timeout: (timeout*1000),
          argument: {"url": url, "params": params}
      };

      var req = Ext.lib.Ajax.request(method, url, cb, params);
    }
  };
}();

Ext.onReady(ToolbawksTagsManagerInterface.init, ToolbawksTagsManagerInterface, true);