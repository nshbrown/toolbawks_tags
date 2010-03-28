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

Toolbawks.tags.Manager = function() {
  // shorthand
  var Tree = Ext.tree;
  var _ = {
    hooks : {
      create : [],
      update : [],
      remove : []
    }
  };
  
  return {
		init : function(){
		  Ext.QuickTips.init();
		  
			Ext.query('.toolbawks_tags_manager').each(function(container){
				Toolbawks.tags.Manager.build(container.id);
			});
		},

		build: function(id) {
		  Toolbawks.log('Toolbawks.tags.Manager.build -> id : ' + id);
		  
		  // update the newIndex
      var layout = new Ext.BorderLayout(id, {
          center: {}
      });
      
      var tag_manager = layout.getEl().createChild({
        tag: 'div', 
        id: id + '-container'
      });
      
      var tb = new Ext.Toolbar(tag_manager.createChild({
        tag:'div'
      }));
      
      tb.addButton({
          text: 'New Tag',
          cls: 'x-btn-text-icon tag-btn-add',
          handler: function(){
            var tag_details = Toolbawks.tags.Model.create();
            
            var node = root.appendChild(new Tree.TreeNode({
              text: tag_details.name, 
              cls: 'tag',
              id: 'tag-' + tag_details.id,
            }));
            
            // Run the hooks for removing tag
            Toolbawks.tags.Manager.get_hooks('create').each(function(hook) {
              Toolbawks.log('Toolbawks.tags.Manager.build -> create button -> running hook...');
              hook();
            });

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
              Toolbawks.msg('Tag Manager', 'Please select a tag to remove');
            } else {
              var tag_id = node_sel.id.replace('tag-', '');
              
              // Run the hooks for removing tag
              Toolbawks.tags.Manager.get_hooks('remove').each(function(hook) {
                Toolbawks.log('Toolbawks.tags.Manager.build -> remove button -> running hook...');
                hook();
              });

              Toolbawks.tags.Model.destroy(tag_id);
              root.removeChild(node_sel);
            }
          }
      });
      
      tb.addButton({
          text: 'Toggle Display',
          cls: 'x-btn-text-icon tag-btn-display',
          handler: function(){
            var node_sel = tree.getSelectionModel().getSelectedNode();
            if (!node_sel) {
              Toolbawks.msg('Tag Manager', 'Please select a tag to toggle display for');
            } else {
              Toolbawks.tags.Model.toggle(node_sel.id.replace('tag-', ''));
              node_sel.ui.onDisableChange(node_sel, (node_sel.disabled ? false : true));
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
		   
		   tree.on('textchange', Toolbawks.tags.Manager.text_change);
		   tree.on('nodedrop', Toolbawks.tags.Manager.node_drop);
  
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
		},

    verify_hook_scope : function(scope) {
      switch (scope) {
        case 'create':
          return true;
        case 'update':
          return true;
        case 'remove':
          return true;
        default:
          return false;
      }
    },
    
    add_hook : function(scope, func) {
      if (!Toolbawks.tags.Manager.verify_hook_scope(scope)) {
        Toolbawks.error('Toolbawks.tags.Manager.add_hook : Hook failed to be added to scope [' + scope + ']. Hook details : ' + func);
        return false;
      } else {
        Toolbawks.log('Toolbawks.tags.Manager.add_hook : Added hook to scope [' + scope + ']. Hook details : ' + func);
      }
      _.hooks[scope][_.hooks[scope].length] = func;
    },
    
    get_hooks : function(scope) {
      if (!Toolbawks.tags.Manager.verify_hook_scope(scope)) {
        Toolbawks.error('Toolbawks.tags.Manager.get_hooks : Invalid scope while fetching hooks');
        return false;
      }
      return _.hooks[scope];
    },

    text_change: function(node, text, oldText) {
      Toolbawks.tags.Model.update(node.id, text, false, false);

      // Run the hooks for updating tag
      Toolbawks.tags.Manager.get_hooks('update').each(function(hook) {
        Toolbawks.log('Toolbawks.tags.Manager.text_change -> running update hook...');
        hook();
      });
    },

    node_drop : function(dropEvent) {
      var parent_id = dropEvent.target.id;
      var node_id = dropEvent.dropNode.id;
      
      Toolbawks.tags.Model.parent_change(node_id, parent_id);

      // Run the hooks for updating tag
      Toolbawks.tags.Manager.get_hooks('update').each(function(hook) {
        Toolbawks.log('Toolbawks.tags.Manager.node_drop -> running update hook...');
        hook();
      });
    }
	};
}();