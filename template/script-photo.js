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
    
    if (window.psv) {
      window.psv.autoSize();
    }
  }
  
  $(window).on('resize', resize);
  
  $(document).on('click', '.switchArrow', function() {
    setTimeout(resize, 10);
  });
  
  resize();
  
  window.psv = new PhotoSphereViewer.Viewer({
    container: 'photoSphere',
    panorama: $sphere.data('src'),
    defaultLong: $sphere.data('long') * 2*Math.PI - Math.PI,
    defaultLat: $sphere.data('lat') * Math.PI,
    navbar: 'autorotate zoom caption fullscreen',
    autorotateSpeed: '1.5rpm',
    mousewheel: false,
    loadingImg: PHOTOSPHERE.PATH + 'template/icon.png',
    caption: PHOTOSPHERE.caption,
    autorotateDelay: PHOTOSPHERE.autorotateDelay,
    lang: PHOTOSPHERE.lang
  });
}());
