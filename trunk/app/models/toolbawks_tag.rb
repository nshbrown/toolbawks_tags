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

class ToolbawksTag < ActiveRecord::Base
  acts_as_tree
  
  validates_presence_of :name
	validates_uniqueness_of :name
	
	def self.find_alpha
		find(:all, :order => 'parent_id ASC, name ASC')
	end
	
	def full_path
	  path + self.name
  end

  def path
    _path = '/' + self.ancestors.inject([]) { |p, a| p << a.name }.reverse.join('/')
    return _path == '/' ? _path : _path + '/'
  end
  
  def public_route_path(options = {})
    if Toolbawks.routes_enabled
      '/t/' + id.to_s + '-' + ToolbawksRoutes.filter(name)
    end
      '/t/' + id.to_s + '-' + Pluralize.underscore(name)
    else 
  end
  
  def children_visible
    children.inject([]) { |visible, t| visible << t if !t.hidden }
  end
  
  def ancestor_id_list
    self.ancestors.collect { |ancestor| ancestor.id if ancestor.id != '0' }.join(',')
  end
  
  def children_id_list
    self.children.collect { |child| child.id }.join(',')
  end
end