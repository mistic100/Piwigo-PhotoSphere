<div id="photoSphere"></div>

<!-- compat with Loupe plugin -->
<div id="theMainImage" style="display:none"></div>
<div id="loupe_image" style="display:none"></div>

{html_head}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5.9.0/index.min.css" />
{/html_head}

<script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.min.js",
            "@photo-sphere-viewer/core": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5.9.0/index.module.min.js",
            "@photo-sphere-viewer/autorotate-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/autorotate-plugin@5.9.0/index.module.min.js"
        }
    }
</script>

<script type="module">
    import { Viewer } from '@photo-sphere-viewer/core';
    import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';

    const viewer = new Viewer({
        container: 'photoSphere',
        panorama: '{$SPHERE_DERIVATIVE->get_url()}',
        defaultYaw: {$SPHERE_LONG} * 2*Math.PI - Math.PI,
        defaultPitch: {$SPHERE_LAT} * Math.PI,
        navbar: 'autorotate zoom move caption fullscreen',
        mousewheel: false,
        loadingImg: '{$ROOT_URL}{$PHOTOSPHERE_PATH}template/icon.png',
        caption: {if $PhotoSphere.display_help}'{'Drag and drop to navigate in the photo.'|translate|escape:javascript}'{else}null{/if},
        lang: {
          autorotate: '{'Automatic rotation'|translate|escape:javascript}',
          zoom: '{'Zoom'|translate|escape:javascript}',
          zoomOut: '{'Zoom out'|translate|escape:javascript}',
          zoomIn: '{'Zoom in'|translate|escape:javascript}',
          moveUp: '{'Move up'|translate|escape:javascript}',
          moveDown: '{'Move down'|translate|escape:javascript}',
          moveLeft: '{'Move left'|translate|escape:javascript}',
          moveRight: '{'Move right'|translate|escape:javascript}',
          fullscreen: '{'Fullscreen'|translate|escape:javascript}'
        },
        plugins: [
            [AutorotatePlugin, {
                autorotateSpeed: '1.5rpm',
                autostartDelay: {if $PhotoSphere.auto_anim}2000{else}null{/if},
            }],
        ],
    });

    var $theImg = $('#theImage');
    var $sphere = $('#photoSphere');

    function resize() {
      const width = $theImg.width() - 10;
      const maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        - $theImg.offset().top 
        - ($theImg.outerHeight(true) - $theImg.height()) / 2
        - 20;

      $sphere.css({
        height: Math.min(width * 0.7, maxHeight)
      });

      viewer.autoSize();
    }

    $(window).on('resize', resize);

    $(document).on('click', '.switchArrow', function() {
      setTimeout(resize, 10);
    });

    viewer.addEventListener('ready', resize, { once: true });
</script>

{html_style}
#photoSphere {
  box-sizing:border-box;
  width:100%;
}
{/html_style}
