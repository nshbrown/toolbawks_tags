module ApplicationHelper
  mattr_accessor :toolbawks_tags_menu_count
  self.toolbawks_tags_menu_count = 0

  def toolbawks_tags_head(options = {})
    <<-EOL
    #{ javascript_include_tag 'Toolbawks.tags.js', :plugin => 'toolbawks_tags' }
    #{ stylesheet_link_tag 'Toolbawks.tags.Manager.css', :plugin => 'toolbawks_tags' if options[:manager] || options[:all] }
    #{ javascript_include_tag 'Toolbawks.tags.Model.js', 'Toolbawks.tags.Manager.js', :plugin => 'toolbawks_tags' if options[:manager] || options[:all] }
    #{ stylesheet_link_tag 'Toolbawks.tags.Menu.css', :plugin => 'toolbawks_tags' if options[:menu] || options[:all] }
    #{ javascript_include_tag 'Toolbawks.tags.MenuLoader.js', 'Toolbawks.tags.MenuInterface.js', :plugin => 'toolbawks_tags' if options[:menu] || options[:all] }
EOL
  end
  
  def toolbawks_tags_menu(options = {})
    options[:button_id] = "toolbawks_tags_menu" if !options[:button_id]
    options[:container_id] = options[:button_id] + '_container'
    options[:active_tag_id] = 0 if !options[:active_tag_id]
    options[:list_url] = ToolbawksTags.href_tags_index if !options[:list_url]
    
    if options[:association_klass]
      options[:filter] = ' association_klass="' + options[:association_klass] + '"'
      options[:filter] += ' association_quantity_minimum="' + options[:association_quantity_minimum] + '"' if options[:association_quantity_minimum]
    end
    
    <<-EOL
    <a class="toolbawks_tags_menu_button" id="#{options[:button_id]}" href="#{options[:list_url]}" active_tag_id="#{options[:active_tag_id]}" container_id="#{options[:container_id]}" #{options[:filter]}>Categories</a>
    <div id="#{options[:container_id]}" button_id="#{options[:button_id]}" class="toolbawks_tags_menu_container" style="display:none;"></div>
EOL
  end
  
  def toolbawks_tags_manager
    <<-EOL
    <div class="toolbawks_tags_manager" id="toolbawks_tags_manager"></div>
EOL
  end
end