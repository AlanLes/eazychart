import React, { FC, SVGAttributes, useMemo } from 'react';
import { useChart } from '@/lib/use-chart';
import { Arc } from './shapes/Arc';
import { Dimensions, Point, PieConfig } from 'eazychart-core/src/types';
import { ScaleLinear, scalePieArcData } from 'eazychart-core/src';

export interface IrregularArcsProps
  extends PieConfig,
    Omit<SVGAttributes<SVGPathElement>, 'stroke' | 'strokeWidth'> {
  aScale: ScaleLinear;
  rScale: ScaleLinear;
  getCenter?: (dimensions: Dimensions) => Point;
  getRadius?: (dimensions: Dimensions) => number;
  startAngle?: number;
  endAngle?: number;
}

export const IrregularArcs: FC<IrregularArcsProps> = ({
  startAngle = 0,
  endAngle = 2 * Math.PI,
  aScale,
  rScale,
  getCenter = ({ width, height }) => ({ x: width / 2, y: height / 2 }),
  getRadius = ({ width, height }) => Math.min(width, height) / 2,
  donutRadius = 0,
  cornerRadius = 0,
  padAngle = 0,
  padRadius = 0,
  stroke,
  strokeWidth,
  sortValues,
  ...rest
}) => {
  const { activeData, dimensions } = useChart();
  const center = useMemo(() => getCenter(dimensions), [dimensions, getCenter]);
  const radius = useMemo(() => getRadius(dimensions), [dimensions, getRadius]);
  const radiusScale = useMemo(() => {
    rScale.appendDefinition({ range: [radius / 2, radius] });
    return rScale;
  }, [rScale, radius]);

  const shapeData = useMemo(() => {
    return scalePieArcData(
      activeData,
      aScale,
      startAngle,
      endAngle,
      sortValues
    );
  }, [activeData, aScale, sortValues, startAngle, endAngle]);

  const minArcValue = useMemo(
    () =>
      rScale.scale(
        Math.min(...shapeData.map((shapeDatum) => shapeDatum.value))
      ),
    [rScale, shapeData]
  );

  return (
    <g
      transform={`translate(${center.x},${center.y})`}
      {...rest}
      className="ez-irregular-arcs"
    >
      {shapeData.map((shapeDatum) => {
        const outerRadius = radiusScale.scale(shapeDatum.value);
        const innerRadius = minArcValue * donutRadius;
        return (
          <Arc
            key={shapeDatum.id}
            shapeDatum={shapeDatum}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            cornerRadius={cornerRadius}
            padAngle={padAngle}
            padRadius={padRadius}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      })}
    </g>
  );
};
