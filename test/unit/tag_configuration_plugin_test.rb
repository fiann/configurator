require 'test_helper'

class TagConfigurationPluginTest < ActiveSupport::TestCase
  
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "validates presence of plugin and tag_configuration" do
    # missing a plugin and configuration
    config = TagConfigurationPlugin.new
    assert ! config.valid?
    assert config.errors.on(:plugin)
    assert config.errors.on(:tag_configuration)
    assert_equal 2, config.errors.size
    # add a plugin that is not in the fixtures
    config.plugin = Plugin::SamplePost.instance
    config.tag_configuration = tag_configurations(:one)
    assert config.valid?
    # and one that is
    config.plugin = Plugin::Microformat.instance
    assert ! config.valid?
  end
  
  test "fixtures correctly loaded" do
    config = tag_configuration_plugins(:one_microformat)
    assert_equal tag_configurations(:one), config.tag_configuration
    assert_equal Plugin::Microformat.instance, config.plugin
    assert config.parameters.empty?
  end
  
  test "read params as a simple hash" do
    config = tag_configuration_plugins(:one_microformat)
    assert_not_nil config
    assert config.parameters.empty?
    config = tag_configuration_plugins(:one_sample_get)
    assert_not_nil config
    assert_equal 2, config.parameters.size
    assert config.parameters.has_key?('server_url')
    assert_equal 'http://www.jshub.org', config.parameters['server_url'] 
    assert config.parameters.has_key?('account_id')
    assert_equal '123456', config.parameters['account_id'] 
  end
  
  test "update plugin parameters from a simple hash" do
    config = tag_configuration_plugins(:one_sample_get)
    new_params = {
      'server_url' => 'http://www.company.com/',
      # 'account_id' => not present in the hash
      'added_param' => 'new value'
    }
    config.parameters = new_params
    config.save!
    config = TagConfigurationPlugin.find_by_id(config.id)
    assert_equal 2, config.parameters.size
    assert config.parameters.has_key?('server_url')
    assert_equal 'http://www.company.com/', config.parameters['server_url'] 
    assert ! config.parameters.has_key?('account_id')
    assert config.parameters.has_key?('added_param')
    assert_equal 'new value', config.parameters['added_param'] 
  end
  
end
