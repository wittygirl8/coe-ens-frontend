import { Settings } from 'sigma/settings';
import { NodeDisplayData, PartialButFor, PlainObject } from 'sigma/types';

const TEXT_COLOR = '#000000';

/**
 * This function draw in the input canvas 2D context a rectangle.
 * It only deals with tracing the path, and does not fill or stroke.
 */
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawHover(
  context: CanvasRenderingContext2D,
  data: PlainObject,
  settings: PlainObject
) {
  const size = settings.labelSize + 2;
  const font = settings.labelFont;
  const weight = settings.labelWeight;
  const subLabelSize = size - 2;
  const lineSpacing = 6;

  const label = data.label;
  if (`${label}`.toLowerCase() === 'aramco') return;

  let subLabel = '';
  let clusterLabel = '';

  if (data.node_category === 'direct') {
    subLabel = data.national_identifier ?? '';
    clusterLabel = data.location ?? '';
  } else if (data.node_category === 'indirect') {
    subLabel = data.node_risk_description ?? '';
    clusterLabel = `${data.node_type}`.toUpperCase() || '';
  }

  // Measure widths
  context.font = `${weight} ${size}px ${font}`;
  const labelWidth = context.measureText(label).width;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  const subLabelWidth = subLabel ? context.measureText(subLabel).width : 0;
  const clusterLabelWidth = clusterLabel
    ? context.measureText(clusterLabel).width
    : 0;

  const textWidth = Math.max(labelWidth, subLabelWidth, clusterLabelWidth);
  const boxPaddingX = 6;
  const boxPaddingY = 8;

  const x = Math.round(data.x);
  const y = Math.round(data.y);
  const w = Math.round(textWidth + boxPaddingX * 2 + data.size);

  // Calculate how many lines of text
  const lines = [label];
  if (subLabel) lines.push(subLabel);
  if (clusterLabel) lines.push(clusterLabel);

  const totalHeight =
    size + // first line height
    (lines.length - 1) * (subLabelSize + lineSpacing) +
    boxPaddingY * 2;

  // 🟩 Align box center vertically to the node
  const boxX = x;
  const boxY = y - totalHeight / 2;

  context.beginPath();
  context.fillStyle = '#fff';
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.shadowBlur = 8;
  context.shadowColor = '#000';
  drawRoundRect(context, boxX, boxY, w, totalHeight, 5);
  context.closePath();
  context.fill();

  // Reset shadow
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

  // Draw text, starting from top of box
  let currentY = boxY + boxPaddingY + size;
  const textX = x + data.size + 3;

  context.fillStyle = TEXT_COLOR;
  context.font = `${weight} ${size}px ${font}`;
  context.fillText(label, textX, currentY);

  if (subLabel) {
    currentY += subLabelSize + lineSpacing;
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(subLabel, textX, currentY);
  }

  if (clusterLabel) {
    currentY += subLabelSize + lineSpacing;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(clusterLabel, textX, currentY);
  }
}

export function drawLabel(
  context: CanvasRenderingContext2D,
  data: PartialButFor<NodeDisplayData, 'x' | 'y' | 'size' | 'label' | 'color'>,
  settings: Settings
): void {
  if (!data.label) return;

  const size = settings.labelSize;
  const font = settings.labelFont;
  const weight = settings.labelWeight;

  context.font = `${weight} ${size}px ${font}`;

  // Split the label into two lines
  const words = data.label.trim().split(/\s+/);
  const half = Math.ceil(words.length / 2);
  const line1 = words.slice(0, half).join(' ');
  const line2 = words.slice(half).join(' ');

  // Measure text widths
  const padding = 4;
  const textWidth = Math.max(
    context.measureText(line1).width,
    context.measureText(line2).width
  );
  const boxWidth = textWidth + padding * 2;

  // Vertically center
  const lineHeight = size + 2;
  const boxHeight = lineHeight * 2;

  const x = data.x + data.size;
  const y = data.y - boxHeight / 2;

  // Background box
  context.fillStyle = '#ffffffcc';
  context.fillRect(x, y, boxWidth, boxHeight);

  // Text
  context.fillStyle = '#000';
  context.fillText(line1, x + padding, y + lineHeight - 2);
  context.fillText(line2, x + padding, y + lineHeight * 2 - 2);
}
