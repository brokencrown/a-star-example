import { Rect } from "konva/lib/shapes/Rect";

export declare class Move extends Rect {
  direction?: string;
  moveType?: 'valid' | 'invalid';
}