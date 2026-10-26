<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

function photosphere_ws_add_methods($arr)
{
    $service = &$arr[0];

    $service->addMethod(
        'psv.getImages',
        'photosphere_ws_getImages',
        array(
            'cat_id' => array(
                'flags' => WS_PARAM_FORCE_ARRAY,
                'type' => WS_TYPE_ID
            ),
        ),
        'Returns photo spheres.',
        PHOTOSPHERE_PATH . 'include/functions.ws.php',
        array('admin_only' => true)
    );

    $service->addMethod(
        'psv.getLinks',
        'photosphere_ws_getLinks',
        array(
            'image_id' => array('type' => WS_TYPE_ID),
        ),
        'Returns photo spheres links.',
        PHOTOSPHERE_PATH . 'include/functions.ws.php',
        array('admin_only' => true)
    );

    $service->addMethod(
        'psv.getNetwork',
        'photosphere_ws_getNetwork',
        array(
            'image_id' => array('type' => WS_TYPE_ID),
        ),
        'Returns photo spheres full network.',
        PHOTOSPHERE_PATH . 'include/functions.ws.php',
        array('admin_only' => true)
    );

    $service->addMethod(
        'psv.addLink',
        'photosphere_ws_addLink',
        array(
            'src_id' => array('type' => WS_TYPE_ID),
            'dst_id' => array('type' => WS_TYPE_ID),
            'yaw' => array('type' => WS_TYPE_FLOAT),
            'pitch' => array('type' => WS_TYPE_FLOAT),
            'pwg_token' => array(),
        ),
        'Add/edit a photo sphere link.',
        PHOTOSPHERE_PATH . 'include/functions.ws.php',
        array('admin_only' => true, 'post_only' => true)
    );

    $service->addMethod(
        'psv.deleteLink',
        'photosphere_ws_deleteLink',
        array(
            'src_id' => array('type' => WS_TYPE_ID),
            'dst_id' => array('type' => WS_TYPE_ID),
            'pwg_token' => array(),
        ),
        'Delete a photo sphere link.',
        PHOTOSPHERE_PATH . 'include/functions.ws.php',
        array('admin_only' => true, 'post_only' => true)
    );

    $service->addMethod(
        'psv.setConfig',
        'photosphere_ws_setConfig',
        array(
            'image_id' => array('type' => WS_TYPE_ID),
            'reset' => array('type' => WS_TYPE_BOOL, 'default' => false),
            'minFov' => array('type' => WS_TYPE_INT, 'default' => null),
            'maxFov' => array('type' => WS_TYPE_INT, 'default' => null),
            'defaultZoomLvl' => array('type' => WS_TYPE_INT | WS_TYPE_POSITIVE, 'default' => null),
            'fisheye' => array('type' => WS_TYPE_BOOL, 'default' => null),
            'sphereCorrection_pan' => array('type' => WS_TYPE_FLOAT, 'default' => null),
            'sphereCorrection_tilt' => array('type' => WS_TYPE_FLOAT, 'default' => null),
            'sphereCorrection_roll' => array('type' => WS_TYPE_FLOAT, 'default' => null),
            'pwg_token' => array(),
        ),
        'Changes the configuration of a photo sphere.',
        PHOTOSPHERE_PATH . 'include/functions.ws.php',
        array('admin_only' => true, 'post_only' => true)
    );
}

function photosphere_ws_images_setInfo($res, $methodName, $params)
{
    if ($methodName != 'pwg.images.setInfo') {
        return $res;
    }
    if (!isset($_POST['is_sphere'])) {
        return $res;
    }
    if (empty($params['image_id'])) {
        return $res;
    }

    if ($_POST['is_sphere'] != '0' && $_POST['is_sphere'] != '1') {
        return new PwgError(WS_ERR_INVALID_PARAM, 'is_sphere must be 0 or 1');
    }

    single_update(
        IMAGES_TABLE,
        array('is_sphere' => intval($_POST['is_sphere'])),
        array('id' => $params['image_id']),
    );

    return $res;
}
