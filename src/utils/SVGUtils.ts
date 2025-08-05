export function convertArcsToCubics(svgPath) {
    if (!svgPath.includes('A')) return svgPath; // No arc, return as-is

    const commands = svgPath.match(/[a-zA-Z][^a-zA-Z]*/g);
    const output = [];
    let currentX = 0, currentY = 0;

    function arcToCubic(x1, y1, rx, ry, angle, largeArcFlag, sweepFlag, x2, y2) {
        // Ported from https://github.com/fontello/svgpath (MIT licensed)
        // Handles arc to cubic Bézier conversion

        const rad = (a) => a * Math.PI / 180;
        const sinPhi = Math.sin(rad(angle));
        const cosPhi = Math.cos(rad(angle));
        const dx2 = (x1 - x2) / 2.0;
        const dy2 = (y1 - y2) / 2.0;
        const x1p = cosPhi * dx2 + sinPhi * dy2;
        const y1p = -sinPhi * dx2 + cosPhi * dy2;
        let rxSq = rx * rx;
        let rySq = ry * ry;
        let x1pSq = x1p * x1p;
        let y1pSq = y1p * y1p;

        // Correct out-of-range radii
        let radicant = (rxSq * rySq - rxSq * y1pSq - rySq * x1pSq) /
                       (rxSq * y1pSq + rySq * x1pSq);
        radicant = Math.max(0, radicant);
        const coef = (largeArcFlag !== sweepFlag ? 1 : -1) * Math.sqrt(radicant);
        const cxp = coef * (rx * y1p) / ry;
        const cyp = coef * -(ry * x1p) / rx;

        const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
        const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

        const startAngle = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
        const endAngle = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx);
        let deltaAngle = endAngle - startAngle;

        if (!sweepFlag && deltaAngle > 0) {
            deltaAngle -= 2 * Math.PI;
        } else if (sweepFlag && deltaAngle < 0) {
            deltaAngle += 2 * Math.PI;
        }

        const segments = Math.ceil(Math.abs(deltaAngle / (Math.PI / 2)));
        const result = [];
        const delta = deltaAngle / segments;
        for (let i = 0; i < segments; i++) {
            const theta1 = startAngle + i * delta;
            const theta2 = startAngle + (i + 1) * delta;

            const t = (4 / 3) * Math.tan((theta2 - theta1) / 4);

            const sin1 = Math.sin(theta1), cos1 = Math.cos(theta1);
            const sin2 = Math.sin(theta2), cos2 = Math.cos(theta2);

            const x1 = cosPhi * rx * cos1 - sinPhi * ry * sin1 + cx;
            const y1 = sinPhi * rx * cos1 + cosPhi * ry * sin1 + cy;

            const dx1 = -rx * sin1;
            const dy1 = ry * cos1;
            const dx2 = -rx * sin2;
            const dy2 = ry * cos2;

            const cp1x = x1 + t * (cosPhi * dx1 - sinPhi * dy1);
            const cp1y = y1 + t * (sinPhi * dx1 + cosPhi * dy1);

            const x2 = cosPhi * rx * cos2 - sinPhi * ry * sin2 + cx;
            const y2 = sinPhi * rx * cos2 + cosPhi * ry * sin2 + cy;

            const cp2x = x2 - t * (cosPhi * dx2 - sinPhi * dy2);
            const cp2y = y2 - t * (sinPhi * dx2 + cosPhi * dy2);

            result.push(['C', cp1x, cp1y, cp2x, cp2y, x2, y2]);
        }

        return result;
    }

    for (let i = 0; i < commands.length; i++) {
        const token = commands[i].trim();
        const type = token[0];
        const nums = token.slice(1).trim().split(/[\s,]+/).map(Number);

        if (type === 'M') {
            currentX = nums[0];
            currentY = nums[1];
            output.push(`M ${currentX} ${currentY}`);
        } else if (type === 'L') {
            currentX = nums[0];
            currentY = nums[1];
            output.push(`L ${currentX} ${currentY}`);
        } else if (type === 'Q') {
            output.push(`Q ${nums.join(' ')}`);
            currentX = nums[2];
            currentY = nums[3];
        } else if (type === 'C') {
            output.push(`C ${nums.join(' ')}`);
            currentX = nums[4];
            currentY = nums[5];
        } else if (type === 'A') {
            const [rx, ry, angle, laf, sf, x, y] = nums;
            const beziers = arcToCubic(currentX, currentY, rx, ry, angle, laf, sf, x, y);
            beziers.forEach(c => {
                output.push(`C ${c.slice(1).join(' ')}`);
            });
            currentX = x;
            currentY = y;
        } else if (type === 'Z' || type === 'z') {
            output.push('Z');
        } else {
            // Unhandled command — can extend here
        }
    }

    return output.join(' ');
}
