<div id="photoSphere"></div>

<!-- compat with Loupe plugin -->
<div id="theMainImage" style="display:none"></div>
<div id="loupe_image" style="display:none"></div>

{html_head}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@{$VERSION_PHOTOSPHERE_LIB}/index.min.css" />
{/html_head}
{if !empty($LINKS)}
{html_head}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@{$VERSION_PHOTOSPHERE_LIB}/index.min.css" />
{/html_head}
{combine_script id='photo-sphere-marker' load='footer' path="`$PHOTOSPHERE_PATH`template/marker.js"}
{combine_css path="`$PHOTOSPHERE_PATH`template/marker.css"}
{/if}

<script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@{$VERSION_THREEJS_LIB}/build/three.module.min.js",
            "@photo-sphere-viewer/core": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@{$VERSION_PHOTOSPHERE_LIB}/index.module.min.js",
            "@photo-sphere-viewer/autorotate-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/autorotate-plugin@{$VERSION_PHOTOSPHERE_LIB}/index.module.min.js",
            "@photo-sphere-viewer/markers-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@{$VERSION_PHOTOSPHERE_LIB}/index.module.min.js"
        }
    }
</script>

<script type="module">
    import { Viewer, EquirectangularAdapter } from '@photo-sphere-viewer/core';
    import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
    {if !empty($LINKS)}
    import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
    const tourConfig = {$PhotoSphere.tour|json_encode};
    {/if}

    const container = document.querySelector('#photoSphere');

    const viewer = new Viewer({
        container: container,
        adapter: [EquirectangularAdapter, { shader:true }],
        panorama: '{$SPHERE_DERIVATIVE}',
        ...({$SPHERE_CONFIG|json_encode}),
        navbar: 'autorotate zoom move caption{if !empty($LINKS)} markersList{/if} fullscreen',
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
          fullscreen: '{'Fullscreen'|translate|escape:javascript}',
          markers: '{'Linked photos'|translate|escape:javascript}',
          markersList: '{'Linked photos'|translate|escape:javascript}',
        },
        plugins: [
            [AutorotatePlugin, {
              autorotateSpeed: '1.5rpm',
              autostartDelay: {if $PhotoSphere.auto_anim}2000{else}null{/if},
              autostartOnIdle: {if $PhotoSphere.auto_anim}true{else}false{/if},
            }],
            {if !empty($LINKS)}
            [MarkersPlugin, {
              gotoMarkerSpeed: 1000,
            }],
            {/if}
        ],
        ...({$PhotoSphere.psv_config})
    });

    {if !empty($LINKS)}
    const markersPlugin = viewer.getPlugin(MarkersPlugin);

    markersPlugin.addEventListener('select-marker', ({ marker: { data: link }})  => {
      location.href = link.url + (link.url.includes('?')?'&':'?') + 'yaw=' + link.yaw;
    });
    {/if}

    viewer.addEventListener('ready', () => {
      const params = new URLSearchParams(location.search);
      if (params.has('yaw')) {
        viewer.rotate({
          yaw: parseFloat(params.get('yaw')),
          pitch: 0,
        });
      } else {
        viewer.rotate({
          textureX: {$DEFAULT_POSITION.x},
          textureY: {$DEFAULT_POSITION.y},
        });
      }

      {if !empty($LINKS)}
      const links = {$LINKS|json_encode};
      links.forEach(link => {
        markersPlugin.addMarker(PhotoSphereMarkerElement.build(link, tourConfig));
      });
      {/if}
    }, { once: true });

    container.style.height = `calc(100vh - ${'{'}container.getBoundingClientRect().top}px - 10px)`;

    function resize() {
      viewer?.autoSize();
    }

    $(window).on('resize', resize);

    $(document).on('click', '.switchArrow', function() {
      setTimeout(resize, 10);
    });

    resize();
</script>

{html_style}
#photoSphere {
  box-sizing:border-box;
  width:100%;
}
{/html_style}
