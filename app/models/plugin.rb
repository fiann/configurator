class Plugin < ActiveRecord::Base
  
  has_many :tag_configuration_plugins, :dependent => :destroy
  has_many :tag_configurations, :through => :tag_configuration_plugins
  
  validates_uniqueness_of :type
  
  def name
    /Plugin::(.+)/.match(self.class.name)[1]
  end
  
  def self.instance
  end
  
  def self.instance(plugin_classname = nil)
    if plugin_classname.nil?
      instance = find_or_create_by_type self.name
      instance.save! if instance.new_record?
      return instance
    end

    # tip from http://infovore.org/archives/2006/08/02/getting-a-class-object-in-ruby-from-a-string-containing-that-classes-name/
    plugin_class = Plugin.const_get("#{plugin_classname.to_s.camelize}")
    raise ArgumentError, "Cannot resolve to plugin type: #{plugin_classname}" if plugin_class == nil
    logger.debug "Found #{plugin_class}"
    plugin_class.send('instance')
  end
  
end