<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

function photosphere_admin_plugin_menu_links($menu)
{
  $menu[] = array(
    'NAME' => 'Photo Sphere',
    'URL' => PHOTOSPHERE_ADMIN,
    );

  return $menu;
}

function photosphere_photo_page()
{
  global $template;
  
  if (isset($_POST['submit']))
  {
    $row['is_sphere'] = isset($_POST['is_sphere']);
    
    single_update(
      IMAGES_TABLE,
      array('is_sphere' => $row['is_sphere']),
      array('id' => $_GET['image_id'])
      );
  }
  else
  {
    $query = '
SELECT is_sphere
  FROM '.IMAGES_TABLE.'
  WHERE id = '.$_GET['image_id'].'
;';
    $row = pwg_db_fetch_assoc(pwg_query($query));
  }
  
  $template->assign('IS_SPHERE', $row['is_sphere']);
  $template->set_prefilter('picture_modify', 'photosphere_photo_page_prefilter');
}

function photosphere_photo_page_prefilter($content)
{
  $search = '<strong>{\'Linked albums\'|@translate}</strong>';
  $add = '
    <label style="font-weight:bold"><input type="checkbox" name="is_sphere" {if $IS_SPHERE}checked{/if}> Photo Sphere</label>
  </p>
  <p>';
  
  return str_replace($search, $add.$search, $content);
}

function photosphere_add_prefilter($prefilters)
{
  $prefilters[] = array(
    'ID' => 'is_sphere',
    'NAME' => 'Photo Spheres',
    );
  
  return $prefilters;
}

function photosphere_apply_prefilter($filter_sets, $prefilter)
{
  if ($prefilter == 'is_sphere')
  {
    $query = 'SELECT id FROM '.IMAGES_TABLE.' where is_sphere = 1;';
    $filter_sets[] = query2array($query, null, 'id');
  }
  
  return $filter_sets;
}

function photosphere_loc_end_element_set_global()
{
  global $template;

  $template->append('element_set_global_plugins_actions', array(
    'ID' => 'set_photosphere',
    'NAME' => l10n('Set Photo Sphere')
    ));
  
  $template->append('element_set_global_plugins_actions', array(
    'ID' => 'unset_photosphere',
    'NAME' => l10n('Unset Photo Sphere')
    ));
}

function photosphere_element_set_global_action($action, $collection)
{
  global $redirect;

  if (strpos($action, 'photosphere') !== false)
  {
    $is = $action == 'set_photosphere';
    
    $datas = array();
    foreach ($collection as $image_id)
    {
      $datas[] = array(
        'id' => $image_id,
        'is_sphere' => $is
        );
    }

    mass_updates(
      IMAGES_TABLE,
      array('primary' => array('id'), 'update' => array('is_sphere')),
      $datas
      );

    $redirect = true;
  }
}
