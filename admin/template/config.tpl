{combine_script id='common' load='footer' path='admin/themes/default/js/common.js'}

<div class="titrePage">
  <h2>Photo Sphere</h2>
</div>

<p>{'photosphere_config_intro'|translate}</p>

<form method="post" action="" class="properties" id="configContent">
  <input type="hidden" name="pwg_token" value="{$PWG_TOKEN}">

  <fieldset class="mainConf">
    <legend><span class="icon-cog icon-purple"></span>{'Basic settings'|translate}</legend>

    <ul>
      <li>
        <label class="font-checkbox">
          <span class="icon-check"></span>
          <input type="checkbox" name="display_help" {if $PhotoSphere.display_help} checked="checked" {/if}>
          {'Display help message'|translate}
        </label>
        <span style="font-size:0.8em;">&laquo; {'Drag and drop to navigate in the photo.'|translate} &raquo;</span>
      </li>
      <li>
        <label class="font-checkbox">
          <span class="icon-check"></span>
          <input type="checkbox" name="auto_anim" {if $PhotoSphere.auto_anim} checked="checked" {/if}>
          {'Automatically launch animation'|translate}
        </label>
      </li>
      <li>
        <label>
          {'Animation speed'|translate} :
          <select name="anim_speed">
            <option value="slow" {if $PhotoSphere.anim_speed == 'slow'}selected{/if}>{'Slow'|translate}</option>
            <option value="medium" {if $PhotoSphere.anim_speed == 'medium'}selected{/if}>{'Medium'|translate}</option>
            <option value="fast" {if $PhotoSphere.anim_speed == 'fast'}selected{/if}>{'Fast'|translate}</option>
          </select>
        </label>
      </li>
      <li>
        <label class="font-checkbox">
          <span class="icon-check"></span>
          <input type="checkbox" name="display_icon" {if $PhotoSphere.display_icon} checked="checked" {/if}>
          {'Display Photo Sphere icon on thumbnails list'|translate}
        </label>
        <span style="font-size:0.8em;">({'Not compatible with all themes/plugins.'|translate})</span>
      </li>
      <li>
        <label>
          {'Sphere texture size'|translate} :
          <input type="number" min="1024" max="8192" value="{$PhotoSphere.raw_width}" name="raw_width"> px
        </label>
        <br>
        {'photosphere_texturesize_description'|translate}
      </li>
      <li>
        <label for="psv_config">{'Additional configuration'|translate}</label>
        <br>
        <textarea rows="5" cols="50" name="psv_config" id="psv_config">{$PhotoSphere.psv_config}</textarea>
        <br>
        {'photosphere_config_description'|translate}
      </li>
    </ul>
  </fieldset>

  <fieldset class="mainConf">
    <legend><span class="icon-cog icon-purple"></span>{'Virtual tour'|translate}</legend>

    {'photosphere_tour_description'|translate}
    <br>
    <br>

    <ul>
      <li>
        <label for="tour_link_mode">
          {'Link display mode'|translate} :
          <select name="tour_link_mode" id="tour_link_mode">
            <option value="thumbnail" {if $PhotoSphere.tour.link_mode == 'thumbnail'}selected{/if}>{'Thumbnail'|translate}</option>
            <option value="arrow" {if $PhotoSphere.tour.link_mode == 'arrow'}selected{/if}>{'Arrow'|translate}</option>
          </select>
        </label>
      </li>
      <li>
        <label>
          {'Link size'|translate} :
          <input type="number" min="0" max="1000" value="{$PhotoSphere.tour.link_size}" name="tour_link_size"> px
        </label>
        <br>
      </li>
    </ul>
  </fieldset>

  <div class="savebar-footer">
    <div class="savebar-footer-start"></div>
    <div class="savebar-footer-end">
      <div class="savebar-footer-block">
        <button class="buttonLike" type="submit" name="submit">
          <i class="icon-floppy"></i>
          {'Save Settings'|@translate}
        </button>
      </div>
    </div>
    <input type="hidden" name="pwg_token" value="{$PWG_TOKEN}">
  </div>

</form>
