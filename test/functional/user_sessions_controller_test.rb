require 'test_helper'

class UserSessionsControllerTest < ActionController::TestCase
  setup :activate_authlogic
  
  test "should be able to open login form" do
    # get request shows login form
    get :login
    assert_response :success
    assert_nil session[:user]
    assert_select 'form' do
      assert_select 'input[type=text]#user_session_email'
      assert_select 'input[type=password]#user_session_password'
    end
  end  
  
  test "user should not log in with wrong password" do
    post :login, :user_session => { :email => 'user1@jshub.org', :password => 'incorrect' }
    assert_not_logged_in
    assert_select 'div#flash.notice', /email address or password/
  end
    
  test "unknown user can not log in" do
    post :login, :user_session => {:email => 'unknown@jshub.org', :password => 'incorrect'} 
    assert_not_logged_in
    assert_select 'div#flash.notice', /email address or password/
  end
    
  test "user should log in with correct password" do
    post :login, :user_session => { :email => 'user1@jshub.org', :password => 'secret' }
    assert_logged_in
  end
  
  test "should be able to log out" do
    post :login, :user_session => { :email => 'user1@jshub.org', :password => 'secret' }
    assert_logged_in
    get :logout
    assert_redirected_to :login
    assert_not_logged_in
  end

  private

  def assert_not_logged_in
    assert_nil UserSession.find
  end

  def assert_logged_in
    assert_not_nil UserSession.find
  end

end
