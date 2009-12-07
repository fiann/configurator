require 'test_helper'

class TagConfigurationDownloadTest < ActionController::IntegrationTest
  fixtures :all
  
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "should generate latest debug tag release with correct plugins" do
    config = tag_configurations(:one)
    get generate_debug_tag_configuration_url(:id => config.id)
    assert_response :success
    assert_equal "text/javascript", @response.content_type 
    assert_match "jQuery JavaScript Library v1.3", @response.body, "jQuery library specified in configuration but not included" 
    assert_match "@class hPage-plugin", @response.body, "Microformat plugin specified in configuration but not included" 
    assert_match "@class sample-get-plugin", @response.body, "Sample GET plugin specified in configuration but not included" 
    assert_no_match /@class sample-post-plugin/, @response.body, "Sample POST plugin included in generated file but not specified in configuration" 
  end
  
  test "should generate debug tag release with parameters" do
    config = tag_configurations(:one)
    get generate_debug_tag_configuration_url(:id => config.id)
    assert_response :success
    assert_equal "text/javascript", @response.content_type 
    assert_match '@class sample-get-plugin', @response.body, "Sample GET plugin specified in configuration but not included" 
    assert_match 'var url = "http://www.jshub.org";', @response.body, "Parameter server_url not included" 
    assert_match 'var account = "123456";', @response.body, "Parameter account not included" 
    assert_no_match /<%=/, @response.body, "Unmatched parameters in output" 
  end
  
  test "should include metadata in tag release" do
    config = tag_configurations(:two)
    self.host! 'integrationtest.jshub.org'
    get generate_debug_tag_configuration_url(:id => config.id)
    assert_response :success
    assert_match "Homepage: \"http://www.jshub.org/\"", @response.body, "jsHub URL not included" 
    assert_match "GeneratedBy: \"http://integrationtest.jshub.org/tag_configurations\"", @response.body, "Configurator URL not included" 
    assert_match "Configuration: \"#{config.name} (revision 2, debug)\"", @response.body, "Configuration name not included" 
  end
end
