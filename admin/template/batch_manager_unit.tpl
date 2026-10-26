<div class="full-line-box">
    <label style="font-weight:bold">
        {* Use of a proxy input because the default implementation does not support checkboxes... *}
        <input type="hidden" name="is_sphere" value="{if $element.is_sphere}1{else}0{/if}">
        <input type="checkbox" name="is_sphere_helper" {if $element.is_sphere}checked{/if}> Photo Sphere
    </label>
</div>

<script>
{literal}
if (!window.photoSphereLoaded) {
    $(document).ready(function () {
        pluginValues.push({ api_key: 'is_sphere', selector: '[name="is_sphere"]' });

        document.querySelectorAll('[name=is_sphere_helper]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                console.log('e');
                checkbox.previousElementSibling.value = checkbox.checked ? '1' : '0';
            });
        });
    });
    window.photoSphereLoaded = true;
}
{/literal}
</script>
