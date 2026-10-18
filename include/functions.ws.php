<?php
defined('PHOTOSPHERE_PATH') or die('Hacking attempt!');

function photosphere_ws_getImages($params, &$service)
{
    $params['cat_id'] = array_unique($params['cat_id']);

    $query = '
SELECT i.*
FROM ' . IMAGES_TABLE . ' i
INNER JOIN ' . IMAGE_CATEGORY_TABLE . ' ON i.id=image_id
WHERE is_sphere = 1
AND category_id IN (' . implode(',', $params['cat_id']) . ')
GROUP BY i.id
;';
    $result = pwg_query($query);

    $images = array();
    while ($row = pwg_db_fetch_assoc($result)) {
        $image = array();
        foreach (array('id', 'width', 'height') as $k) {
            if (isset($row[$k])) {
                $image[$k] = (int)$row[$k];
            }
        }
        foreach (array('file', 'name') as $k) {
            $image[$k] = $row[$k];
        }

        $image['name'] = strip_tags(trigger_change('render_element_name', $image['name'], __FUNCTION__) ?? '');

        $image = array_merge($image, ws_std_get_urls($row));

        $images[] = $image;
    }

    return new PwgNamedArray(
        $images,
        'image',
        ws_std_get_image_xml_attributes()
    );
}

// FIXME implement ACL
function photosphere_ws_getLinks($params, &$service)
{
    if ($params['recursive']) {
        $query = '
WITH RECURSIVE item_network AS (
    SELECT ' . $params['image_id'] . ' AS item_id
    UNION
    SELECT CASE WHEN l.src_id = n.item_id THEN l.dst_id ELSE l.src_id END
    FROM item_network n
    JOIN ' . PHOTOSPHERE_LINKS_TABLE . ' l ON l.src_id = n.item_id OR l.dst_id = n.item_id
)
SELECT DISTINCT item_id 
FROM item_network
;';
        $network_items = query2array($query, null, 'item_id');

        $query = '
SELECT *
FROM ' . PHOTOSPHERE_LINKS_TABLE . ' l
INNER JOIN ' . IMAGES_TABLE . ' i ON i.id = l.dst_id
WHERE src_id IN(' . implode(',', $network_items) . ')
AND dst_id IN(' . implode(',', $network_items) . ')
;';
    } else {
        $query = '
SELECT *
FROM ' . PHOTOSPHERE_LINKS_TABLE . ' l
INNER JOIN ' . IMAGES_TABLE . ' i ON i.id = l.dst_id
WHERE src_id = ' . $params['image_id'] . '
;';
    }

    $result = pwg_query($query);

    $images = array();
    $image_dst_ids = array();
    while ($row = pwg_db_fetch_assoc($result)) {
        $image = array();
        foreach (array('src_id', 'dst_id', 'width', 'height') as $k) {
            if (isset($row[$k])) {
                $image[$k] = (int)$row[$k];
            }
        }
        foreach (array('yaw', 'pitch', 'title', 'file', 'name') as $k) {
            $image[$k] = $row[$k];
        }

        $image['name'] = strip_tags(trigger_change('render_element_name', $image['name'], __FUNCTION__) ?? '');

        $derivative = DerivativeImage::get_one(IMG_SQUARE, $row);
        $size = $derivative->get_size();
        $image['square'] = array(
            'url' => $derivative->get_url(),
            'width' => (int)$size[0],
            'height' => (int)$size[1]
        );

        $image_dst_ids[] = $image['dst_id'];
        $images[] = $image;
    }

    if (!empty($image_dst_ids) && !$params['recursive']) {
        $query = '
SELECT src_id
FROM ' . PHOTOSPHERE_LINKS_TABLE . '
WHERE src_id IN(' . implode(',', $image_dst_ids) . ')
AND dst_id = ' . $params['image_id'] . '
';
        $return_links = query2array($query, null, 'src_id');

        foreach ($images as &$image) {
            $image['return_link'] = in_array($image['dst_id'], $return_links);
        }
    }

    return new PwgNamedArray(
        $images,
        'link'
    );
}

function photosphere_ws_addLink($params, &$service)
{
    if (get_pwg_token() != $params['pwg_token']) {
        return new PwgError(403, 'Invalid security token');
    }

    $query = '
SELECT id, is_sphere
FROM ' . IMAGES_TABLE . '
WHERE id IN(' . $params['src_id'] . ',' . $params['dst_id'] . ')
;';
    $result = pwg_query($query);

    if (pwg_db_num_rows($result) != 2) {
        return new PwgError(404, 'src_id or dst_id not found');
    }

    while ($row = pwg_db_fetch_assoc($result)) {
        if (!$row['is_sphere']) {
            return new PwgError(400, 'image is not a photo sphere');
        }
    }

    $data = array(
        'src_id' => $params['src_id'],
        'dst_id' => $params['dst_id'],
        'yaw' => $params['yaw'],
        'pitch' => $params['pitch'],
        'title' => $params['title']
    );

    $query = '
SELECT 1 FROM ' . PHOTOSPHERE_LINKS_TABLE . '
WHERE src_id = ' . $data['src_id'] . '
AND dst_id = ' . $data['dst_id'] . '
;';
    if (pwg_db_num_rows(pwg_query($query)) == 0) {
        single_insert(
            PHOTOSPHERE_LINKS_TABLE,
            $data
        );
    } else {
        single_update(
            PHOTOSPHERE_LINKS_TABLE,
            $data,
            array(
                'src_id' => $data['src_id'],
                'dst_id' => $data['dst_id']
            )
        );
    }
}

function photosphere_ws_deleteLink($params, &$service)
{
    if (get_pwg_token() != $params['pwg_token']) {
        return new PwgError(403, 'Invalid security token');
    }

    $query = '
DELETE FROM ' . PHOTOSPHERE_LINKS_TABLE . '
WHERE src_id = ' . $params['src_id'] . '
AND dst_id = ' . $params['dst_id'] . '
;';

    pwg_query($query);
}

function photosphere_ws_setConfig($params, &$service)
{
    if (get_pwg_token() != $params['pwg_token']) {
        return new PwgError(403, 'Invalid security token');
    }

    $query = '
SELECT id, is_sphere
FROM ' . IMAGES_TABLE . '
WHERE id = ' . $params['image_id'] . '
;';
    $result = pwg_query($query);

    if (pwg_db_num_rows($result) == 0) {
        return new PwgError(404, 'image_id not found');
    }

    $row = pwg_db_fetch_assoc($result);

    if (!$row['is_sphere']) {
        return new PwgError(400, 'image is not a photo sphere');
    }

    if ($params['reset']) {
        $query = '
UPDATE ' . IMAGES_TABLE . '
SET photosphere_config = NULL
WHERE id = ' . $params['image_id'] . '
;';
        pwg_query($query);
    } else {
        $data = array();
        foreach (array('minFov', 'maxFov', 'defaultZoomLvl', 'fisheye') as $key) {
            if (isset($params[$key])) {
                $data[$key] = $params[$key];
            }
        }
        foreach (array('pan', 'tilt', 'roll') as $key) {
            if (isset($params['sphereCorrection_' . $key])) {
                if (!isset($data['sphereCorrection'])) {
                    $data['sphereCorrection'] = array();
                }
                $data['sphereCorrection'][$key] = $params['sphereCorrection_' . $key];
            }
        }

        $query = '
UPDATE ' . IMAGES_TABLE . '
SET photosphere_config = \'' . json_encode($data) . '\'
WHERE id = ' . $params['image_id'] . '
;';
        pwg_query($query);
    }
}
