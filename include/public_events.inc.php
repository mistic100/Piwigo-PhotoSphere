<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

function photosphere_element_content($content, $element)
{
  global $template, $conf;
  
  if ($element['is_sphere'])
  {
    load_language('plugin.lang', PHOTOSPHERE_PATH);

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
      'SPHERE_DERIVATIVE' => DerivativeImage::url($derivative_params, $element['src_image']),
      'PHOTOSPHERE_PATH' => PHOTOSPHERE_PATH,
      'PHOTOSPHERE_VERSION' => PHOTOSPHERE_VERSION,
      'PHOTOSPHERE_THREE_VERSION' => PHOTOSPHERE_THREE_VERSION,
      ));

    return $template->parse('sphere_content', true);
  }
  
  return $content;
}

function photosphere_thumbnails_list($pictures)
{
  global $template, $conf, $user;
  
  if ($conf['PhotoSphere']['display_icon'])
  {
    if ($user['theme'] == 'modus')
    {
      $status = [];
      foreach ($pictures as $picture) {
        $status[] = $picture['is_sphere'];
      }
      $template->assign('PHOTOSPHERE_STATUS', $status);
    }

    $template->assign('PHOTOSPHERE_PATH', PHOTOSPHERE_PATH);
    
    $template->set_prefilter('index_thumbnails', 'photosphere_index_thumbnails_prefilter', 100);
  }
}

function photosphere_index_thumbnails_prefilter($content)
{
  global $user;

  if (defined('MASONRY') || defined('MASONRY_PATH')) // Mansonry Grid plugin
  {
    $search = '#(<div class="masonry-thumb".*>)#';
  }
  else if (defined('GDTHUMB_PATH')) // gdThumb plugin
  {
    $search = '#(<li class="gdthumb.*>)#';
  }
  else if (defined('GTHUMB_PATH')) // GThumb+ plugin
  {
    $search = '#(<li class="gthumb">)#';
  }
  else // core
  {
    $search = '#(<li>)#';

    // hack for modus custom Smarty plugin
    // the icon is added in Javascript because there is no way to alter the output of the plugin
    if ($user['theme'] == 'modus') {
      $content = str_replace(
        '{modus_thumbs}',
        '{modus_thumbs}
<script type="module">
  const PHOTOSPHERE_STATUS = {$PHOTOSPHERE_STATUS|json_encode};
  const PHOTOSPHERE_PATH = "{$ROOT_URL}{$PHOTOSPHERE_PATH}";
  document.querySelectorAll("#thumbnails li").forEach((li, i) => {
      if (PHOTOSPHERE_STATUS[i] === "1") {
          const img = document.createElement("img");
          img.src = PHOTOSPHERE_PATH + "template/icon_sm.png";
          img.className = "photosphere-icon";
          li.appendChild(img);
      }
  });
</script>',
        $content
      );
    }
  }

  return preg_replace(
    $search,
    '$1
{if $thumbnail.is_sphere}<img src="{$ROOT_URL}{$PHOTOSPHERE_PATH}template/icon_sm.png" class="photosphere-icon">{/if}',
    $content
  ) . '
{html_style}
#thumbnails li {
  position: relative;
  display: inline-block;
}
.photosphere-icon {
  width: 48px !important;
  height: 48px !important;
  position: absolute;
  margin: -24px 0 0 -24px;
  top: 50%;
  left: 50%;
  z-index: 100;
  pointer-events: none;
}
{/html_style}';
}

function photosphere_admintools()
{
  global $picture, $template;
  
  if (defined('ADMINTOOLS_PATH'))
  {
    if (script_basename() == 'picture' and isset($picture['current']))
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
