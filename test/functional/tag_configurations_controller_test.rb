require 'test_helper'

class TagConfigurationsControllerTest < ActionController::TestCase
  setup :activate_authlogic
    
  test "should get index page" do
    get :index
    assert_response :success
  end
  
  test "index should not list any configurations if not logged in" do
    get :index
    tag_configurations = assigns(:tag_configurations)
    assert_nil tag_configurations
  end
  
  test "index should list saved configurations if logged in" do
    login
    get :index
    assert_select 'div.content table td.config_name' do |configs|
      assert_equal 2, configs.size
      assert_select 'a', "Config one"
      assert_select 'a', "Config two"
    end
  end

  test "index should have link to log in" do
    get :index
    assert_select "a[href=#{login_path}]"
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create and save tag configuration if logged in" do
    assert_difference('TagConfiguration.count') do
      login
      post :create, 
        { :tag_configuration => { :name => 'test new config', :jshub_version => '1.1' } }
      assert assigns(:tag_configuration).errors.empty?, assigns(:tag_configuration).errors.inspect
    end
    assert_redirected_to tag_configuration_path(assigns(:tag_configuration))
  end

  test "should create tag configuration in session if not logged in" do
    post :create,
      # do not log in
      { :tag_configuration => { :name => 'test new config', :jshub_version => '1.1' } }
    assert assigns(:tag_configuration).errors_for_anonymous_session.empty?, 
      assigns(:tag_configuration).errors_for_anonymous_session.inspect
    assert_equal assigns(:tag_configuration), session[:tag_configuration]
    assert_redirected_to show_new_tag_configuration_path
  end

  test "should show tag_configuration" do
    get :show, :id => tag_configurations(:one).id
    assert_response :success
    # check libraries
    assert_select "fieldset#libraries" do
      assert_select "p.plugin_name", :count => 1
      assert_select "p.plugin_name#plugin-#{plugins(:jquery).id}"
    end
    # check data capture plugins
    assert_select "fieldset#data_capture_plugins" do
      assert_select "p.plugin_name", :count => 1
      assert_select "p.plugin_name#plugin-#{plugins(:microformat).id}"
    end
    # check data transport plugins
    assert_select "fieldset#data_transport_plugins" do
      assert_select "p.plugin_name", :count => 1
      assert_select "p.plugin_name#plugin-#{plugins(:sample_get).id}"
      assert_select "p.plugin_name#plugin-#{plugins(:sample_get).id} ~ div p.plugin_param#server_url span.value", "http://www.jshub.org"
      assert_select "p.plugin_name#plugin-#{plugins(:sample_get).id} ~ div p.plugin_param#account_id span.value", "123456"
    end
  end
  
  test "should show revision list when there is at least one revision present" do
    # with no revisions, no link is present 
    config = tag_configurations(:one)
    get :show, :id => config.id
    assert_response :success
    assert_select "div.details" do
      assert_select ":not(a[href=#{tag_configuration_revisions_path :tag_configuration_id => config.id}])"
    end    
    # with >1 previous revision, check we can see revisions list
    config = tag_configurations(:two)
    get :show, :id => config.id
    assert_equal 2, config.current_revision_number, "Test is broken, revision number of fixture is wrong"
    assert_response :success
    assert_select "div.details" do
      assert_select "a[href=#{tag_configuration_revisions_path :tag_configuration_id => config.id}]"
    end    
  end

  test "should get edit" do
    get :edit, :id => tag_configurations(:one).id
    assert_response :success
  end

  test "should update tag_configuration" do
#    put :update, 
#      { :id => tag_configurations(:one).id, :tag_configuration => tag_configurations(:one) },
#      { :user => users(:user1) }
#    assert_redirected_to tag_configuration_path(assigns(:tag_configuration))
  end

  test "should destroy tag_configuration" do
    assert_difference('TagConfiguration.count', -1) do
      delete :destroy, :id => tag_configurations(:one).id
    end
    assert_redirected_to tag_configurations_path
  end
  
  test "should generate production tag release" do
  end
  
  test "should show comments in index and show views" do
    login
    get :index
    assert_select "fieldset#config_listing" do
      assert_select "td.config_name", "Config one"
      assert_select "td.comments", "jshub.org"
    end
    get :show, :id => tag_configurations(:one).id
    assert_select "h1#config_name", "Config one"
    assert_select "pre#comments", "jshub.org"
  end
  
  private
  
  def login(user = :user1)
    UserSession.create(users(user))
  end
end
