{combine_script id='three' path=$PHOTOSPHERE_PATH|cat:'template/three.min.js' load='footer'}
{combine_script id='photo-sphere-viewer' path=$PHOTOSPHERE_PATH|cat:'template/photo-sphere-viewer.min.js' load='footer' require='three'}
{combine_css id='photo-sphere-viewer' path=$PHOTOSPHERE_PATH|cat:'template/photo-sphere-viewer.min.css'}

<div id="photoSphere" style="box-sizing:border-box;width:100%;"></div>

{footer_script}
(function(){
  var $theImg = $('#theImage');
  var $sphere = $('#photoSphere');
  
  function resize() {
    var width = $theImg.width()-10;
    var maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      - $theImg.offset().top 
      - ($theImg.outerHeight(true) - $theImg.height()) / 2
      - 20;
      
    $sphere.css({
      height: Math.min(width * 0.7, maxHeight)
    });
  }
  
  $(window).on('resize', resize);
  
  $(document).on('click', '.switchArrow', function() {
    setTimeout(function() {
      resize();
      psv._onResize();
    }, 10);
  });
  
  resize();
  
  window.psv = new PhotoSphereViewer({
    container: document.getElementById('photoSphere'),
    panorama: '{$ROOT_URL}{$current.element_path}',
    default_fov: 60,
    default_long: {$SPHERE_LONG} * 2*Math.PI - Math.PI/2,
    default_lat: {$SPHERE_LAT} * Math.PI,
    navbar: true,
    anim_speed: '1.5rpm',
    mousewheel: false,
    loading_img: '{$ROOT_URL}{$PHOTOSPHERE_PATH}template/icon.png'
  });
  
  window.psv.pwgResize = resize;
}());
{/footer_script}

{html_style}
.psv-loader {
  width: 150px;
  height: 150px;
}
{/html_style}