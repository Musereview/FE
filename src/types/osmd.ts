export interface GraphicMeasureLike {
  PositionAndShape: {
    AbsolutePosition: {
      x: number;
    };
    Size?: {
      width: number;
    };
  };
}

export interface GraphicSheetLike {
  MeasureList: GraphicMeasureLike[][];
}

export interface CursorIteratorLike {
  CurrentMeasureIndex: number;
  EndReached: boolean;
}

export interface CursorLike {
  iterator: CursorIteratorLike;
  reset(): void;
  next(): void;
  update(): void;
}
