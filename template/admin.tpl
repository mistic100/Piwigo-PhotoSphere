<div class="titrePage">
  <h2>Photo Sphere</h2>
</div>

<form method="post" action="" class="properties" id="psv-config">
<fieldset>
  <legend>{'Configuration'|translate}</legend>
  <p>{'photosphere_config_intro'|translate}</p>
  <br>
  <ul>
    <li>
      <label>
        <span class="graphicalCheckbox icon-check{if not $PhotoSphere.display_help}-empty{/if}"></span>
        <input type="checkbox" name="display_help"{if $PhotoSphere.display_help} checked="checked"{/if}>
        <b>{'Display help message'|translate}</b>
      </label>
      <span style="font-size:0.8em;">&laquo; {'Drag and drop to navigate in the photo.'|translate} &raquo;</span>
    </li>
    <li>
      <label>
        <span class="graphicalCheckbox icon-check{if not $PhotoSphere.auto_anim}-empty{/if}"></span>
        <input type="checkbox" name="auto_anim"{if $PhotoSphere.auto_anim} checked="checked"{/if}>
        <b>{'Automatically launch animation'|translate}</b>
      </label>
    </li>
    <li>
      <label>
        <span class="graphicalCheckbox icon-check{if not $PhotoSphere.display_icon}-empty{/if}"></span>
        <input type="checkbox" name="display_icon"{if $PhotoSphere.display_icon} checked="checked"{/if}>
        <b>{'Display Photo Sphere icon on thumbnails list'|translate}</b>
      </label>
    </li>
    <li>
      <label>
        <b>{'Sphere texture size'|translate} :</b>
        <input type="number" min="1024" max="8192" value="{$PhotoSphere.raw_width}" name="raw_width"> <b>px</b>
      </label>
      <br>
      {'Between 1024px and 8192px.'|translate}
      {'Bigger textures will take longer to load but smaller textures will result in blurry sphere.'|translate}
  </ul>
  </ul>
</fieldset>

<p class="formButtons"><input type="submit" name="save_config" value="{'Save Settings'|translate}"></p>
</form>


{html_style}
.graphicalCheckbox {
  font-size:16px;
  line-height:16px;
}

.graphicalCheckbox + input {
  display:none;
}
{/html_style}

{footer_script}
jQuery('#psv-config input[type=checkbox]').change(function() {
  jQuery(this).prev().toggleClass('icon-check icon-check-empty');
});
jQuery('#psv-config input[type=radio]').change(function() {
  jQuery('#psv-config input[type=radio][name='+ $(this).attr('name') +']').prev().toggleClass('icon-check icon-check-empty');
});
{/footer_script}