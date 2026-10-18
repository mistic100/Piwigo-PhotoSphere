<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

check_status(ACCESS_ADMINISTRATOR);

global $template, $page, $conf;

// Save
if (isset($_POST['submit'])) {
    $conf['PhotoSphere'] = array(
        'raw_width' => intval($_POST['raw_width']),
        'psv_config' => trim(stripslashes($_POST['psv_config'])),
        'display_help' => isset($_POST['display_help']),
        'auto_anim' => isset($_POST['auto_anim']),
        'display_icon' => isset($_POST['display_icon']),
        'tour' => array(
            'link_mode' => $_POST['tour_link_mode'],
            'link_size' => intval($_POST['tour_link_size']),
        ),
    );

    if (empty($conf['PhotoSphere']['psv_config'])) {
        $conf['PhotoSphere']['psv_config'] = '{}';
    }

    conf_update_param('PhotoSphere', $conf['PhotoSphere']);
    $page['infos'][] = l10n('Information data registered in database');
}

// Render
$template->assign(array(
    'PWG_TOKEN' => get_pwg_token(),
    'PhotoSphere' => $conf['PhotoSphere'],
));

$template->set_filename('photosphere_admin_config', realpath(PHOTOSPHERE_PATH . 'admin/template/config.tpl'));
$template->assign_var_from_handle('ADMIN_CONTENT', 'photosphere_admin_config');
