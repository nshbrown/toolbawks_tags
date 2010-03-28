class Tag < ActiveRecord::Base
  acts_as_tree
  validates_presence_of :name
  
  def path
    tag_path = '/' + self.ancestors.inject([]) { |path, a| path << a.name }.reverse.join('/')
    return tag_path == '/' ? tag_path : tag_path + '/'
  end
end