module ApplicationHelper
  mattr_accessor :toolbawks_tags_menu_count
  self.toolbawks_tags_menu_count = 0

  def toolbawks_tags_head
    <<-EOL
    #{ stylesheet_link_tag 'menu', 'manager', :plugin => 'toolbawks_tags' }
    #{ javascript_include_tag 'menu', 'manager', :plugin => 'toolbawks_tags' }
EOL
  end
  
  def toolbawks_tags_menu(options = {})
    if !options[:button_id]
      ApplicationHelper.toolbawks_tags_menu_count += 1
      options[:button_id] = "toolbawks_tags_menu_#{ApplicationHelper.toolbawks_tags_menu_count}"
    end
    
    options[:container_id] = options[:button_id] + '_container'
    options[:active_tag_id] = 0 if !options[:active_tag_id]
    
    <<-EOL
    <a id="#{options[:button_id]}" class="toolbawks_tags_menu_button" href="/browse" active_tag_id="#{options[:active_tag_id]}" container_id="#{options[:container_id]}">Categories</a>
    <div id="#{options[:container_id]}" button_id="#{options[:button_id]}" class="toolbawks_tags_menu_container" style="display:none;"></div>
EOL
  end
end