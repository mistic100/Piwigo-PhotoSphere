<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

check_status(ACCESS_ADMINISTRATOR);

check_input_parameter('image_id', $_GET, false, PATTERN_ID);
$image_id = $_GET['image_id'];

$admin_photo_base_url = get_root_url() . 'admin.php?page=photo-' . $image_id;
$self_url = get_root_url() . 'admin.php?page=plugin-PhotoSphere-photo&amp;image_id=' . $image_id;

global $template, $page, $conf, $lang, $user;

// transfer translations to js component
$lang['photosphere_tour']['lang_code'] = $user['language'];
$lang['photosphere_tour']['Linked photos'] = $lang['Linked photos'];
$lang['photosphere_tour']['Help Me'] = $lang['Help Me'];
$lang['photosphere_tour']['Photo title'] = $lang['Photo title'];
$lang['photosphere_tour']['Settings'] = $lang['Settings'];
$lang['photosphere_tour']['Display'] = $lang['Display'];
$lang['photosphere_tour']['Save'] = $lang['Save'];
$lang['photosphere_tour']['Yes'] = $lang['Yes'];
$lang['photosphere_tour']['No'] = $lang['No'];
$lang['photosphere_tour']['Edit'] = $lang['Edit'];
$lang['photosphere_tour']['Delete'] = $lang['Delete'];
$lang['photosphere_tour']['Close'] = $lang['Close'];
$lang['photosphere_tour']['Cancel'] = $lang['Cancel'];
$lang['photosphere_tour']['Edit photo'] = $lang['Edit photo'];
$lang['photosphere_tour']['Parent album'] = $lang['Parent album'];
$lang['photosphere_tour']['You have unsaved changes'] = $lang['You have unsaved changes'];
$lang['photosphere_tour']['Changes saved'] = $lang['Changes saved'];

// Tabs
include_once(PHPWG_ROOT_PATH . 'admin/include/tabsheet.class.php');
$tabsheet = new tabsheet();
$tabsheet->set_id('photo');
$tabsheet->select('photosphere');
$tabsheet->assign();

// Data
$query = '
SELECT *
FROM ' . IMAGES_TABLE . ' AS i
WHERE id = ' . $image_id . '
;';
$picture = pwg_db_fetch_assoc(pwg_query($query));

if (!$picture['is_sphere']) {
    $page['warnings'][] = l10n('photosphere_enabled_error');
} else {
    $query = '
SELECT id, name
FROM ' . IMAGE_CATEGORY_TABLE . '
INNER JOIN ' . CATEGORIES_TABLE . ' ON category_id = id
WHERE image_id = ' . $image_id . '
;';
    $categories = query2array($query);

    $picture['image_url'] = DerivativeImage::url(
        ImageStdParams::get_custom($conf['PhotoSphere']['raw_width'], $conf['PhotoSphere']['raw_width'] / 2),
        $picture
    );
    $picture['square_url'] = DerivativeImage::url(IMG_SQUARE, $picture);
}

// Render
$template->assign(array(
    'PWG_TOKEN' => get_pwg_token(),
    'PHOTOSPHERE_PATH' => PHOTOSPHERE_PATH,
    'VERSION_PHOTOSPHERE_LIB' => VERSION_PHOTOSPHERE_LIB,
    'VERSION_THREEJS_LIB' => VERSION_THREEJS_LIB,
    'PHOTOSPHERE_TOUR_LANG' => $lang['photosphere_tour'],
    'PHOTOSPHERE_CONFIG' => $conf['PhotoSphere'],
    'TITLE' => render_element_name($picture),
    'categories' => @$categories,
    'picture' => array(
        'id' => (int) $picture['id'],
        'name' => $picture['name'],
        'is_sphere' => $picture['is_sphere'],
        'image_url' => @$picture['image_url'],
        'square_url' => @$picture['square_url'],
        'photosphere_config' => safe_json_decode($picture['photosphere_config']),
    ),
));

$template->set_filename('photosphere_admin_photo', realpath(PHOTOSPHERE_PATH . 'admin/template/photo.tpl'));
$template->assign_var_from_handle('ADMIN_CONTENT', 'photosphere_admin_photo');
