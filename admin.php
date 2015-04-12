<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

global $template, $page, $conf;

if (isset($_POST['save_config']))
{
  $conf['PhotoSphere'] = array(
    'raw_width' => intval($_POST['raw_width']),
    'display_help' => isset($_POST['display_help']),
    'auto_anim' => isset($_POST['auto_anim']),
    'display_icon' => isset($_POST['display_icon']),
    );

  conf_update_param('PhotoSphere', $conf['PhotoSphere']);
  $page['infos'][] = l10n('Information data registered in database');
}

$template->assign(array(
  'PHOTOSPHERE_PATH' => PHOTOSPHERE_PATH,
  'PhotoSphere' => $conf['PhotoSphere'],
  ));

$template->set_filename('photosphere_config', realpath(PHOTOSPHERE_PATH . 'template/admin.tpl'));

$template->assign_var_from_handle('ADMIN_CONTENT', 'photosphere_config');
