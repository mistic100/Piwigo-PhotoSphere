<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

load_language('plugin.lang', PHOTOSPHERE_PATH);

load_language('admin.lang', PHOTOSPHERE_PATH, array(
  'force_fallback' => 'en_UK'
));

if (isset($_GET['tab']) &&  $_GET['tab'] ==  'photo') {
  include(PHOTOSPHERE_PATH . 'admin/photo.php');
} else {
  include(PHOTOSPHERE_PATH . 'admin/config.php');
}
