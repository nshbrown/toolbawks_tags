class ToolbawksTagsCreate < ActiveRecord::Migration
  def self.up
    create_table :toolbawks_tags do |t|
      t.column :name, :string
      t.column :parent_id, :integer
      t.column :position, :integer
      t.column :hidden, :boolean
    end
  end
  
  def self.down
    drop_table :toolbawks_tags
  end
end