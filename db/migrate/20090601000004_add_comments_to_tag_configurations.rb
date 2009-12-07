class AddCommentsToTagConfigurations < ActiveRecord::Migration
  def self.up
    rename_column :tag_configurations, :site_name, :comments
  end
  
  def self.down
    rename_column :tag_configurations, :comments, :site_name
  end
end
