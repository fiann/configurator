require 'test_helper'

class TagConfigurationCreationScenariosTest < ActionController::IntegrationTest
  fixtures :all
  
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "authenticated user creates a configuration" do
    login
    
    visit new_tag_configuration_path
    click_link "Create a new configuration"
    fill_in "tag_configuration_name", :with => "test one"
    check "Page data HTML microformats"
    uncheck "Sample HTTP GET data transport plugin"
    click_button "Save"
    
    # Check the details are shown
    assert_select "h1#config_name", "test one"
    assert_select "fieldset#data_capture_plugins" do
      assert_select "p.plugin_name", :count => 1
      assert_select "p.plugin_name#plugin-#{plugins(:microformat).id}"
    end
    assert_select "fieldset#data_transport_plugins" do
      assert_select "p.plugin_name", :count => 0
    end
    
    # and it is listed in the saved configurations
    assert_select "table.saved_configs" do
      assert_select "td.config_name", :count => 3
      assert_select "td.config_name", "test one"
    end
  end
  
  test "anonymous user creates a configuration" do
    get new_tag_configuration_path
    fill_in "tag_configuration_name", :with => "test one"
    check "Page data HTML microformats"
    check "Google Analytics markup"
    uncheck "Sample HTTP GET data transport plugin"
    
    click_button "Save"
    
    # Check the details are shown
    assert_response :success
    assert_select "h1#config_name", "test one"
    assert_select "fieldset#data_capture_plugins" do
      assert_select "p.plugin_name", :count => 2
      assert_select "p.plugin_name#plugin-#{plugins(:microformat).id}"
      assert_select "p.plugin_name#plugin-#{plugins(:microformat).id}"
    end
    assert_select "fieldset#data_transport_plugins" do
      assert_select "p.plugin_name", :count => 0
    end
    
    # there are no saved configurations unless you log in
    assert_select "table.saved_configs", :count => 0
    
    # but you can download the config without saving it
    click_link "Download debug version"
    assert_response :success
    assert_equal "text/javascript", @response.content_type
  end
  
  test "anonymous configuration is saved when user logs in" do
    get new_tag_configuration_path
    fill_in "tag_configuration_name", :with => "test one"
    click_button "Save"
    
    # Check the details are shown
    assert_select "h1#config_name", "test one"
    
    # there are no saved configurations unless you log in
    assert_select "table.saved_configs", :count => 0
    
    # so let's try that
    login
    assert_select "table.saved_configs" do
      assert_select "td.config_name", :count => 3
      assert_select "td.config_name", "test one"
    end
  end
  
  test "anonymous configuration is saved when user registers" do
    get new_tag_configuration_path
    fill_in "tag_configuration_name", :with => "test one"
    click_button "Save"
    
    # Check the details are shown
    assert_select "h1#config_name", "test one"
    
    # there are no saved configurations unless you log in
    assert_select "table.saved_configs", :count => 0
    
    # so let's register
    get register_path
    fill_in "Choose a user name", :with => "new user"
    fill_in "Email", :with => "user@test.com"
    fill_in "Password", :with => "password"
    fill_in "Confirm password", :with => "password"
    click_button "Register"
    
    assert_select "table.saved_configs" do
      assert_select "td.config_name", :count => 1
      assert_select "td.config_name", "test one"
    end
  end
  
  test "anonymous configuration conflicts when user logs in" do
    get new_tag_configuration_path
    fill_in "tag_configuration_name", :with => "config one"
    click_button "Save"
    
    # Check the details are shown
    assert_select "h1#config_name", "config one"
    
    # there are no saved configurations unless you log in
    assert_select "table.saved_configs", :count => 0
    
    # we should see a warning that it can't be saved
    login
    assert_select "table.saved_configs" do
      assert_select "td.config_name", :count => 2
      assert_select "td.config_name", "Config one"
    end
    assert_select "#flash" do
      assert_select "li", /Name has already been taken/
    end
  end
  
  private
  
  def login(user = :user1)
    @user = users(user)
    
    # Log in using the form
    visit login_url
    assert_response :success
    fill_in "email", :with => @user.email
    fill_in "password", :with => "secret"
    click_button "Log in"
    
    assert_not_nil UserSession.find
  end

end
