class CreateTags < ActiveRecord::Migration
  def self.up
    if !Tag.table_exists?
      create_table :tags do |t|
        t.column :name, :string
        t.column :parent_id, :integer
        t.column :position, :integer
      end
    else
      add_column :tags, :name, :string if !Tag.columns.inject([]) { |cols, c| cols << c.name }.include?('name')
      add_column :tags, :parent_id, :integer, :default => '0' if !Tag.columns.inject([]) { |cols, c| cols << c.name }.include?('parent_id')
    end
  end
  
  def self.down
    drop_table :tags
  end
end