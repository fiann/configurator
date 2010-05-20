# Enable multistage deploys
set :stages, %w(staging production)
set :default_stage, "staging"
require 'capistrano/ext/multistage'

# name of the application
set :application, "configurator"

# If you aren't deploying to /u/apps/#{application} on the target
# servers (which is the default), you can specify the actual location
# via the :deploy_to variable:
set :deploy_to,   "/var/capistrano/#{application}"

# If you aren't using Subversion to manage your source code, specify
# your SCM below:
set :scm,         "git"

# construct the path to the repository
set :repository,   "git://github.com/fiann/configurator.git"

# Release from a Git tag, not head
# ref: http://nathanhoad.net/deploy-from-a-git-tag-with-capistrano
set :branch do
  default_tag = `git tag`.split("\n").last

  tag = Capistrano::CLI.ui.ask "Tag to deploy, or 'master' for head revision (make sure to push the tag first): [#{default_tag}] "
  tag = default_tag if tag.empty?
  tag
end

#By default, Capistrano will try to use sudo to do certain operations (setting 
#up your servers, restarting your application, etc.). If you are on a shared 
#host, sudo might be unavailable to you, or maybe you just want to avoid using sudo.
set :use_sudo,    false

# Liam: overide the default task as we are using Passenger
# ref: http://www.modrails.com/documentation/Users%20guide.html#capistrano
namespace :deploy do
  desc "Restart Application"
  task :restart, :roles => :app do
    run "touch #{current_path}/tmp/restart.txt"
  end
end

# additional custom tasks viewable with 'cap -T'
namespace :custom do
  desc 'Symlink the public directory into the web root. This is for use by Passenger via RailsBaseURI
        ref: http://www.modrails.com/documentation/Users%20guide.html#deploying_rails_to_sub_uri'
  task :symlink do
    run "ln -nfs #{current_path}/public #{webroot}"
  end

  desc 'Output the Git tag or revision'
  task :version do
    run "echo \"#{branch}\" > #{current_path}/app/views/shared/_version.html.erb"
  end  
end
# use our custom tasks at the appropriate time
# e.g. before :deploy, :my_custom_task
#      after  "deploy:symlink", :do_this, :and_do_that
after "deploy:update",   "deploy:migrate", "custom:version"
after "deploy:setup",   "custom:symlink"
