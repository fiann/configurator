require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  setup :activate_authlogic
  
  test "should be able to register" do
    new_user_params = { :username => 'userX', :email => 'userX@jshub.org', 
      :password => 'secret', :password_confirmation => 'secret' }
    assert_difference('User.count') do
      post :register, :user => new_user_params
      assert_redirected_to :account
    end
  end
  
  test "should be logged in after registering" do
    new_user_params = { :username => 'userX', :email => 'userX@jshub.org', 
      :password => 'secret', :password_confirmation => 'secret' }
    post :register, :user => new_user_params
    assert_not_nil UserSession.find
  end

  test "should show user account details" do
    UserSession.create(users(:user1))
    get :show
    assert_response :success
    assert_select 'div.col1 p', "Username: user1"
    assert_select 'div.col1 p', "Email address: user1@jshub.org"
  end

end
