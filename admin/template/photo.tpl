{combine_script id='jquery.confirm' load='async' require='jquery' path='themes/default/js/plugins/jquery-confirm.min.js'}
{combine_script id='jquery.ui.slider' load='async' require='jquery.ui' path='themes/default/js/ui/minified/jquery.ui.slider.min.js'}
{combine_css path="themes/default/js/plugins/jquery-confirm.min.css"}
{combine_css path="themes/default/js/ui/theme/jquery.ui.slider.css"}
{combine_script id='common' load='footer' path='admin/themes/default/js/common.js'}
{combine_css path="`$PHOTOSPHERE_PATH`admin/template/editor/index.css"}
{combine_css path="`$PHOTOSPHERE_PATH`template/markers.css"}

{html_head}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@{$PHOTOSPHERE_VERSION}/index.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@{$PHOTOSPHERE_VERSION}/index.min.css" />
{/html_head}

<script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@{$PHOTOSPHERE_THREE_VERSION}/build/three.module.min.js",
            "@photo-sphere-viewer/core": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@{$PHOTOSPHERE_VERSION}/index.module.min.js",
            "@photo-sphere-viewer/markers-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@{$PHOTOSPHERE_VERSION}/index.module.min.js"
        }
    }
</script>

<script type="module" src="{$ROOT_URL}{$PHOTOSPHERE_PATH}admin/template/editor/index.js"></script>

<h2>{$TITLE} &#8250; {'Edit photo'|@translate} {$TABSHEET_TITLE}</h2>

{if $picture.is_sphere}
    <photo-sphere-editor
        root-url="{$ROOT_URL}"
        pwg-token="{$PWG_TOKEN}"
        config="{$PHOTOSPHERE_CONFIG|json_encode|escape:html}"
        lang="{$PHOTOSPHERE_TOUR_LANG|json_encode|escape:html}"
        picture="{$picture|json_encode|escape:html}"
        categories="{$categories|json_encode|escape:html}"
    ></photo-sphere-editor>
{/if}
