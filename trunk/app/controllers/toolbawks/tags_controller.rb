class Toolbawks::TagsController < Toolbawks::BaseController
  before_filter :login_required, :except => [:show]
	before_filter :check_authorization, :except => [:show]

  layout 'toolbawks_tags'

  def index
    manager
    render :action => 'manager'
  end

	# List manages addition/deletion of items through ajax
  def manager
  end
  
  def show
    if params[:tag_menu]
      filter = filter_settings(params[:filter][:association_klass], params[:filter][:association_quantity_minimum], params[:tag_menu][:active_tag_id])

      if params[:tag_menu][:active_tag_id].to_i > 0
        current_tag = ToolbawksTag.find(params[:tag_menu][:active_tag_id])
      else
        current_tag = ToolbawksTag.new
      end
      
      @tags = ToolbawksTag.find(:all, :conditions => filter[:conditions], :joins => filter[:joins], :group => filter[:group])
      
      params[:tag_menu][:active_tag_id] = 'source' if !params[:tag_menu][:active_tag_id] || [0, "0"].include?(params[:tag_menu][:active_tag_id])
      
      @additional_data = {
        :active_tag_id => params[:tag_menu][:active_tag_id],
        :button_id => params[:tag_menu][:button_id],
        :direction => params[:tag_menu][:direction],
        :current_tag => current_tag
      }
      
      render :layout => 'toolbawks/tags/show/menu'
      return
    else
      # Show a JSON list
      if params[:node] == 'source'
        @tags = ToolbawksTag.find(:all, :conditions => 'parent_id = 0 OR parent_id IS NULL')
        render :layout => 'toolbawks/tags/show/manager'
      elsif params[:node].include?('tag-')
        tag_id = params[:node].sub('tag-', '')
        @tags = ToolbawksTag.find(:all, :conditions => ['parent_id = %d', tag_id])
        render :layout => 'toolbawks/tags/show/manager'
      else
        render :text => '', :status => 500
      end
    end
  end
  
	# Called via AJAX
  def create
    params[:tag] = { :name => 'Untitled', :parent_id => 0 } if !params[:tag]
    @tag = ToolbawksTag.new(params[:tag])
    if @tag.save
      @tag.update_attributes!(:name => "Untitled #{@tag.id}")
      render :text => @tag.attributes.to_json
    else
      render :text => 'An error occurred while creating tag'
    end
  end
  
	# Called via AJAX
  def update
    @tag = ToolbawksTag.find(params[:id])
		@tag.update_attributes!(params[:tag])
		# Edit success
    render :text => "Successfully updated tag"
  end

	# Called via AJAX. 
  def destroy
    ToolbawksTag.find(params[:id]).destroy
		# Render nothing to denote success
    render :text => "Successfully removed tag"
  end

	# Called via AJAX. 
	# Toggle the display flag for this tag
  def toggle
    tag = ToolbawksTag.find(params[:id])
    display = (tag.hidden ? false : true)
		tag.update_attributes!(:hidden => display)
		
		# Render nothing to denote success
    render :text => "Successfully toggled display for tag"
  end

  def results
    params[:id] = :all if params[:id] == 'source' || !params[:id]
    @tag = ToolbawksTag.find(params[:id])
  end
  
private
  
  def filter_settings(klass, count_minimum, active_tag_id)
    active_tag_id = nil if active_tag_id == 'source'
    
    filter =  { 
      :joins => nil,
      :conditions => nil,
      :group => nil
    }

    # Verify that the id is a regular number
    if active_tag_id && active_tag_id.class != Fixnum && !active_tag_id.match(/^[0-9]+$/)
      logger.info 'Toolbawks::ToolbawksTags.filter_settings -> active_id passed is not a number : ' + active_tag_id.inspect
      return config 
    end
    
    if active_tag_id
      filter[:conditions] = ['toolbawks_tags.parent_id = ? AND (toolbawks_tags.hidden != ? OR toolbawks_tags.hidden IS NULL)', active_tag_id, true]
    else
      filter[:conditions] = ['toolbawks_tags.parent_id = 0 AND (toolbawks_tags.hidden != ? OR toolbawks_tags.hidden IS NULL)', true]
    end
  
    if klass
      config = association_config(klass, 'ToolbawksTag')

      if !config
        logger.info 'Toolbawks::ToolbawksTags.filter_settings -> Unable to find config based on Klass: ' + klass + ', active_tag_id: ' + active_tag_id
        return filter 
      end

      # Build the SQL for the filter
      case config[:association].macro
        when :has_and_belongs_to_many
          filter[:joins] = "JOIN #{config[:table]} ON #{config[:table]}.toolbawks_tag_id = toolbawks_tags.id"
          having = (count_minimum ? "HAVING COUNT(*) >= #{count_minimum}" : nil)
          filter[:group] = "toolbawks_tags.position, toolbawks_tags.id #{having}, toolbawks_tags.name, toolbawks_tags.parent_id, toolbawks_tags.hidden"
        when :belongs_to
          logger.info 'Toolbawks::ToolbawksTags.filter_settings -> Association is belongs_to [unconfigured]'
        when :has_many
          logger.info 'Toolbawks::ToolbawksTags.filter_settings -> Association is has_many [unconfigured]'
      end
    end

    return filter
  end
end