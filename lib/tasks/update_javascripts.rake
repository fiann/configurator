desc "Update to latest version of jsHub source files"
namespace :javascripts do
  task :update do
    src = "../jshub-core/app/javascripts"
    dest = "app/javascripts/"
    raise "Can't find #{src}" unless File.exists? src 
    FileUtils.rm_rf(dest, :verbose => true)
    FileUtils.cp_r(src, dest, :verbose => true)
    puts "Updated to latest version of JS files"
  end
end