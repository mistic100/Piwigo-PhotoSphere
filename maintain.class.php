<?php
defined('PHPWG_ROOT_PATH') or die('Hacking attempt!');

class PhotoSphere_maintain extends PluginMaintain
{
  private $default_conf = array(
    'raw_width' => 8192,
    'psv_config' => '{}',
    'display_help' => true,
    'auto_anim' => true,
    'display_icon' => true,
    'tour' => array(
      'link_mode' => 'thumbnail',
      'link_size' => 100,
    ),
  );

  private $table;

  function __construct($plugin_id)
  {
    global $prefixeTable;

    parent::__construct($plugin_id);
    $this->table = $prefixeTable . 'photosphere_links';
  }

  function install($plugin_version, &$errors = array())
  {
    global $conf;

    if (empty($conf['PhotoSphere'])) {
      conf_update_param('PhotoSphere', $this->default_conf, true);
    } else {
      $conf['PhotoSphere'] = safe_unserialize($conf['PhotoSphere']);
      $update = false;
      if (!array_key_exists('psv_config', $conf['PhotoSphere'])) {
        $conf['PhotoSphere']['psv_config'] = $this->default_conf['psv_config'];
        $update = true;
      }
      if (!array_key_exists('tour', $conf['PhotoSphere'])) {
        $conf['PhotoSphere']['tour'] = $this->default_conf['tour'];
        $update = true;
      }
      if ($update) {
        conf_update_param('PhotoSphere', $conf['PhotoSphere']);
      }
    }

    $result = pwg_query('SHOW COLUMNS FROM `' . IMAGES_TABLE . '` LIKE "is_sphere";');
    if (!pwg_db_num_rows($result)) {
      pwg_query('ALTER TABLE `' . IMAGES_TABLE . '` ADD `is_sphere` TINYINT(1) NOT NULL DEFAULT 0;');
    }

    $result = pwg_query('SHOW COLUMNS FROM `' . IMAGES_TABLE . '` LIKE "photosphere_config";');
    if (!pwg_db_num_rows($result)) {
      pwg_query('ALTER TABLE `' . IMAGES_TABLE . '` ADD `photosphere_config` JSON DEFAULT NULL;');
    }

    pwg_query('
CREATE TABLE IF NOT EXISTS `' . $this->table . '` (
  `src_id` mediumint(5) unsigned NOT NULL,
  `dst_id` mediumint(5) unsigned NOT NULL,
  `yaw` double(5, 4) NOT NULL,
  `pitch` double(5, 4) NOT NULL,
  `title` text default NULL,
  PRIMARY KEY  (`src_id`,`dst_id`),
  KEY `src_id` (`src_id`)
) ENGINE=MyISAM;
    ');
  }

  function update($old_version, $new_version, &$errors = array())
  {
    $this->install($new_version, $errors);
  }

  function uninstall()
  {
    conf_delete_param('PhotoSphere');

    pwg_query('ALTER TABLE `' . IMAGES_TABLE . '` DROP `is_sphere`;');
    pwg_query('ALTER TABLE `' . IMAGES_TABLE . '` DROP `photosphere_config`;');

    pwg_query('DROP TABLE `' . $this->table . '`;');
  }
}
