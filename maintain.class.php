<?php
defined('PHPWG_ROOT_PATH') or die('Hacking attempt!');

class PhotoSphere_maintain extends PluginMaintain
{
  private $default_conf = array(
    'raw_width' => 6144,
    'display_help' => true,
    'auto_anim' => true,
    'display_icon' => true,
    );
    
  function install($plugin_version, &$errors=array())
  {
    global $conf;
    
    if (empty($conf['PhotoSphere']))
    {
      conf_update_param('PhotoSphere', $this->default_conf, true);
    }
    
    $result = pwg_query('SHOW COLUMNS FROM `'.IMAGES_TABLE.'` LIKE "is_sphere";');
    if (!pwg_db_num_rows($result))
    {
      pwg_query('ALTER TABLE `' . IMAGES_TABLE . '` ADD `is_sphere` TINYINT(1) NOT NULL DEFAULT 0;');
    }
  }

  function update($old_version, $new_version, &$errors=array())
  {
    $this->install($new_version, $errors);
  }

  function uninstall()
  {
    conf_delete_param('PhotoSphere');
    
    pwg_query('ALTER TABLE `'. IMAGES_TABLE .'` DROP `is_sphere`;');
  }
}