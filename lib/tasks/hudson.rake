# This is in a rake file so that the configuration for Hudson is under version control.
namespace "hudson" do
  
  desc "Run the continuous build tasks"
  task :build => [
    "gems:install", 
    "db:schema:load", 
    "jshub:lint", 
    "ci:setup:testunit", 
    "db:test:prepare"] do
      
    # It looks like it should be possible to inline this in the dependencies but it doesn't
    # work due to a problem in rake where 'rake db:test:prepare' does not operate the same
    # as 'rake db:test:prepare; rake test'. See #582.
    sh 'rake test'
  end
end