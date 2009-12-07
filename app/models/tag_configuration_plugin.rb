# Associates a tag plugin (data capture or data transport) to a particular configuration

class TagConfigurationPlugin < ActiveRecord::Base
  
  belongs_to :tag_configuration
  validates_presence_of :tag_configuration
  
  belongs_to :plugin
  validates_presence_of :plugin
  validates_uniqueness_of :plugin_id, :scope => 'tag_configuration_id'
  
  has_many :tag_configuration_plugin_parameters, :dependent => :destroy
  
  def parameters
    params = {}
    tag_configuration_plugin_parameters.each do |p|
      params[p.param_name] = p.param_value
    end
    params
  end
  
  def parameters= (new_params)
    logger.debug "TagConfigurationPlugin.parameters= for config #{tag_configuration}, plugin #{plugin}: #{new_params.inspect}"
    my_params = tag_configuration_plugin_parameters
    my_params.each do |p|
      unless new_params.has_key?(p.param_name)
        tag_configuration.revision_cache << "Updated #{plugin.name} plugin: removed #{p.param_name}=#{p.param_value}"
        my_params.delete p
      end
    end
    new_params.each do |name, value|
      p = my_params.find_by_param_name(name)
      if p.nil?
        tag_configuration.revision_cache << "Updated #{plugin.name} plugin: added #{name}=#{value}"
        my_params << TagConfigurationPluginParameter.new(:param_name => name, :param_value => value)
      elsif p.param_value != value
        tag_configuration.revision_cache << "Updated #{plugin.name} plugin: changed #{name}=#{value} (was #{p.param_value})"
        logger.debug "Updating parameter #{p.param_name}=#{p.param_value} on config #{tag_configuration.id}:#{plugin.name}"
        p.param_value = value
        p.save
      end
    end
  end
end
