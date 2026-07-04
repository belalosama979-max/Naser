/**
 * positionCalculator.js
 * Calculates student avatar positions on the SVG map.
 * Supports linear interpolation + Cluster Layout for crowded nodes.
 */

import { pathsData } from './pathsData';

/**
 * Linear interpolation helper.
 */
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Calculate the (x, y) position on the path for a given progress (0–100).
 * Uses linear interpolation between adjacent nodes.
 *
 * @param {string} pathId - 'path1' | 'path2'
 * @param {number} progress - 0 to 100
 * @returns {{ x: number, y: number }}
 */
export function calculatePosition(pathId, progress) {
  const nodes = pathsData[pathId];
  if (!nodes || nodes.length === 0) return { x: 0, y: 0 };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  // At or before first node
  if (clampedProgress <= nodes[0].progress) {
    return { x: nodes[0].x, y: nodes[0].y };
  }

  // At or after last node
  const lastNode = nodes[nodes.length - 1];
  if (clampedProgress >= lastNode.progress) {
    return { x: lastNode.x, y: lastNode.y };
  }

  // Find the segment
  let startNode = nodes[0];
  let endNode = nodes[1];

  for (let i = 0; i < nodes.length - 1; i++) {
    if (clampedProgress >= nodes[i].progress && clampedProgress <= nodes[i + 1].progress) {
      startNode = nodes[i];
      endNode = nodes[i + 1];
      break;
    }
  }

  // Interpolation ratio within the segment
  const segmentLength = endNode.progress - startNode.progress;
  const ratio = segmentLength === 0
    ? 0
    : (clampedProgress - startNode.progress) / segmentLength;

  return {
    x: lerp(startNode.x, endNode.x, ratio),
    y: lerp(startNode.y, endNode.y, ratio),
  };
}

/**
 * Find the current "logical" node (closest node that has been passed).
 *
 * @param {string} pathId
 * @param {number} progress
 * @returns {object} node
 */
export function findCurrentNode(pathId, progress) {
  const nodes = pathsData[pathId];
  if (!nodes) return null;

  let currentNode = nodes[0];
  for (const node of nodes) {
    if (progress >= node.progress) currentNode = node;
    else break;
  }
  return currentNode;
}

/**
 * Apply cluster offset so multiple students at similar progress positions
 * don't stack on top of each other.
 *
 * Algorithm:
 *  - Gather all students within a "proximity radius" of the same path.
 *  - Sort them by ID for stable ordering.
 *  - Distribute them in a circle around the base position.
 *  - Radius grows with student count to prevent overlap.
 *
 * @param {Array}  allStudents - All students in the season
 * @param {object} student     - The target student
 * @param {{ x: number, y: number }} basePos - Base SVG position
 * @param {number} [proximityThreshold=4] - progress% range to consider "same cluster"
 * @returns {{ x: number, y: number }} Final offset position
 */
export function applyClusterOffset(allStudents, student, basePos, proximityThreshold = 4) {
  if (!allStudents || allStudents.length <= 1) return basePos;

  // Find peers: same path, within proximity of progress
  const peers = allStudents
    .filter(s =>
      s.pathId === student.pathId &&
      Math.abs(s.progress - student.progress) <= proximityThreshold
    )
    .sort((a, b) => a.id.localeCompare(b.id)); // stable order

  if (peers.length <= 1) return basePos;

  const myIndex = peers.findIndex(s => s.id === student.id);
  if (myIndex === -1) return basePos;

  // Radius grows with count to avoid overlap
  // Minimum 22px, +4px per extra student beyond 2
  const radius = Math.min(22 + (peers.length - 2) * 5, 60);

  // Offset angle: distribute evenly around the circle
  const angle = (myIndex / peers.length) * 2 * Math.PI - Math.PI / 2;

  return {
    x: basePos.x + Math.cos(angle) * radius,
    y: basePos.y + Math.sin(angle) * radius,
  };
}

/**
 * Get the full computed position of a student on the map (with cluster offset).
 *
 * @param {object} student    - Student object { pathId, progress, id }
 * @param {Array}  allStudents - All students
 * @returns {{ x: number, y: number }}
 */
export function getStudentMapPosition(student, allStudents) {
  const basePos = calculatePosition(student.pathId, student.progress);
  return applyClusterOffset(allStudents, student, basePos);
}

/**
 * Build an SVG path string (M x y L x y ...) from an array of nodes.
 *
 * @param {Array} nodes - Array of { x, y } objects
 * @returns {string} SVG path d attribute
 */
export function buildSVGPath(nodes) {
  if (!nodes || nodes.length === 0) return '';
  return nodes
    .map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`)
    .join(' ');
}

/**
 * Build a smooth cubic bezier SVG path through all nodes.
 * Produces much more natural-looking paths.
 *
 * @param {Array} nodes - Array of { x, y } objects
 * @returns {string} SVG path d attribute with cubic bezier curves
 */
export function buildSmoothSVGPath(nodes) {
  if (!nodes || nodes.length < 2) return '';
  if (nodes.length === 2) {
    return `M ${nodes[0].x} ${nodes[0].y} L ${nodes[1].x} ${nodes[1].y}`;
  }

  let d = `M ${nodes[0].x} ${nodes[0].y}`;

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const next = nodes[i + 1];
    const prevPrev = nodes[i - 2];

    // Control points for smooth curve
    const cp1x = prev.x + (curr.x - (prevPrev ? prevPrev.x : prev.x)) / 6;
    const cp1y = prev.y + (curr.y - (prevPrev ? prevPrev.y : prev.y)) / 6;
    const cp2x = curr.x - (next ? (next.x - prev.x) / 6 : 0);
    const cp2y = curr.y - (next ? (next.y - prev.y) / 6 : 0);

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return d;
}
