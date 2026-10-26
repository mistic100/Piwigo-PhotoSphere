<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

function photosphere_loc_end_picture_modify()
{
  global $template;

  if (isset($_POST['submit'])) {
    $row['is_sphere'] = intval(isset($_POST['is_sphere']));

    single_update(
      IMAGES_TABLE,
      array('is_sphere' => $row['is_sphere']),
      array('id' => $_GET['image_id'])
    );
  } else {
    $query = '
SELECT is_sphere
  FROM ' . IMAGES_TABLE . '
  WHERE id = ' . $_GET['image_id'] . '
;';
    $row = pwg_db_fetch_assoc(pwg_query($query));
  }

  $template->assign('IS_SPHERE', $row['is_sphere']);
  $template->set_prefilter('picture_modify', 'photosphere_picture_modify_prefilter');
}

function photosphere_picture_modify_prefilter($content)
{
  $search = '<strong>{\'Tags\'|@translate}</strong>';
  $add = '
    <label style="font-weight:bold"><input type="checkbox" name="is_sphere" {if $IS_SPHERE}checked{/if}> Photo Sphere</label>
  </p>
  <p>
';
  return str_replace($search, $add . $search, $content);
}

function photosphere_tabsheet_before_select($sheets, $id)
{
  if ($id == 'photo') {
    $sheets['photosphere'] = array(
      'caption' => 'Photo Sphere',
      'url' => get_root_url() . 'admin.php?page=plugin-PhotoSphere-photo&amp;image_id=' . $_GET['image_id'],
    );
  }

  return $sheets;
}

function photosphere_get_batch_manager_prefilters($prefilters)
{
  $prefilters[] = array(
    'ID' => 'is_sphere',
    'NAME' => 'Photo Spheres',
  );

  return $prefilters;
}

function photosphere_perform_batch_manager_prefilters($filter_sets, $prefilter)
{
  if ($prefilter == 'is_sphere') {
    $query = 'SELECT id FROM ' . IMAGES_TABLE . ' WHERE is_sphere = 1;';
    $filter_sets[] = query2array($query, null, 'id');
  }

  return $filter_sets;
}

function photosphere_loc_end_element_set_global()
{
  global $template;

  load_language('admin.lang', PHOTOSPHERE_PATH, array(
    'force_fallback' => 'en_UK',
  ));

  $template->append('element_set_global_plugins_actions', array(
    'ID' => 'set_photosphere',
    'NAME' => l10n('Set Photo Sphere'),
  ));

  $template->append('element_set_global_plugins_actions', array(
    'ID' => 'unset_photosphere',
    'NAME' => l10n('Unset Photo Sphere'),
  ));
}

function photosphere_element_set_global_action($action, $collection)
{
  global $redirect;

  if (strpos($action, 'photosphere') !== false) {
    $is_sphere = ($action == 'set_photosphere' ? 1 : 0);

    $data = array();
    foreach ($collection as $image_id) {
      $data[] = array(
        'id' => $image_id,
        'is_sphere' => $is_sphere,
      );
    }

    mass_updates(
      IMAGES_TABLE,
      array(
        'primary' => array('id'),
        'update' => array('is_sphere'),
      ),
      $data
    );

    $redirect = true;
  }
}

function photosphere_loc_end_element_set_unit()
{
  global $template;

  // cannot use PHOTOSPHERE_PATH, must be absolute
  $template->append('PLUGINS_BATCH_MANAGER_UNIT_ELEMENT_SUBTEMPLATE', dirname(__FILE__) . '/../admin/template/batch_manager_unit.tpl');
}
