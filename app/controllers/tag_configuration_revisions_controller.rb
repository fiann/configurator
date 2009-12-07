class TagConfigurationRevisionsController < ApplicationController
include ActionView::Helpers::DateHelper

  # GET /tag_configurations/1/revisions
  def index
    @tag_configuration = TagConfiguration.find(params[:tag_configuration_id])
    @revisions = @tag_configuration.revisions.reverse
    render :layout => 'tag_configurations'
  end
  
  # GET /tag_configurations/1/revisions/2/debug.js
  def show_debug
    response.headers['Content-Disposition'] = 'attachment; filename=jshub.js'
    rev = TagConfigurationRevision.find_by_tag_configuration_id_and_revision_number(
      params[:tag_configuration_id], params[:revision_number])
    render :content_type => 'text/javascript', :layout => false, :text => rev.generated_code
  end
  
  # GET /tag_configurations/1/revisions/2/production.js
  def show_production
    response.headers['Content-Disposition'] = 'attachment; filename=jshub.js'
    rev = TagConfigurationRevision.find_by_tag_configuration_id_and_revision_number(
      params[:tag_configuration_id], params[:revision_number])
    render :content_type => 'text/javascript', :layout => false, :text => "// Not yet available"
  end
  
  # GET /tag_configurations/find_by_sha1/8345...abc.js
  def find_by_sha1
    revision = TagConfigurationRevision.find_by_sha1(params[:sha1])
    @data = {
      :info => {},
      :errors => [],
      :warnings => {}
    }
    if revision.nil?
      @data[:info][:status] = "not found"
      @data[:errors] << "hash code not found"
    else
      if revision.last?
        @data[:info][:status] = "up to date"
      else 
        @data[:info][:status] = "out of date"
        @data[:warnings][:pending_revisions] = revision.pending_revisions
      end
      if revision.sha1_debug == params[:sha1]
        @data[:warnings][:tag_type] = "debug"
      end
      @data[:info][:updated] = time_ago_in_words(revision.updated_at)
      @data[:info][:timestamp] = revision.updated_at
      @data[:info][:version] = revision.revision_number
      @data[:info][:url] = url_for(revision.tag_configuration)
      @data[:info][:name] = revision.tag_configuration.name
      @data[:info][:site] = revision.tag_configuration.comments
    end
    text = @data.to_json
    if params[:callback]
      text = "#{params[:callback]}(#{text})"
    end
    render :content_type => 'text/javascript', :layout => false, :text => text
  end

end
