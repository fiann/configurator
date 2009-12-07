ActionController::Routing::Routes.draw do |map|

  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action
  
  # The tag configurator
  map.show_new_tag_configuration '/tag_configurations/show/new', :controller => 'tag_configurations', 
    :action => 'show', :id => 'new' 
  map.edit_new_tag_configuration '/tag_configurations/edit/new', :controller => 'tag_configurations', 
    :action => 'edit', :id => 'new' 
  map.find_tag_configuration_by_sha1 '/tag_configurations/find_by_sha1/:sha1.js',
    :controller => 'tag_configuration_revisions', :action => 'find_by_sha1'
  map.generate_debug_tag_configuration '/tag_configurations/:id/generate_debug',
    :controller => 'tag_configurations', :action => 'generate_debug'
  map.generate_production_tag_configuration '/tag_configurations/:id/generate_production',
    :controller => 'tag_configurations', :action => 'generate_production'
  map.resources :tag_configurations do |tag_config|
    tag_config.resources :revisions, :controller => :tag_configuration_revisions, 
      :only => [:index, :show]
    tag_config.show_revision_debug 'revisions/:revision_number/debug.js',
      :controller => 'tag_configuration_revisions', :action => 'show_debug'
    tag_config.show_revision_production 'revisions/:revision_number/production.js',
      :controller => 'tag_configuration_revisions', :action => 'show_production'
  end

  # User controls
  map.login    '/login',    :controller => 'user_sessions', :action => 'login'
  map.logout   '/logout',   :controller => 'user_sessions', :action => 'logout'
  map.register '/register', :controller => 'users', :action => 'register'
  map.resource :account, :controller => "users", :only => [:show, :edit, :update]

  # Homepage
  map.root :controller => 'tag_configurations', :action => 'index'

  # Sample of named route:
  #   map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   map.resources :products

  # Sample resource route with options:
  #   map.resources :products, :member => { :short => :get, :toggle => :post }, :collection => { :sold => :get }

  # Sample resource route with sub-resources:
  #   map.resources :products, :has_many => [ :comments, :sales ], :has_one => :seller
  
  # Sample resource route with more complex sub-resources
  #   map.resources :products do |products|
  #     products.resources :comments
  #     products.resources :sales, :collection => { :recent => :get }
  #   end

  # Sample resource route within a namespace:
  #   map.namespace :admin do |admin|
  #     # Directs /admin/products/* to Admin::ProductsController (app/controllers/admin/products_controller.rb)
  #     admin.resources :products
  #   end

  # You can have the root of your site routed with map.root -- just remember to delete public/index.html.
  # map.root :controller => "store"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  # Note: These default routes make all actions in every controller accessible via GET requests. You should
  # consider removing the them or commenting them out if you're using named routes and resources.
  # map.connect ':controller/:action/:id'
  # map.connect ':controller/:action/:id.:format'
end
