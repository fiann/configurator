
class TagConfiguration < ActiveRecord::Base
  
  has_many :tag_configuration_plugins, :dependent => :destroy
  has_many :plugins, :through => :tag_configuration_plugins
  validates_associated :tag_configuration_plugins

  belongs_to :user
  validates_presence_of :user
  
  has_many :tag_configuration_revisions, :dependent => :destroy
  
  validates_presence_of :name
  validates_uniqueness_of :name, :scope => 'user_id', :case_sensitive => false
  
  # TODO move this to the database when there are more available
  VERSIONS = %w{ 0.1beta }
  
  # store version history
  after_create :add_revision_message_for_create
  before_update :cache_changes_before_update
  after_update :add_revision_message_for_update
  
  # a new empty instance should include the default plugins
  def add_default_plugins!
    plugins << Plugin::Microformat.instance
    plugins << Plugin::SampleGet.instance
    plugins << Plugin::Jquery.instance
  end
  
  # update the plugins included in the configuration from a map of ids and parameters
  # in the format:
  # plugin_config => {
  #   "2"=>{"include"=>"true"}, 
  #   "3"=>{"include"=>"true", "server_url"=>"http://www.jshub.org/"}
  # }
  def plugin_config=(plugin_config)
    logger.debug "TagConfiguration.plugin_config= for tag configuration #{id} to #{plugin_config.inspect}"
    
    tag_configuration_plugins.each do |p|
      logger.debug "Checking whether TagConfiguration(#{self.id}) should keep plugin #{p.plugin_id}"
      unless plugin_config.has_key?(p.plugin_id.to_s) && plugin_config[p.plugin_id.to_s]['include'] == "true"
        revision_cache << "Removed #{Plugin.find_by_id(p.plugin_id).name} plugin"
        p.destroy 
      end
    end
    plugin_config.each do |plugin_id, plugin_params|
      next unless plugin_params['include']
      
      tag_config_plugin = tag_configuration_plugins.reject{ |p| p.plugin_id != plugin_id.to_i }
      
      if tag_config_plugin.empty?
        plugin = Plugin.find_by_id(plugin_id.to_i)
        raise "Invalid plugin id #{plugin_id}" if plugin.nil?
        tag_config_plugin = TagConfigurationPlugin.new(:plugin => plugin) 
        tag_configuration_plugins << tag_config_plugin
        revision_cache << "Added #{tag_config_plugin.plugin.name} plugin"
      else
        # should be unique, so just use first one
        tag_config_plugin = tag_config_plugin[0]
      end
      
      tag_config_plugin.tag_configuration = self
      tag_config_plugin.parameters = plugin_params.delete_if {|key, value| key == 'include' || value.empty?}
    end
    
    logger.debug "TagConfiguration.plugin_config= finished"
  end
  
  def valid_for_anonymous_session?
    errors_for_anonymous_session.empty?
  end
  
  def errors_for_anonymous_session
    return errors if valid?
    filtered_errors = ActiveRecord::Errors.new(:base => self)
    errors.each do |attr, msg|
      filtered_errors.add(attr, msg) unless attr == 'user' or (attr == 'name' && msg =~ /taken/)
    end
    filtered_errors
  end
  
  def reset_errors_for_anonymous_session
    filtered_errors = errors_for_anonymous_session
    errors.clear
    filtered_errors.each { |attr, msg| errors.add(attr, msg) }
  end
  
  def has_plugin?(plugin)
    if changed?
      tag_configuration_plugins.each { |p| return true if p.plugin.id == plugin.id }
      false
    else
      plugins.include? plugin 
    end
  end
  
  def parameters_for_plugin(plugin)
    tag_configuration_plugins.each{|p| return p.parameters if p.plugin.id == plugin.id}
    {}
  end
  
  def has_markup_plugins?
    types = (changed?) ? tag_configuration_plugins.collect {|p| p.plugin.plugin_type} : 
      plugins.collect {|p| p.plugin_type}
    types.include? :data_capture
  end
  
  def has_transport_plugins?
    types = (changed?) ? tag_configuration_plugins.collect {|p| p.plugin.plugin_type} : 
      plugins.collect {|p| p.plugin_type}
    types.include? :data_transport
  end
  
  def current_revision_number
    latest ||= TagConfigurationRevision.maximum(:revision_number, 
      :conditions => { :tag_configuration_id => self.id }) || 0
  end
  
  def revisions
    tag_configuration_revisions
  end
  
  protected
  
  def revision_cache
    @revision_cache ||= []
  end

  private
  
  # we have to call #add_revision_message_for_update() after this object is saved because
  # otherwise the foreign key won't be present. So log #changes() to the revision_cache
  # before save, as the changes list is emptied on save
  def cache_changes_before_update
    changes.each do | attr_name, values |
      message = case attr_name
        when 'name' then "Configuration name changed"
        when 'comments' then "Comment updated"
        when 'jshub_version' then "jsHub tag version updated"
      end
      if message
        revision_cache << "#{message} to '#{values[1]}' (was '#{values[0]}')"
      end
    end
  end
  
  def add_revision_message_for_create
    rev = TagConfigurationRevision.new(:tag_configuration => self, :user => self.user)
    tag_configuration_revisions << rev
    rev.add_message "Configuration was created"
    rev.save!
  end
  
  def add_revision_message_for_update
    return if revision_cache.empty? and changes.empty?
    rev = TagConfigurationRevision.new(:tag_configuration => self, :user => self.user)
    tag_configuration_revisions << rev
    for message in revision_cache
      rev.add_message message
      logger.debug "TagConfiguration(#{self.id}) r#{rev.revision_number}: #{message}"
    end
    rev.save!
    revision_cache.clear
  end
  
end
