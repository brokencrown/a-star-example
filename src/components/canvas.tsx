import { Layer as LayerElement, Rect as RectElement, Stage } from 'react-konva';
import React, { useRef } from 'react';

import { Circle } from 'konva/lib/shapes/Circle';
import { KonvaEventObject } from 'konva/lib/Node';
import { Layer } from 'konva/lib/Layer';
import { Line } from 'konva/lib/shapes/Line';
import { Rect } from 'konva/lib/shapes/Rect';

const Canvas = () => {
  const layerRef = useRef<Layer>(null);
  const image = new Image();
  image.src = '/images/checkered.jpg';
  const grid = useRef<number[][]>([]);

  /**
   * Handle the click event on the grid generating the start, finish, and blockers
   * @param e The click event
   * @returns void
   */
  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    const existingCircle = layerRef.current?.getChildren(c => c.attrs.squareId === e.target._id);

    if (existingCircle?.length && existingCircle?.length > 0) {
      existingCircle.forEach(c => {
        c.destroy();
      })
      return;
    }

    const newCircle = new Circle({
      name: 'start',
      squareId: e.target._id,
      fill: 'green',
      fillPatternImage: image,
      fillPriority: 'color',
      radius: 12,
      x: e.target.getAttr('x') + (e.target.getAttr('width') / 2),
      y: e.target.getAttr('y') + (e.target.getAttr('height') / 2),
      coords: e.target.getAttr('coords')
    });

    newCircle.on('click', (e) => {
      const node = e.target as Circle;
      if (node.fill() === 'red') {
        node.destroy();
      } else if (node.fillPriority() === 'color') {
        node.name('finish');
        node.fillPriority('pattern');
      } else {
        node.name('');
        node.fill('red');
        node.fillPriority('color');
      }
    })

    layerRef.current?.add(newCircle)
  }

  /**
   * Get the rows for the grid
   * @param y The y coordinate for positiong the row in the grid
   * @param index The index of the row used as the y coordinate
   * @returns An array of rectangles for the grid
   */
  const getRows = (y: number, index: number) => {
    const array = [];
    for (let i = 0; i < 10; i++) {
      array.push(<RectElement width={50} height={50} fill='#666' x={60 * i} y={y} onClick={(e) => handleClick(e)} coords={[i, index]} />);
      grid.current.push([i, index]);
    }
    return array;
  }

  /**
   * Generate the rectangles for the grid
   * @returns An array of rectangles
   */
  const rectangles = () => {
    const array = [];

    for (let i = 0; i < 12; i++) {
      array.push(...getRows(60 * i, i));
    }

    return array;
  }

  /**
   * Get the neighbors of the current position
   * @param position The current position
   * @returns The current position's neighbors
   */
  const getNeighbors = (position: number[]) => {
    if (!position) {
      return [];
    }

    const [x, y] = position;
    const neighbors: number[][] = [];
    const blockers = layerRef.current?.getChildren(c => c.getAttr('fill') === 'red');
    if (grid.current.find(c => c[0] === x - 1 && c[1] === y) && !blockers?.find(b => b.getAttr('coords')[0] === x - 1 && b.getAttr('coords')[1] === y)) {
      neighbors.push([x - 1, y]);
    }
    if (grid.current.find(c => c[0] === x + 1 && c[1] === y) && !blockers?.find(b => b.getAttr('coords')[0] === x + 1 && b.getAttr('coords')[1] === y)) {
      neighbors.push([x + 1, y]);
    }
    if (grid.current.find(c => c[0] === x && c[1] === y - 1) && !blockers?.find(b => b.getAttr('coords')[0] === x && b.getAttr('coords')[1] === y - 1)) {
      neighbors.push([x, y - 1]);
    }
    if (grid.current.find(c => c[0] === x && c[1] === y + 1) && !blockers?.find(b => b.getAttr('coords')[0] === x && b.getAttr('coords')[1] === y + 1)) {
      neighbors.push([x, y + 1]);
    }
    return neighbors;
  }

  /**
   * Get the next move based on the current position
   * @param neighbors The current position's neighbors
   * @param moves The list of previous moves
   * @param currentPoint The current coordinates
   * @returns The next move
   */
  const getNextMovePriority = (endPoint: number[], currentPoint: number[]) => {
    console.log(endPoint[0], endPoint[1], currentPoint[0], currentPoint[1])
    return Math.abs(endPoint[0] - currentPoint[0]) + Math.abs(endPoint[1] - currentPoint[1]);
  }

  /**
   * Clear the lines from the canvas
   */
  const clearLines = () => {
    const destroyableNodes: Array<Line> = []
    layerRef.current?.getChildren().forEach(c => {
      if (c instanceof Line) {
       destroyableNodes.push(c);
      }
    })

    const length = destroyableNodes.length;

    for (let i = 0; i < length; i++) {
      destroyableNodes[i].destroy();
    }

    setTimeout(() => {
      layerRef.current?.draw();
    }, 300)
  }

  /**
   * Search for the quickest path to the goal
   * @returns void
   */
  const solve = () => {
    clearLines()
    const startPoint = layerRef.current?.getChildren(c => c.name() === 'start')[0]?.getAttr('coords');
    const endPoint = layerRef.current?.getChildren(c => c.name() === 'finish')[0]?.getAttr('coords');

    if (!endPoint || !startPoint) {
      return;
    }

    const queue: { coords: number[], priority: number }[] = [{ coords: startPoint, priority: 0}];
    const cameFrom: { [key: string]: number[] } = {};
    const movementCosts: { [key: string]: number } = {};

    while (queue.length > 0) {
      const currentRect = queue.shift();
      movementCosts[`${currentRect?.coords[0]},${currentRect?.coords[1]}`] = currentRect?.priority || 0;

      if (!currentRect) {
        break;
      }

      if (currentRect.coords[0] === endPoint[0] && currentRect.coords[1] === endPoint[1]) {
        break;
      }

      const neighbors = getNeighbors(currentRect.coords);

      neighbors.forEach(coords => {
        const newMovementCost = movementCosts[`${currentRect.coords[0]},${currentRect.coords[1]}`] + 1;
        
        if (!Object.keys(movementCosts).find(k => k === `${coords[0]},${coords[1]}`) || newMovementCost < movementCosts[`${coords[0]},${coords[1]}`]) {
          movementCosts[`${coords[0]},${coords[1]}`] = newMovementCost;
          queue.push({ coords: coords, priority: newMovementCost + getNextMovePriority(endPoint, coords) });
          cameFrom[`${coords[0]},${coords[1]}`] = currentRect.coords;
        }
      })

      queue.sort((a, b) => a.priority - b.priority);
    }

    let current = endPoint;
    const path = [];
    let noPath = false;

    while (current !== startPoint) {
      path.push(current);
      if (!current) {
        alert('No path found');
        noPath = true;
        break;
      }
      current = cameFrom[`${current[0]},${current[1]}`];
    }

    if (noPath) {
      return;
    }

    path.push(startPoint);
    path.reverse();

    const line = new Line({
      stroke: 'blue',
      strokeWidth: 5,
      lineCap: 'round',
      lineJoin: 'round',
      points: [],
    })

    const points: number[] = [];

    path.forEach(m => {
      points.push(m[0] * 60 + 25, m[1] * 60 + 25);
    })
    
    line.points(points);
    layerRef.current?.add(line);
    layerRef.current?.batchDraw();
  }

  /**
   * Clear the canvas
   */
  const clear = () => {
    const destroyableNodes: Array<Circle | Line> = []
    layerRef.current?.getChildren().forEach(c => {
      if (c instanceof Rect) {
        c.fill('#666')
      }
      if (c instanceof Circle || c instanceof Line) {
       destroyableNodes.push(c);
      }
    })

    const length = destroyableNodes.length;

    // use length variable to ensure destroying the node does not mutate the array length
    for (let i = 0; i < length; i++) {
      destroyableNodes[i].destroy();
    }

    setTimeout(() => {
      layerRef.current?.draw();
    }, 300)
  }

  const generateMaze = () => {
    clear();
    const blockers = layerRef.current?.getChildren(c => c.getAttr('fill') === 'red');
    const length = blockers?.length || 0;
    for (let i = 0; i < length; i++) {
      if (blockers) {
        blockers[i].destroy();
      }
    }

    let startCoords = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
    let goalCoords = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];

    while (startCoords[0] === goalCoords[0] && startCoords[1] === goalCoords[1]) {
      goalCoords = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
    }

    while (!grid.current.find(c => c[0] === startCoords[0] && c[1] === startCoords[1])) {
      startCoords = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
    }

    while (!grid.current.find(c => c[0] === goalCoords[0] && c[1] === goalCoords[1])) {
      goalCoords = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
    }

    const start = new Circle({
      name: 'start',
      fill: 'green',
      fillPatternImage: image,
      fillPriority: 'color',
      radius: 12,
      x: startCoords[0] * 60 + 25,
      y: startCoords[1] * 60 + 25,
      coords: startCoords
    });

    layerRef.current?.add(start);

    const finish = new Circle({
      name: 'finish',
      fillPriority: 'pattern',
      fillPatternImage: image,
      radius: 12,
      x: goalCoords[0] * 60 + 25,
      y: goalCoords[1] * 60 + 25,
      coords: goalCoords
    });

    layerRef.current?.add(finish);

    const randomBlockers = Math.floor(Math.random() * 20) + 30;

    for (let i = 0; i < randomBlockers; i++) {
      const randomX = Math.floor(Math.random() * 10);
      const randomY = Math.floor(Math.random() * 10);
      if (startCoords[0] === randomX && startCoords[1] === randomY) {
        continue;
      }
      if (goalCoords[0] === randomX && goalCoords[1] === randomY) {
        continue;
      }
      const blocker = new Circle({
        name: '',
        fill: 'red',
        fillPriority: 'color',
        radius: 12,
        x: randomX * 60 + 25,
        y: randomY * 60 + 25,
        coords: [randomX, randomY]
      });

      layerRef.current?.add(blocker);
    }

    layerRef.current?.draw();
  }

  return (
    <>
      <Stage width={600} height={750}>
        <LayerElement ref={layerRef}>
          {rectangles()}
        </LayerElement>
      </Stage>
      <div className='flex-row text-center'>
        <button onClick={solve} style={{marginRight: '1em'}}>
          Solve
        </button>
        <button onClick={clear} style={{marginRight: '1em'}}>
          Clear
        </button>
        <button onClick={generateMaze}>
          Generate
        </button>
      </div>
    </>
  )
}

export default Canvas;