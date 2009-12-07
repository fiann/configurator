class CreateTagConfigurations < ActiveRecord::Migration
  def self.up

    # Table to hold available plugins
    create_table :plugins do |t|
      t.string   :type
      t.timestamps
    end
    
    # Tables to hold tag configuration data supplied by users
    create_table :tag_configurations do |t|
      t.string   :name, :null => false
      t.integer  :user_id
      t.string   :site_name
      t.string   :jshub_version
      t.timestamps
    end
    
    create_table :tag_configuration_plugins do |t|
      t.integer  :tag_configuration_id, :null => false
      t.integer  :plugin_id, :null => false
    end 
    
    create_table :tag_configuration_plugin_parameters do |t|
      t.integer  :tag_configuration_plugin_id, :null => false
      t.string   :param_name
      t.string   :param_value
    end
    
    # History of user changes
    create_table :tag_configuration_revisions do |t|
      t.integer :tag_configuration_id, :null => false
      t.integer :revision_number
      t.text    :generated_code
      t.string  :sha1_debug
      t.string  :sha1_production
      t.integer :user_id, :null => false
      t.timestamps
    end

    create_table :tag_configuration_revision_messages do |t|
      t.integer :tag_configuration_revision_id, :null => false
      t.integer :position
      t.string  :message
    end
    
  end
  
  def self.down
    drop_table :tag_configuration_revision_messages
    drop_table :tag_configuration_revisions
    drop_table :tag_configuration_plugin_parameters
    drop_table :tag_configuration_plugins
    drop_table :tag_configurations
    drop_table :plugins
  end
end
