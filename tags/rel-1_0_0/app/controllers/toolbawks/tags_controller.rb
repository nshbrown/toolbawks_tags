class Toolbawks::TagsController < Toolbawks::BaseController
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
      if params[:tag_menu][:active_tag_id].to_i > 0
        conditions = ['parent_id = %d', params[:tag_menu][:active_tag_id]]
        current_tag = Tag.find(params[:tag_menu][:active_tag_id])
      else
        conditions = 'parent_id = 0 OR parent_id IS NULL'
        current_tag = Tag.new
      end
      
      params[:tag_menu][:active_tag_id] = 'source' if !params[:tag_menu][:active_tag_id] || [0, "0"].include?(params[:tag_menu][:active_tag_id])
      
      @additional_data = {
        :active_tag_id => params[:tag_menu][:active_tag_id],
        :button_id => params[:tag_menu][:button_id],
        :direction => params[:tag_menu][:direction],
        :current_tag => current_tag
      }
      
      @tags = Tag.find(:all, :conditions => conditions)
      
      render :layout => 'toolbawks/tags/show/menu'
      return
    else
      # Show a JSON list
      if params[:node] == 'source'
        @tags = Tag.find(:all, :conditions => 'parent_id = 0 OR parent_id IS NULL')
        render :layout => 'toolbawks/tags/show/manager'
      elsif params[:node].include?('tag-')
        tag_id = params[:node].sub('tag-', '')
        @tags = Tag.find(:all, :conditions => ['parent_id = %d', tag_id])
        render :layout => 'toolbawks/tags/show/manager'
      else
        render :text => '', :status => 500
      end
    end
  end
  
	# Called via AJAX
  def create
    params[:tag] = { :name => 'Untitled', :parent_id => 0 } if !params[:tag]
    @tag = Tag.new(params[:tag])
    if @tag.save
      @tag.update_attributes!(:name => "Untitled #{@tag.id}")
      render :text => @tag.attributes.to_json
    else
      render :text => 'An error occurred while creating tag'
    end
  end
  
	# Called via AJAX
  def update
    @tag = Tag.find(params[:id])
		@tag.update_attributes!(params[:tag])
		# Edit success
    render_text "Successfully updated tag"
  end

	# Called via AJAX. 
  def destroy
    @tag = Tag.find(params[:id])
		tag_id = @tag.id
		@tag.destroy
		# Render nothing to denote success
    render_text "Successfully removed tag"
  end
  
  def results
    params[:id] = :all if params[:id] == 'source'
    @tag = Tag.find(params[:id])
  end
end
