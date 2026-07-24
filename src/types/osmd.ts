// export interface GraphicMeasureLike {
//   PositionAndShape: {
//     AbsolutePosition: {
//       x: number;
//     };
//     Size?: {
//       width: number;
//     };
//   };
// }

// export interface GraphicSheetLike {
//   MeasureList: GraphicMeasureLike[][];
// }

// export interface CursorIteratorLike {
//   CurrentMeasureIndex: number;
//   EndReached: boolean;
// }

// export interface CursorLike {
//   iterator: CursorIteratorLike;
//   reset(): void;
//   next(): void;
//   update(): void;
// }
//경로 : C:\project\MuseReview\FE\src\types\osmd.ts
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
