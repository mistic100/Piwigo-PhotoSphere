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
    container: $sphere[0],
    panorama: $sphere.data('src'),
    default_fov: 80,
    min_fov: 50,
    default_long: $sphere.data('long') * 2*Math.PI - Math.PI/2,
    default_lat: $sphere.data('lat') * Math.PI,
    navbar: true,
    anim_speed: '1.5rpm',
    mousewheel: false,
    loading_img: PHOTOSPHERE.PATH + 'template/icon.png',
    caption: PHOTOSPHERE.caption,
    time_anim: PHOTOSPHERE.time_anim
  });
  
  window.psv.pwgResize = resize;
}());