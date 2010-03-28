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

Toolbawks.enableTagsModel = true;

Toolbawks.tags.Model = function() {
  var _ = {
    hooks : {
      create : [],
      update : [],
      remove : [],
      toggle : []
    }
  };

  return {
    verify_hook_scope : function(scope) {
      switch (scope) {
        case 'create':
          return true;
        case 'update':
          return true;
        case 'remove':
          return true;
        case 'toggle':
          return true;
        default:
          return false;
      }
    },
    
    add_hook : function(scope, func) {
      if (!Toolbawks.tags.Model.verify_hook_scope(scope)) {
        Toolbawks.error('Toolbawks.tags.Model.add_hook : Hook failed to be added to scope [' + scope + ']. Hook details : ' + func);
        return false;
      } else {
        Toolbawks.log('Toolbawks.tags.Model.add_hook : Added hook to scope [' + scope + ']. Hook details : ' + func);
      }
      _.hooks[scope][_.hooks[scope].length] = func;
    },
    
    get_hooks : function(scope) {
      if (!Toolbawks.tags.Model.verify_hook_scope(scope)) {
        Toolbawks.error('Toolbawks.tags.Model.get_hooks : Invalid scope while fetching hooks');
        return false;
      }
      return _.hooks[scope];
    },
    
    parent_change: function(id, parent_id) {
      Toolbawks.tags.Model.update(id, false, parent_id);
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
        Toolbawks.dialog.msg('Tag Manager', o.responseText);
        
        // Run the hooks for updating tag
        Toolbawks.tags.Model.get_hooks('update').each(function(hook) {
          Toolbawks.log('Toolbawks.tags.Model.update -> running update hook...');
          hook(id);
        });
      };

      var responseFailure = function(o) {
        Toolbawks.dialog.msg('Tag Manager', 'Error creating new tag');
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
        
        // Run the hooks for creating a tag
        Toolbawks.tags.Model.get_hooks('create').each(function(hook) {
          Toolbawks.log('Toolbawks.tags.Model.create -> running create hook...');
          hook(tag_details);
        });
      };

      var responseFailure = function(o) {
        Toolbawks.dialog.msg('Tag Manager', 'Error creating new tag');
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
        Toolbawks.dialog.msg('Tag Manager', o.responseText);

        // Run the hooks for removing a tag
        Toolbawks.tags.Model.get_hooks('remove').each(function(hook) {
          Toolbawks.log('Toolbawks.tags.Model.destroy -> running remove hook...');
          hook(id);
        });
      };

      var responseFailure = function(o) {
        Toolbawks.dialog.msg('Tag Manager', 'Error creating new tag');
      };

      var cb = {
          success: responseSuccess,
          failure: responseFailure,
          timeout: (timeout*1000),
          argument: {"url": url, "params": params}
      };

      var req = Ext.lib.Ajax.request(method, url, cb, params);
    },
    
    toggle : function(id) {
      var url = '/toolbawks/tags/toggle/' + id;
      var params = false;
      var timeout = 5;
      var method = 'GET';

      method = method || (params ? "POST" : "GET");

      var responseSuccess = function(o) {
        Toolbawks.dialog.msg('Tag Manager', o.responseText);

        // Run the hooks for creating a tag
        Toolbawks.tags.Model.get_hooks('toggle').each(function(hook) {
          Toolbawks.log('Toolbawks.tags.Model.node_drop -> running toggle hook...');
          hook();
        });
      };

      var responseFailure = function(o) {
        Toolbawks.dialog.msg('Tag Manager', 'Error toggling display for tag');
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