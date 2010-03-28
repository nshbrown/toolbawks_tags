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

var ToolbawksTagsMenuLoader = function(){
  // shorthand
  var Tree = Ext.tree;
  var preloaded = false;
  
  return {
		init : function(){
		  Ext.QuickTips.init();
		  
			Ext.query('.toolbawks_tags_menu_button').each(function(button_ext){
			  button_ext = Ext.get(button_ext);
				ToolbawksTagsMenuLoader.build(button_ext);
			});
		},

		build: function(button_ext) {
		  // update the button (add events, switch to a image)
		  ToolbawksTagsMenuLoader.update_button(button_ext);
		  
		  // preload the menu
		  ToolbawksTagsMenuLoader.preload(button_ext, 'preload');
	  },
		
	  update_button : function(button_ext) {
		  // add the onclick event to the button
		  button_ext.on('click', ToolbawksTagsMenu.toggle)

      // switch the button text to be a button image that executes the overlay
      button_ext.update('<span class="button" id="' + button_ext.dom.id + '_btn">&nbsp;</span>');
    },
    
    preload : function(button_ext, direction) {
      var button_pt = $(button_ext.dom.id);
      var active_tag_id = button_pt.readAttribute('active_tag_id');
      
      // only need to position the container if this is the first time the button is clicked
      if (!preloaded) {
        var container_ext = Ext.get(button_pt.readAttribute('container_id'));
        
        // position the menu to be below and aligned to the left edge of the button
        var button_for_positioning_pt = Ext.get(button_pt.childNodes[0]);
      
        Position.relativize(button_for_positioning_pt.dom.id);
      
        var container_tl_x = button_for_positioning_pt.getLeft();
        var container_tl_y = button_for_positioning_pt.getBottom();

        container_ext.setX(container_tl_x);
        container_ext.setY(container_tl_y);
      }
      
      ToolbawksTagsMenu.preload(button_pt, active_tag_id);
    }
	};
}();

var ToolbawksTagsMenu = function() {
  var active_tag_list_ext = false;
  var menu_visible = false;
  var href_tag_results = '/toolbawks/tags/results/'; // Path to view all related results for /tag/results/12
  
  return {
    get_tag_list_id : function(button_pt, active_tag_id) {
      var container_id = button_pt.readAttribute('container_id');
      var container = Ext.get(container_id);
      
      return container_id + '_' + active_tag_id;
    },
    
    get_tag_id : function(tag) {
      return 'tag_' + tag.direction + '_' + ((tag.id == 'source') ? tag.id + '_' + tag.source_id : tag.id);
    },
    
    set_href_tag_results : function(href) {
      href_tag_results = href;
    },
    
		toggle : function(evt, el) {
      Event.stop(evt);
      
      var button_pt = $(el.parentNode.id);
		  var container_ext = Ext.get(button_pt.readAttribute('container_id'));
		  
      // Todo: hide any flash elements on the page, ads, or form elements that may be shown above it
		  
		  // show or hide the menu
		  if (menu_visible) {
  	    new Effect.Fade(container_ext.dom.id, { duration: 0.3 });
		    menu_visible = false;
  	  } else {
  	    // if there is already and active_tag_list, reset it to the active_tag_id
	      ToolbawksTagsMenu.render_tag_list(button_pt, button_pt.readAttribute('active_tag_id'), 'preload');
  	    new Effect.Appear(container_ext.dom.id, { duration: 0.3 });
		    menu_visible = true;
      }
      
	  },

    preload : function(button_pt, active_tag_id) {
      // get the tags for the menu and build them
      ToolbawksTagsMenu.render_tag_list(button_pt, active_tag_id, 'preload');
    },
    
    render_tag_list : function(button_pt, active_tag_id, direction) {
      var tag_list_id = ToolbawksTagsMenu.get_tag_list_id(button_pt, active_tag_id);
      var container_ext = Ext.get(button_pt.readAttribute('container_id'));
      
      // check to see if this tag list has already been built
      if (!$(tag_list_id)) {
        // assign the var to the new list created
        var tag_list_ext = Ext.get(tag_list_id);

        // build the list and animate into view
        ToolbawksTagsMenu.build_tag_list(button_pt, active_tag_id, direction);
      } else {
        var tag_list_ext = Ext.get(tag_list_id);
        ToolbawksTagsMenu.animate(tag_list_ext, container_ext, direction);
      }
      
      return tag_list_ext;
    },
    
    build_tag_list : function(button_pt, active_tag_id, direction) {
      console.info('ToolbawksTagsMenu.build_tag_list');
      
      var responseSuccess = function(o) {
        console.info('ToolbawksTagsMenu.build_tag_list -> responseSuccess');
        var response = Ext.decode(o.responseText);
        console.dir(response);
        
        // expecting a hash like this
        /*
        {
          button_id : "toolbawks_tag_menu_1",
          active_tag_id : 1,
          direction : "(preload|right|left)",
          tags : [
            { id : 10, name : 'Back', direction : 'right', position : 1 },
            { id : 32, name : 'Thirty Two', direction : 'right', position : 2 },
            { id : 22, name : 'Twenty Two', direction : 'right', position : 3 },
            { id : 49, name : 'Fourty Nine', direction : 'right', position : 4 },
            { id : 20, name : 'Twenty', direction : 'right', position : 5 }
          ]
        }
        */
        
        var direction = response.direction;
        var tags = response.tags;
        var active_tag_id = response.active_tag_id;

        console.info('ToolbawksTagsMenu.build_tag_list -> responseSuccess -> local vars');
        
        var button_pt = $(response.button_id);
        var container_ext = Ext.get(button_pt.readAttribute('container_id'));
        var tag_list_id = ToolbawksTagsMenu.get_tag_list_id(button_pt, active_tag_id);

        console.info('ToolbawksTagsMenu.build_tag_list -> responseSuccess -> container vars');
        
        var tag_html = [];
        
        tags.each(function(tag) {
          var tag_id = ToolbawksTagsMenu.get_tag_id(tag);
          tag_html[tag_html.length] = ['<li id="' + tag_id + '" tag_id="' + tag.id + '" class="' + tag.direction + '" direction="' + tag.direction + '"><a href="' + href_tag_results + tag.id + '">' + tag.name + '</a></li>'];
        });
        
        console.info('ToolbawksTagsMenu.build_tag_list -> responseSuccess -> tag html built');
        
        var tag_list_html = ['<div class="tag_list" id="' + tag_list_id + '" style="visibility: hidden;">','<ul>', tag_html.join("\n"),'</ul>','</div>'].join("\n");

        console.info('ToolbawksTagsMenu.build_tag_list -> responseSuccess -> tag list html built');
        
        Ext.DomHelper.append(container_ext, tag_list_html);

        console.info('ToolbawksTagsMenu.build_tag_list -> responseSuccess -> tag list html appended');
        
        // add the events to the tags now
        tags.each(function(tag) {
          var tag_id = ToolbawksTagsMenu.get_tag_id(tag);
          Ext.get(tag_id).on('click', ToolbawksTagsMenu.tag_on_click);
        });

        console.info('ToolbawksTagsMenu.build_tag_list -> responseSuccess -> tag events appended');
        
        var tag_list_ext = Ext.get(tag_list_id);
        
        // animate the new list into view
        ToolbawksTagsMenu.animate(tag_list_ext, container_ext, direction);
      };
		  
      var responseFailure = function(o) {
        Toolbawks.info.msg('Tag Menu', 'Error getting the list of tags');
      };

		  // ajax call to grab the items for the active id
      var p = [];
      if (active_tag_id) p[p.length] = 'tag_menu[active_tag_id]=' + active_tag_id;
      if (button_pt) p[p.length] = 'tag_menu[button_id]=' + button_pt.id;
      if (direction) p[p.length] = 'tag_menu[direction]=' + direction;
      params = (p.length > 0) ? p.join('&') : false;
      
      var timeout = 5;
      var method = 'GET';
      var url = '/toolbawks/tags/show';

      method = method || (params ? "POST" : "GET");

      var cb = {
          success: responseSuccess,
          failure: responseFailure,
          timeout: (timeout*1000),
          argument: {"url": url, "params": params}
      };

      var req = Ext.lib.Ajax.request(method, url, cb, params);
    },
    
    tag_on_click : function(evt, tag) {
      console.info('Tag Menu -> tag_on_click');
      
      var tag_pt = $(tag.parentNode.id);
      var direction = tag_pt.readAttribute('direction');
      
      if (direction != 'go' || !direction || direction == undefined) {
        // go must actually redirect to that url
        Event.stop(evt);
      }
      
      // assign all the vars based on the on_click element attributes
      var container = $(tag_pt.parentNode.parentNode.parentNode.id);
      var button_pt = $(container.readAttribute('button_id'));
      var active_tag_id = tag_pt.readAttribute('tag_id');
      var direction = tag_pt.readAttribute('direction');
      
      console.info('Tag Menu -> tag_on_click -> tag_id : ' + active_tag_id + ', direction : ' + direction + ', button_pt : ' + button_pt.id);
      
      if (direction != 'go') {
        // let the a href go thru
        ToolbawksTagsMenu.render_tag_list(button_pt, active_tag_id, direction);
      }
    },
    
    animate : function(tag_list_ext, container_ext, direction) {
      console.info('Tag Menu -> Animating : direction : ' + direction + ', tag_list_ext.id : ' + tag_list_ext.dom.id + ', container_ext.dom.id : ' + container_ext.dom.id + (active_tag_list_ext ? ', active_tag_list_ext.dom.id: ' + active_tag_list_ext.dom.id : ''));

      var container_tr_x = container_ext.getLeft();
      var container_tr_y = container_ext.getTop();

      tag_list_ext.setX(container_tr_x);
      tag_list_ext.setY(container_tr_y);

      tag_list_ext.show();

      switch (direction) {
        case 'preload':
          // if this is the first time, no active should be set
          if (active_tag_list_ext && active_tag_list_ext != tag_list_ext) {
            // there is a different active than the current category we are on, change it back to the default
            active_tag_list_ext.slideOut('l', { concurrent : true, duration : 0.5, callback : ToolbawksTagsMenu.move_tag_list_away });
            tag_list_ext.slideIn('r', { concurrent : true, duration : 0.5 });
          }
          break;
        case 'right':
          active_tag_list_ext.slideOut('l', { concurrent : true, duration : 0.5, callback : ToolbawksTagsMenu.move_tag_list_away });
          tag_list_ext.slideIn('r', { concurrent : true, duration : 0.5 });
          break;
        case 'left':
          active_tag_list_ext.slideOut('r', { concurrent : true, duration : 0.5, callback : ToolbawksTagsMenu.move_tag_list_away });
          tag_list_ext.slideIn('l', { concurrent : true, duration : 0.5 });
          break;
      }
      
      active_tag_list_ext = tag_list_ext;
    },
    
    move_tag_list_away : function(tag_list_ext) {
       tag_list_ext.hide();
    }
  };
}();

Ext.onReady(ToolbawksTagsMenuLoader.init, ToolbawksTagsMenuLoader, true);