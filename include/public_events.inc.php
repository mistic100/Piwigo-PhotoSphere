<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

function photosphere_element_content($content, $element)
{
  global $template;
  
  if ($element['is_sphere'])
  {
    $template->set_filename('sphere_content', realpath(PHOTOSPHERE_PATH . 'template/picture_content.tpl'));
    
    $template->assign(array(
      'PHOTOSPHERE_PATH' => PHOTOSPHERE_PATH
      ));

    return $template->parse('sphere_content', true);
  }
  
  return $content;
}

function photosphere_admintools()
{
  global $picture, $template;
  
  if (defined('ADMINTOOLS_PATH') && script_basename() == 'picture')
  {
    $template->assign('ato_QUICK_EDIT_is_sphere', $picture['current']['is_sphere']);
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
      array('is_sphere' => isset($_POST['is_sphere'])),
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