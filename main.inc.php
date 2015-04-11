<?php
/*
Plugin Name: PhotoSphere
Version: auto
Description: Add a Photo Sphere viewer
Plugin URI: auto
Author: Mistic
Author URI: http://www.strangeplanet.fr
*/

defined('PHPWG_ROOT_PATH') or die('Hacking attempt!');


if (basename(dirname(__FILE__)) != 'PhotoSphere')
{
  add_event_handler('init', 'photosphere_error');
  function photosphere_error()
  {
    global $page;
    $page['errors'][] = 'PhotoSphere folder name is incorrect, uninstall the plugin and rename it to "PhotoSphere"';
  }
  return;
}


global $prefixeTable;

define('PHOTOSPHERE_PATH' , PHPWG_PLUGINS_PATH . '/PhotoSphere/');
define('PHOTOSPHERE_ADMIN', get_root_url() . 'admin.php?page=plugin-PhotoSphere');


if (defined('IN_ADMIN'))
{
  $admin_file = PHOTOSPHERE_PATH . 'include/admin_events.inc.php';

  add_event_handler('loc_end_picture_modify', 'photosphere_photo_page',
    EVENT_HANDLER_PRIORITY_NEUTRAL, $admin_file);

  add_event_handler('get_batch_manager_prefilters', 'photosphere_add_prefilter',
    EVENT_HANDLER_PRIORITY_NEUTRAL, $admin_file);
    
  add_event_handler('perform_batch_manager_prefilters', 'photosphere_apply_prefilter',
    EVENT_HANDLER_PRIORITY_NEUTRAL, $admin_file);
    
  add_event_handler('loc_end_element_set_global', 'photosphere_loc_end_element_set_global',
    EVENT_HANDLER_PRIORITY_NEUTRAL, $admin_file);
    
  add_event_handler('element_set_global_action', 'photosphere_element_set_global_action',
    EVENT_HANDLER_PRIORITY_NEUTRAL, $admin_file);
}
else
{
  $public_file = PHOTOSPHERE_PATH . 'include/public_events.inc.php';

  add_event_handler('render_element_content', 'photosphere_element_content',
    EVENT_HANDLER_PRIORITY_NEUTRAL-10, $public_file);
  
  add_event_handler('loc_after_page_header', 'photosphere_admintools',
    EVENT_HANDLER_PRIORITY_NEUTRAL, $public_file);
  
  add_event_handler('loc_begin_picture', 'photosphere_save_admintools',
    EVENT_HANDLER_PRIORITY_NEUTRAL, $public_file);
  
  add_event_handler('loc_begin_index_thumbnails', 'photosphere_thumbnails_list',
    EVENT_HANDLER_PRIORITY_NEUTRAL, $public_file);
}
