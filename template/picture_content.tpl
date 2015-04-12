{combine_script id='three' path=$PHOTOSPHERE_PATH|cat:'template/three.min.js' load='async'}
{combine_script id='photo-sphere-viewer' path=$PHOTOSPHERE_PATH|cat:'template/photo-sphere-viewer.min.js' load='async' require='three'}
{combine_script id='pwgPSV' path=$PHOTOSPHERE_PATH|cat:'template/script-photo.js' load='async' require='photo-sphere-viewer'}

{combine_css id='photo-sphere-viewer' path=$PHOTOSPHERE_PATH|cat:'template/photo-sphere-viewer.min.css'}


<div id="photoSphere" data-src="{$SPHERE_DERIVATIVE->get_url()}" data-lat="{$SPHERE_LAT}" data-long="{$SPHERE_LONG}"></div>


{footer_script}
var PHOTOSPHERE = {
  PATH: '{$ROOT_URL}{$PHOTOSPHERE_PATH}',
  time_anim: {if $PhotoSphere.auto_anim}2000{else}false{/if},
  caption: {if $PhotoSphere.display_help}'{'Drag and drop to navigate in the photo.'|translate|escape:javascript}'{else}null{/if}
};
{/footer_script}

{html_style}
#photoSphere {
  box-sizing:border-box;
  width:100%;
}

.psv-loader:after {
  content: '{'Loading'|translate|escape:javascript}';
  position:absolute;
  bottom:-1.5em;
  left:0;
  width:100%;
  text-align:center;
  font-size:20px;
  font-weight:bold;
}
{/html_style}