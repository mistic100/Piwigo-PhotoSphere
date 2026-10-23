<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

check_status(ACCESS_ADMINISTRATOR);

check_input_parameter('image_id', $_GET, false, PATTERN_ID);
$image_id = $_GET['image_id'];

$admin_photo_base_url = get_root_url() . 'admin.php?page=photo-' . $image_id;
$self_url = get_root_url() . 'admin.php?page=plugin-PhotoSphere-photo&amp;image_id=' . $image_id;

global $template, $page, $conf, $lang;

// transfer translations to js component
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
    $page['warnings'][] = l10n('This photo is not a Photo Sphere, please  enabled it in the main properties tab.');
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
    $picture['square_url'] = DerivativeImage::url('square', $picture);
}

// Render
$template->assign(array(
    'PWG_TOKEN' => get_pwg_token(),
    'PHOTOSPHERE_PATH' => PHOTOSPHERE_PATH,
    'PHOTOSPHERE_VERSION' => PHOTOSPHERE_VERSION,
    'PHOTOSPHERE_THREE_VERSION' => PHOTOSPHERE_THREE_VERSION,
    'PHOTOSPHERE_TOUR_LANG' => $lang['photosphere_tour'],
    'PHOTOSPHERE_CONFIG' => $conf['PhotoSphere'],
    'TITLE' => render_element_name($picture),
    'categories' => @$categories,
    'picture' => array(
        'id' => $picture['id'],
        'name' => $picture['name'],
        'is_sphere' => $picture['is_sphere'],
        'image_url' => @$picture['image_url'],
        'square_url' => @$picture['square_url'],
        'photosphere_config' => safe_json_decode($picture['photosphere_config']),
    ),
));

$template->set_filename('photosphere_admin_photo', realpath(PHOTOSPHERE_PATH . 'admin/template/photo.tpl'));
$template->assign_var_from_handle('ADMIN_CONTENT', 'photosphere_admin_photo');
