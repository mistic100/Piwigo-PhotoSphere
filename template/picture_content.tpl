{combine_script id='doT' path=$PHOTOSPHERE_PATH|cat:'template/lib/doT.min.js' load='async'}
{combine_script id='uevent' path=$PHOTOSPHERE_PATH|cat:'template/lib/uevent.min.js' load='async'}
{combine_script id='D' path=$PHOTOSPHERE_PATH|cat:'template/lib/D.min.js' load='async'}
{combine_script id='three' path=$PHOTOSPHERE_PATH|cat:'template/lib/three.min.js' load='async'}
{combine_script id='three-canvasrenderer' path=$PHOTOSPHERE_PATH|cat:'template/lib/CanvasRenderer.js' load='async'}
{combine_script id='three-projector' path=$PHOTOSPHERE_PATH|cat:'template/lib/Projector.js' load='async'}
{combine_script id='photo-sphere-viewer' path=$PHOTOSPHERE_PATH|cat:'template/lib/photo-sphere-viewer.js' load='async' require='three'}
{combine_script id='pwgPSV' path=$PHOTOSPHERE_PATH|cat:'template/script-photo.js' load='async' require='photo-sphere-viewer'}

{combine_css id='photo-sphere-viewer' path=$PHOTOSPHERE_PATH|cat:'template/lib/photo-sphere-viewer.css'}


<div id="photoSphere" data-src="{$SPHERE_DERIVATIVE->get_url()}" data-lat="{$SPHERE_LAT}" data-long="{$SPHERE_LONG}"></div>


{footer_script}
var PHOTOSPHERE = {
  PATH: '{$ROOT_URL}{$PHOTOSPHERE_PATH}',
  time_anim: {if $PhotoSphere.auto_anim}2000{else}false{/if},
  caption: {if $PhotoSphere.display_help}'{'Drag and drop to navigate in the photo.'|translate|escape:javascript}'{else}null{/if},
  lang: {
    autorotate: '{'Automatic rotation'|translate|escape:javascript}',
    zoom: '{'Zoom'|translate|escape:javascript}',
    zoomOut: '{'Zoom out'|translate|escape:javascript}',
    zoomIn: '{'Zoom in'|translate|escape:javascript}',
    download: '{'Download'|translate|escape:javascript}',
    fullscreen: '{'Fullscreen'|translate|escape:javascript}'
  }
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
