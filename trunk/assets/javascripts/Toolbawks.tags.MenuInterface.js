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

Toolbawks.tags.MenuInterface = function() {
  var active_tag_list_ext = false;
  var menu_visible = false;
  
  return {
    get_tag_list_id : function(button_pt, active_tag_id) {
      var container_id = button_pt.readAttribute('container_id');
      var container = Ext.get(container_id);
      
      if (active_tag_id == 'source') { 
        active_tag_id = 0;
      }
      
      return container_id + '_' + active_tag_id;
    },
    
    get_tag_id : function(tag) {
      return 'tag_' + tag.direction + '_' + ((tag.id == 'source') ? tag.id + '_' + tag.source_id : tag.id);
    },
    
    get_href_results : function(tag) {
      
      Toolbawks.info('Toolbawks.tags.MenuInterface.get_href_results -> tag');
      
      var id = (tag.id == 'source') ? 0 : tag.id;
      
      if (!Toolbawks.enableRoutesFilter) {
        Toolbawks.error('Toolbawks.routes.Filter -> NOT ENABLED : Toolbawks.tags.MenuInterface.get_href_results');
        return false;
      }
      
      var alias = Toolbawks.routes.Filter.string(tag.name);
      
      if (id == '0' && alias != 'back') {
        return Toolbawks.tags.MenuInterface.get_href_index();
      }
      
      return_href_results = Toolbawks.tags.href_results.gsub(':id', id).gsub(':alias', alias);
      
      Toolbawks.info('Toolbawks.tags.MenuInterface.get_href_results : ' + return_href_results);
      
      return return_href_results;
    },
    
    set_href_results : function(href) {
      Toolbawks.info('Toolbawks.tags.MenuInterface.set_href_results -> href : ' + href);
      Toolbawks.tags.href_results = href;
    },
    
    get_href_index : function() {
      return Toolbawks.tags.href_index;
    },
    
    set_href_index : function(href) {
      Toolbawks.info('Toolbawks.tags.MenuInterface.set_href_index -> href : ' + href);
      Toolbawks.tags.href_index = href;
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
	      Toolbawks.tags.MenuInterface.render_tag_list(button_pt, button_pt.readAttribute('active_tag_id'), 'preload');
  	    new Effect.Appear(container_ext.dom.id, { duration: 0.3 });
		    menu_visible = true;
      }
      
	  },

    preload : function(button_pt, active_tag_id) {
      // get the tags for the menu and build them
      Toolbawks.tags.MenuInterface.render_tag_list(button_pt, active_tag_id, 'preload');
    },
    
    render_tag_list : function(button_pt, active_tag_id, direction) {
      Toolbawks.log('MenuInterface.render_tag_list');
      
      var tag_list_id = Toolbawks.tags.MenuInterface.get_tag_list_id(button_pt, active_tag_id);
      
      Toolbawks.log('MenuInterface.render_tag_list -> tag_list_id : ' + tag_list_id);
      
      var container_ext = Ext.get(button_pt.readAttribute('container_id'));
      var tag_list_ext = Ext.get(tag_list_id);
      
      // check to see if this tag list has already been built
      if (!tag_list_ext) {
        Toolbawks.log('MenuInterface.render_tag_list -> build_tag_list (a tag list does not exist yet)');
        
        // build the list and animate into view
        Toolbawks.tags.MenuInterface.build_tag_list(button_pt, active_tag_id, direction);
      } else {
        Toolbawks.log('MenuInterface.render_tag_list -> animate existing tag list');
        
        Toolbawks.tags.MenuInterface.animate(tag_list_ext, container_ext, direction);
      }
      
      return tag_list_ext;
    },
    
    build_tag_list : function(button_pt, active_tag_id, direction) {
      var association_klass = button_pt.readAttribute('association_klass');
      var association_quantity_minimum = button_pt.readAttribute('association_quantity_minimum');
      
      
      var responseSuccess = function(o) {
        var response = Ext.decode(o.responseText);
        
        // expecting a hash like this
        /*
        {
          button_id : "toolbawks_tag_menu_1",
          active_tag_id : 1,
          direction : "(preload|right|left)",
          tags : [
            { id : 10, name : 'Back', direction : 'right' },
            { id : 32, name : 'Thirty Two', direction : 'right' },
            { id : 22, name : 'Twenty Two', direction : 'right' },
            { id : 49, name : 'Fourty Nine', direction : 'right' },
            { id : 20, name : 'Twenty', direction : 'right' }
          ]
        }
        */
        
        var direction = response.direction;
        var tags = response.tags;
        var active_tag_id = response.active_tag_id;

        var button_pt = $(response.button_id);
        var container_ext = Ext.get(button_pt.readAttribute('container_id'));
        var tag_list_id = Toolbawks.tags.MenuInterface.get_tag_list_id(button_pt, active_tag_id);

        var tag_html = [];
        
        tags.each(function(tag) {
          var tag_id = Toolbawks.tags.MenuInterface.get_tag_id(tag);
          var tag_url = Toolbawks.tags.MenuInterface.get_href_results(tag);

          Toolbawks.log('Toolbawks.tags.MenuInterface.build_tag_list -> responseSuccess -> tag id : ' + tag_id + ', tag_url : ' + tag_url);

          tag_html[tag_html.length] = ['<li id="' + tag_id + '" tag_id="' + tag.id + '" class="' + tag.direction + '" direction="' + tag.direction + '"><a href="' + tag_url + '">' + tag.name + '</a></li>'];
        });
        
        var tag_list_html = ['<div class="tag_list" id="' + tag_list_id + '" style="visibility: hidden;">','<ul>', tag_html.join("\n"),'</ul>','</div>'].join("\n");

        Ext.DomHelper.append(container_ext, tag_list_html);

        Toolbawks.log('Toolbawks.tags.MenuInterface.build_tag_list -> responseSuccess -> tag list [tag_list_id : ' + tag_list_id + '] html appended');
        
        // add the events to the tags now
        tags.each(function(tag) {
          var tag_id = Toolbawks.tags.MenuInterface.get_tag_id(tag);
          Ext.get(tag_id).on('click', Toolbawks.tags.MenuInterface.tag_on_click);
        });

        var tag_list_ext = Ext.get(tag_list_id);
        
        // animate the new list into view
        Toolbawks.tags.MenuInterface.animate(tag_list_ext, container_ext, direction);
      };
		  
      var responseFailure = function(o) {
        Toolbawks.dialog.msg('Tag Menu', 'Error getting the list of tags');
      };

		  // ajax call to grab the items for the active id
      var p = [];
      if (association_klass) p[p.length] = 'filter[association_klass]=' + association_klass;
      if (association_quantity_minimum) p[p.length] = 'filter[association_quantity_minimum]=' + association_quantity_minimum;
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
      Toolbawks.log('Tag Menu -> tag_on_click');
      
      var tag_pt = $(tag.parentNode.id);
      var direction = tag_pt.readAttribute('direction');
      
      if (direction != 'go' || !direction || direction == undefined) {
        // go must actually redirect to that url
        Event.stop(evt);
      }
      
      // assign all the vars based on the on_click element attributes
      var container_pt = $(tag_pt.parentNode.parentNode.parentNode.id);
      var button_pt = $(container_pt.readAttribute('button_id'));
      var active_tag_id = tag_pt.readAttribute('tag_id');
      var direction = tag_pt.readAttribute('direction');
      
//      Toolbawks.log('Tag Menu -> tag_on_click -> tag_id : ' + active_tag_id + ', direction : ' + direction + ', button_pt : ' + button_pt.id);
      
      try {
        button_pt.id;
      } catch(err) {
        Toolbawks.error('BUTTON NOT FOUND');
      };
      
      if (direction != 'go') {
        // let the a href go thru
        Toolbawks.tags.MenuInterface.render_tag_list(button_pt, active_tag_id, direction);
      }
    },
    
    animate : function(tag_list_ext, container_ext, direction) {
      Toolbawks.log('Toolbawks.tags.MenuInterface.animate -> direction : ' + direction + ', tag_list_ext.id : ' + tag_list_ext.dom.id + ', container_ext.dom.id : ' + container_ext.dom.id + (active_tag_list_ext ? ', active_tag_list_ext.dom.id: ' + active_tag_list_ext.dom.id : ''));

      var container_x = container_ext.getLeft();
      var container_y = container_ext.getTop();

      tag_list_ext.setX(container_x);
      tag_list_ext.setY(container_y);

      switch (direction) {
        case 'preload':
          // if this is the first time, no active should be set
          if (active_tag_list_ext && active_tag_list_ext != tag_list_ext) {
            // there is a different active than the current category we are on, change it back to the default
            active_tag_list_ext.slideOut('l', { concurrent : true, duration : 0.5, callback : Toolbawks.tags.MenuInterface.move_tag_list_away });
            tag_list_ext.slideIn('r', { concurrent : true, duration : 0.5 });
          } else {
            if (!tag_list_ext.isVisible()) {
              tag_list_ext.show();
            }
          }
          break;
        case 'right':
          if (active_tag_list_ext) {
            active_tag_list_ext.slideOut('l', { concurrent : true, duration : 0.5, callback : Toolbawks.tags.MenuInterface.move_tag_list_away });
          }
          tag_list_ext.slideIn('r', { concurrent : true, duration : 0.5 });
          break;
        case 'left':
          active_tag_list_ext.slideOut('r', { concurrent : true, duration : 0.5, callback : Toolbawks.tags.MenuInterface.move_tag_list_away });
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