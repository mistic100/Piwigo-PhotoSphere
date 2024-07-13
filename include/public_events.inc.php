<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

function photosphere_element_content($content, $element)
{
  global $template, $conf;
  
  if ($element['is_sphere'])
  {
    $template->set_filename('sphere_content', realpath(PHOTOSPHERE_PATH . 'template/picture_content.tpl'));
    
    if ($element['coi'])
    {
      $coi = $element['coi'];
      $template->assign(array(
        'SPHERE_LONG' => (char_to_fraction($coi[0]) + char_to_fraction($coi[2])) / 2,
        'SPHERE_LAT' => (1 - char_to_fraction($coi[1]) - char_to_fraction($coi[3])) / 2,
        ));
    }
    else {
      $template->assign(array(
        'SPHERE_LONG' => 0.5,
        'SPHERE_LAT' => 0,
        ));
    }
    
    $derivative_params = ImageStdParams::get_custom($conf['PhotoSphere']['raw_width'], $conf['PhotoSphere']['raw_width']/2);
    
    $template->assign(array(
      'PhotoSphere' => $conf['PhotoSphere'],
      'SPHERE_DERIVATIVE' => new DerivativeImage($derivative_params, $element['src_image']),
      'PHOTOSPHERE_PATH' => PHOTOSPHERE_PATH,
      ));

    return $template->parse('sphere_content', true);
  }
  
  return $content;
}

function photosphere_thumbnails_list($pictures)
{
  global $template, $conf;
  
  if ($conf['PhotoSphere']['display_icon'])
  {
    $template->assign('PHOTOSPHERE_PATH', PHOTOSPHERE_PATH);
    
    $template->set_prefilter('index_thumbnails', 'loc_begin_index_thumbnails_prefilter');
  }
}

function loc_begin_index_thumbnails_prefilter($content)
{
  $search = '#(<li>|<li class="gthumb">)#';
  $replace = '$1{strip}
{if $thumbnail.is_sphere}<a href="{$thumbnail.URL}"><img src="{$ROOT_URL}{$PHOTOSPHERE_PATH}template/icon_sm.png" class="photosphere-icon"></a>{/if}
{/strip}';

  $content.= '
{html_style}
#thumbnails li {
  position:relative !important;
  display:inline-block;
}
.photosphere-icon {
  width:32px;
  height:32px;
  position:absolute;
  margin:-16px 0 0 -16px;
  top:50%;
  left:50%;
  z-index:100 !important;
}
{/html_style}';

  return preg_replace($search, $replace, $content);
}

function photosphere_admintools()
{
  global $picture, $template;
  
  if (defined('ADMINTOOLS_PATH'))
  {
    if (script_basename() == 'picture')
    {
      $template->assign('ato_QUICK_EDIT_is_sphere', $picture['current']['is_sphere']);
    }
    
    $template->set_prefilter('ato_public_controller', 'photosphere_admintools_prefilter');
  }
}

function photosphere_save_admintools()
{
  global $page, $MultiView, $user;
  
  if (defined('ADMINTOOLS_PATH'))
  {
    if (!isset($_POST['action']) || @$_POST['action'] != 'quick_edit')
    {
      return;
    }
    
    $query = 'SELECT added_by FROM '. IMAGES_TABLE .' WHERE id = '. $page['image_id'] .';';
    list($added_by) = pwg_db_fetch_row(pwg_query($query));

    if (!$MultiView->is_admin() and $user['id'] != $added_by)
    {
      return;
    }
  
    single_update(
      IMAGES_TABLE,
      array('is_sphere' => intval(isset($_POST['is_sphere']))),
      array('id' => $page['image_id'])
      );
  }
}

function photosphere_admintools_prefilter($content)
{
  $search = '<label for="quick_edit_tags">';
  $add = '<label><input type="checkbox" style="width:auto;" name="is_sphere" {if $ato_QUICK_EDIT_is_sphere}checked{/if}> Photo Sphere</label>';
  
  return str_replace($search, $add.$search, $content);
}
