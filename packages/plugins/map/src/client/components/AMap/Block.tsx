import { CheckOutlined, EnvironmentOutlined, ExpandOutlined } from '@ant-design/icons';
import { css } from '@emotion/css';
import { RecursionField, Schema, useFieldSchema } from '@formily/react';
import {
  ActionContextProvider,
  RecordProvider,
  useCollection,
  useCompile,
  useFilterAPI,
  useProps,
} from '@nocobase/client';
import { useMemoizedFn } from 'ahooks';
import { Button, Space } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { defaultImage, selectedImage } from '../../constants';
import { useMapTranslation } from '../../locale';
import { AMapComponent, AMapForwardedRefProps } from './Map';

export const AMapBlock = (props) => {
  const { fieldNames, dataSource = [], fixedBlock, zoom, setSelectedRecordKeys } = useProps(props);
  const { getField, getPrimaryKey } = useCollection();
  const field = getField(fieldNames?.field);
  const [isMapInitialization, setIsMapInitialization] = useState(false);
  const mapRef = useRef<AMapForwardedRefProps>();
  const geometryUtils: AMap.IGeometryUtil = mapRef.current?.aMap?.GeometryUtil;
  const [record, setRecord] = useState();
  const [selectingMode, setSelecting] = useState('');
  const { t } = useMapTranslation();
  const compile = useCompile();
  const { isConnected, doFilter } = useFilterAPI();
  const [, setPrevSelected] = useState(null);
  const selectingModeRef = useRef(selectingMode);
  selectingModeRef.current = selectingMode;

  const setOverlayOptions = (overlay: AMap.Polygon | AMap.Marker, state?: boolean) => {
    const extData = overlay.getExtData();
    const selected = typeof state === 'undefined' ? extData.selected : !state;
    extData.selected = !selected;
    if ('setIcon' in overlay) {
      overlay.setIcon(
        new mapRef.current.aMap.Icon({
          imageSize: [19, 32],
          image: selected ? defaultImage : selectedImage,
        } as AMap.IconOpts),
      );
    }
    (overlay as AMap.Polygon).setOptions({
      extData,
      ...(selected
        ? { strokeColor: '#4e9bff', fillColor: '#4e9bff' }
        : { strokeColor: '#F18b62', fillColor: '#F18b62' }),
    });
  };

  const removeSelection = () => {
    if (!mapRef.current) return;
    mapRef.current.mouseTool().close(true);
    mapRef.current.editor().setTarget(null);
    mapRef.current.editor().close();
  };

  // selection
  useEffect(() => {
    if (selectingMode !== 'selection') {
      return;
    }
    if (!mapRef.current.editor()) {
      mapRef.current.createEditor('polygon');
      mapRef.current.createMouseTool('polygon');
    } else {
      mapRef.current.executeMouseTool('polygon');
    }
    return () => {
      removeSelection();
    };
  }, [selectingMode]);

  useEffect(() => {
    if (selectingMode) {
      return () => {
        if (!selectingModeRef.current) {
          mapRef.current.map.getAllOverlays().forEach((o) => {
            setOverlayOptions(o, false);
          });
        }
      };
    }
  }, [selectingMode]);

  const onSelectingComplete = useMemoizedFn(() => {
    const selectingOverlay = mapRef.current.editor().getTarget();
    const overlays = mapRef.current.map.getAllOverlays();
    const selectedOverlays = overlays.filter((o) => {
      if (o === selectingOverlay || o.getExtData().id === undefined) return;
      if ('getPosition' in o) {
        return geometryUtils.isPointInRing(o.getPosition(), selectingOverlay.getPath() as any);
      }
      return geometryUtils.doesRingRingIntersect(o.getPath(), selectingOverlay.getPath() as any);
    });
    const ids = selectedOverlays.map((o) => {
      setOverlayOptions(o, true);
      return o.getExtData().id;
    });
    setSelectedRecordKeys((lastIds) => ids.concat(lastIds));
    selectingOverlay.remove();
    mapRef.current.editor().close();
  });

  useEffect(() => {
    if (!field || !mapRef.current) return;
    const overlays = dataSource
      .map((item) => {
        const data = item[fieldNames?.field];
        if (!data) return;
        const overlay = mapRef.current.setOverlay(field.type, data, {
          strokeColor: '#4e9bff',
          fillColor: '#4e9bff',
          cursor: 'pointer',
          label: {
            direction: 'bottom',
            offset: [0, 5],
            content: fieldNames?.marker ? compile(item[fieldNames.marker]) : undefined,
          },
          extData: {
            id: item[getPrimaryKey()],
          },
        });
        return overlay;
      })
      .filter(Boolean);
    mapRef.current.map?.setFitView(overlays);

    const events = overlays.map((o: AMap.Marker) => {
      const onClick = (e) => {
        const overlay: AMap.Polygon | AMap.Marker = e.target;
        const extData = overlay.getExtData();
        if (!extData) return;
        if (selectingModeRef.current) {
          if (selectingModeRef.current === 'click') {
            setSelectedRecordKeys((keys) =>
              extData.selected ? keys.filter((key) => key !== extData.id) : [...keys, extData.id],
            );
            setOverlayOptions(overlay);
          }
          return;
        }
        const data = dataSource?.find((item) => {
          return extData.id === item[getPrimaryKey()];
        });

        // 筛选区块模式
        if (isConnected) {
          setPrevSelected((prev) => {
            prev && clearSelected(prev);
            if (prev === o) {
              clearSelected(o);

              // 删除过滤参数
              doFilter(null);
              return null;
            } else {
              selectMarker(o);
              doFilter(data[getPrimaryKey()], (target) => target.field || getPrimaryKey(), '$eq');
            }
            return o;
          });

          return;
        }

        if (data) {
          setRecord(data);
        }
      };
      o.on('click', onClick);
      return () => o.off('click', onClick);
    });

    return () => {
      overlays.forEach((ov) => {
        ov.remove();
      });
      events.forEach((e) => e());
    };
  }, [dataSource, isMapInitialization, fieldNames, field.type, isConnected]);

  useEffect(() => {
    setTimeout(() => {
      setSelectedRecordKeys([]);
    });
  }, [dataSource]);

  const mapRefCallback = (instance: AMapForwardedRefProps) => {
    mapRef.current = instance;
    setIsMapInitialization(!!instance?.map && !instance.errMessage);
  };

  return (
    <div
      className={css`
        position: relative;
        height: 100%;
      `}
    >
      <div
        className={css`
          position: absolute;
          left: 10px;
          top: 10px;
          z-index: 999;
        `}
      >
        {isMapInitialization && !mapRef.current.errMessage ? (
          <Space direction="vertical">
            <Button
              style={{
                color: !selectingMode ? '#F18b62' : undefined,
                borderColor: 'currentcolor',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelecting('');
              }}
              icon={<EnvironmentOutlined />}
            ></Button>
            <Button
              style={{
                color: selectingMode === 'selection' ? '#F18b62' : undefined,
                borderColor: 'currentcolor',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelecting('selection');
              }}
              icon={<ExpandOutlined />}
            ></Button>
            {selectingMode === 'selection' ? (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                title={t('Confirm selection')}
                onClick={onSelectingComplete}
              ></Button>
            ) : null}
          </Space>
        ) : null}
      </div>
      <MapBlockDrawer record={record} setVisible={setRecord} />
      <AMapComponent
        {...field?.uiSchema?.['x-component-props']}
        ref={mapRefCallback}
        style={{ height: fixedBlock ? '100%' : null }}
        zoom={zoom}
        disabled
        block
        overlayCommonOptions={{
          strokeColor: '#F18b62',
          fillColor: '#F18b62',
        }}
      ></AMapComponent>
    </div>
  );
};

const MapBlockDrawer = (props) => {
  const { setVisible, record } = props;
  const fieldSchema = useFieldSchema();
  const schema: Schema = useMemo(
    () =>
      fieldSchema.reduceProperties((buf, current) => {
        if (current.name === 'drawer') {
          return current;
        }
        return buf;
      }, null),
    [fieldSchema],
  );

  return (
    schema && (
      <ActionContextProvider value={{ visible: !!record, setVisible }}>
        <RecordProvider record={record}>
          <RecursionField schema={schema} name={schema.name} />
        </RecordProvider>
      </ActionContextProvider>
    )
  );
};

function clearSelected(marker: AMap.Marker | AMap.Polygon | AMap.Polyline | AMap.Circle) {
  if ((marker as AMap.Marker).dom) {
    (marker as AMap.Marker).dom.style.filter = 'none';

    // AMap.Polygon | AMap.Polyline | AMap.Circle 都有 setOptions 方法
  } else if ((marker as AMap.Polygon).setOptions) {
    (marker as AMap.Polygon).setOptions({
      strokeColor: '#4e9bff',
      fillColor: '#4e9bff',
    });
  }
}

function selectMarker(marker: AMap.Marker | AMap.Polygon | AMap.Polyline | AMap.Circle) {
  if ((marker as AMap.Marker).dom) {
    (marker as AMap.Marker).dom.style.filter = 'brightness(1.2) contrast(1.2) hue-rotate(180deg)';

    // AMap.Polygon | AMap.Polyline | AMap.Circle 都有 setOptions 方法
  } else if ((marker as AMap.Polygon).setOptions) {
    (marker as AMap.Polygon).setOptions({
      strokeColor: '#F18b62',
      fillColor: '#F18b62',
    });
  }
}
