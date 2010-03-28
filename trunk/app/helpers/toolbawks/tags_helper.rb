module Toolbawks::TagsHelper
  def js_build_tag_tree(tags)
    # todo: add in hidden capabilities so that the user can toggle the state for menus
    
    collection = []

    tags.each do |t|
      data = {
        :text => '"' + t.name + '"',
        :id => '"' + "tag-#{t.id}" + '"',
        :cls => '"tag"',
        :disabled => (t.hidden ? 'true' : 'false')
      }

      collection << options_for_javascript(data)
    end

    '[' + collection.join(', ') + ']'
  end
  
  def js_build_tag_menu(tags, additional_data)
    collection = []
    
    tag_menu = { 
      :tags => nil
    }
    
    current_tag = additional_data[:current_tag]
    
    logger.info '[ToolbawksTags.js_build_tag_menu]'
    logger.info current_tag.inspect
    
    if current_tag.ancestors.length == 0 && !current_tag.new_record?
      # This is a root node in the tree
      parent = ToolbawksTag.new(:id => 'source')
      logger.info '-----------'
      logger.info 'current_tag.ancestors.length == 0'
    elsif !current_tag.parent.nil?
      parent = Tag.find(current_tag.parent_id)
    end

    # Don't add the back to parent if we are at the root node
    if parent
      data_parent = {
        :name => 'Back',
        :id => ((tags.length <= 0 || parent.new_record? || parent.id <= 0) ? 'source' : parent.id),
        :source_id => current_tag.id,
        :direction => 'left'
      }
    
      collection << data_parent
    end
    
    # Add the current tag
    if current_tag
      data_current_tag = {
        :name => "All #{current_tag.name}",
        :id => (current_tag.id ? current_tag.id : 'source'),
        :direction => 'go'
      }
    
      collection << data_current_tag
    end
    
    tags.each do |t|
      tag_data = {
        :name => t.name,
        :id => t.id,
        :direction => ((t.children_visible.length > 0) ? 'right' : 'go')
      }

      collection << tag_data
    end
    
    tag_menu[:tags] = collection
    
    additional_data[:current_tag] = nil
    
    tag_menu = tag_menu.merge(additional_data)
    
    tag_menu.to_json
  end
end