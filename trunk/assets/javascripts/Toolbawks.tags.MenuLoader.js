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

Toolbawks.enableTagsMenu = true;

Toolbawks.tags.MenuLoader = function(){
  // shorthand
  var Tree = Ext.tree;
  var preloaded = false;
  
  return {
		init : function(){
//		  Ext.QuickTips.init();
		  
			Toolbawks.tags.MenuLoader.build(Ext.get('toolbawks_tags_menu'));
			
  		// When this window reloads, clear the JS cache
  		Ext.EventManager.on(window, 'unload', function(){
			  delete Toolbawks.tags.MenuLoader;
			  delete Toolbawks.tags.MenuInterface;
			});
		},

		build: function(button_ext) {
		  // update the button (add events, switch to a image)
		  Toolbawks.tags.MenuLoader.update_button(button_ext);
		  
		  // preload the menu
		  Toolbawks.tags.MenuLoader.preload(button_ext, 'preload');
	  },
	  
	  update_button : function(button_ext) {
		  // add the onclick event to the button
		  button_ext.on('click', Toolbawks.tags.MenuInterface.toggle);
		  
		  // update the href to the most recently configured href
      button_ext.dom.href = Toolbawks.tags.MenuInterface.get_href_index();
      
      // switch the button text to be a button image that executes the overlay
      button_ext.update('<span class="button" id="' + button_ext.dom.id + '_btn">&nbsp;</span>');
    },
    
    preload : function(button_ext, direction) {
      var button_pt = $(button_ext.dom.id);
      var active_tag_id = button_pt.readAttribute('active_tag_id');
      
      // only need to position the container if this is the first time the button is clicked
      if (!preloaded) {
        var container_position = { x: 0, y: 0};
        
        var container_ext = Ext.get(button_pt.readAttribute('container_id'));
        
        // position the menu to be below and aligned to the left edge of the button
        
        var button_for_positioning_ext = Ext.get(button_pt.id);
        
        container_position['x'] = button_for_positioning_ext.getLeft(true);
        container_position['y'] = button_for_positioning_ext.getBottom(true);
        
        container_ext.setX(container_position['x']);
        container_ext.setY(container_position['y']);
        
        preloaded = true;
      }
      
      Toolbawks.tags.MenuInterface.preload(button_pt, active_tag_id);
    }
	};
}();

Ext.onReady(Toolbawks.tags.MenuLoader.init, Toolbawks.tags.MenuLoader, true);