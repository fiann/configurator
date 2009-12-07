require "digest"
require 'digest/sha1' 

class TagConfigurationsController < ApplicationController
  
  before_filter :find_tag_configuration, :only => [:generate_debug, :generate_production]
  
  # GET /tag_configurations
  # GET /tag_configurations.xml
  def index
    respond_to do |format|
      format.html do 
        if current_user_session
          render :layout => 'tag_configurations_home', 
            :template => 'tag_configurations/index_authenticated'
        else
          render :layout => 'tag_configurations_home', 
            :template => 'tag_configurations/index_anonymous'
        end
      end        
      format.xml  { render :xml => saved_configurations }
    end
  end

  # GET /tag_configurations/1
  # GET /tag_configurations/1.xml
  def show
    @col2 = "download_buttons"

    if params[:id] == 'new'
      if session[:tag_configuration]
        @tag_configuration = session[:tag_configuration]
      else
        logger.debug "Requested /show/new but no config in session"
        redirect_to :action => 'new'
        return
      end
    else
      @tag_configuration = TagConfiguration.find(params[:id])
    end

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @tag_configuration }
    end
  end

  # GET /tag_configurations/new
  # GET /tag_configurations/new.xml
  def new
    @tag_configuration = TagConfiguration.new
    @tag_configuration.add_default_plugins!
    @col2 = "form_tips"

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @tag_configuration }
    end
  end

  # GET /tag_configurations/1/edit
  # GET /tag_configurations/new/edit
  def edit
    @col2 = "form_tips"
    if params[:id] == 'new'
      if session[:tag_configuration]
        @tag_configuration = session[:tag_configuration]
        @tag_configuration.reset_errors_for_anonymous_session
      else
        logger.debug "Requested /show/edit but no config in session"
        redirect_to :action => 'new'
        return
      end
    else
      @tag_configuration = TagConfiguration.find(params[:id])
    end
  end

  # POST /tag_configurations
  # POST /tag_configurations.xml
  def create
    params[:tag_configuration][:plugin_ids] ||= []
    @tag_configuration = TagConfiguration.new(params[:tag_configuration])
    @col2 = "form_tips"

    respond_to do |format|
      if current_user_session
        # if the user is logged in, then save the config to the database
        @tag_configuration.user = current_user
        if @tag_configuration.save
          @tag_configuration.reload
          render_and_save_tag
          flash[:notice] = 'Tag configuration was successfully created.'
          format.html { redirect_to(@tag_configuration) }
          format.xml  { render :xml => @tag_configuration, :status => :created, :location => @tag_configuration }
        else
          format.html { render :action => "new" }
          format.xml  { render :xml => @tag_configuration.errors, :status => :unprocessable_entity }
        end
      else
        # if the session is anonymous, keep the config in the session
        if @tag_configuration.valid_for_anonymous_session?
          flash[:notice] = "Tag configuration is valid. Don't forget to log in to save your configuration."
          session[:tag_configuration] = @tag_configuration
          format.html { redirect_to(:show_new_tag_configuration) }
          format.xml  { render :xml => @tag_configuration, :status => :created, :location => :show_new_tag_configuration }
        else
          format.html { render :action => "new" }
          format.xml  { render :xml => @tag_configuration.errors_for_anonymous_session, :status => :unprocessable_entity }
        end
      end
    end
  end

  # PUT /tag_configurations/1
  # PUT /tag_configurations/1.xml
  def update
    @tag_configuration = TagConfiguration.find(params[:id])
    @col2 = "form_tips"

    respond_to do |format|
      if current_user_session
        # if the user is logged in, then save the config to the database
        @tag_configuration.user = current_user
        if @tag_configuration.update_attributes(params[:tag_configuration])
          render_and_save_tag
          flash[:notice] = 'Tag configuration was successfully updated.'
          flash[:tag_params] = params
          format.html { redirect_to(@tag_configuration) }
          format.xml  { head :ok }
        else
          format.html { render :action => "edit" }
          format.xml  { render :xml => @tag_configuration.errors, :status => :unprocessable_entity }
        end
      else
        # if the session is anonymous, keep the config in the session
        if @tag_configuration.valid_for_anonymous_session?
          flash[:notice] = "Tag configuration is valid. Don't forget to log in to save your configuration."
          session[:tag_configuration] = @tag_configuration
          format.html { redirect_to(:show_new_tag_configuration) }
          format.xml  { render :xml => @tag_configuration, :status => :updated, :location => :show_new_tag_configuration }
        else
          format.html { render :action => "new" }
          format.xml  { render :xml => @tag_configuration.errors_for_anonymous_session, :status => :unprocessable_entity }
        end
      end
    end
  end

  # DELETE /tag_configurations/1
  # DELETE /tag_configurations/1.xml
  def destroy
    @tag_configuration = TagConfiguration.find(params[:id])
    @tag_configuration.destroy

    respond_to do |format|
      format.html { redirect_to(tag_configurations_url) }
      format.xml  { head :ok }
    end
  end
  
  # GET /tag_configurations/1/generate_debug
  def generate_debug
    response.headers['Content-Disposition'] = 'attachment; filename=jshub.js'
    render :content_type => 'text/javascript', :layout => false,
      :template => 'tag_configurations/generate_debug.js.erb'
  end

  # GET /tag_configurations/1/generate_production
  def generate_production
    render :content_type => 'text/javascript', :layout => false
  end
  
  private
  
  def find_tag_configuration
    if params[:id] == 'new'
      @tag_configuration = session[:tag_configuration]
      @tag_configuration.reset_errors_for_anonymous_session
    else
      @tag_configuration = TagConfiguration.find(params[:id])
    end    
  end
  
  def render_and_save_tag
    revision = @tag_configuration.revisions.last
    logger.debug "Configuration plugins: #{@tag_configuration.plugins.inspect}"
    debug_code = render_to_string :template => 'tag_configurations/generate_debug.js.erb', :layout => false
    revision.generated_code = debug_code
    revision.sha1_debug = Digest::SHA1.hexdigest(debug_code)
    production_code = render_to_string :template => 'tag_configurations/generate_production.html.erb', :layout => false
    revision.sha1_production = Digest::SHA1.hexdigest(production_code)
    logger.debug "Saving revision hashes: #{revision.inspect}"
    revision.save!
  end

end
