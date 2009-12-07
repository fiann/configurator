class UserSessionsController < ApplicationController
  before_filter :require_no_user, :only => [:new, :create]
  before_filter :require_user, :only => :destroy
  
  layout "tag_configurations"
  
  # GET /login   - show login form
  # POST /login  - authenticate and redirect to requested page  
  def login
    @user_session = UserSession.new(params[:user_session])
    @col2 = "register"

    if request.post? && params[:user_session]
      if @user_session.save
        flash[:notice] = "<p>Login successful</p>"
        
        # if there is a tag configuration in the anonymous session, save it
        if session[:tag_configuration] && session[:tag_configuration].valid_for_anonymous_session?
          @tag_configuration = session[:tag_configuration]
          @tag_configuration.user = current_user
          if @tag_configuration.save
            flash[:notice] << "<p>The configuration you were editing has been saved.</p>"
          else
            flash[:notice] << "<p>Could not save the configuration you were editing. If you want to save it, please click 'edit' and fix the problems.</p><ul>"
            @tag_configuration.errors.each_full {|m|flash[:notice] << "<li>#{m}</li>"}
            flash[:notice] << "</ul>"
            redirect_to show_new_tag_configuration_url
            return
          end
        end
        
        redirect_back_or_default account_url
      else
        flash[:notice] = "That email address or password was not recognized"
      end
    end
  end
  
  # GET /logout  - clear authenticated session
  def logout
    if current_user_session
      current_user_session.destroy
      flash[:notice] = "You have been safely logged out"
    end
    session[:return_to] = params[:return_to]
    redirect_back_or_default login_url
  end
end